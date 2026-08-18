namespace PropertyCollectionForecast.Tests;

using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using PropertyCollectionForecast.Application.Calculation;
using PropertyCollectionForecast.Application.Contracts;
using PropertyCollectionForecast.Application.Exceptions;
using PropertyCollectionForecast.Domain;
using PropertyCollectionForecast.Domain.Entities;
using PropertyCollectionForecast.Infrastructure.Persistence;
using PropertyCollectionForecast.Infrastructure.Services;

public sealed class ContractServiceFlowTests
{
    [Fact]
    public async Task Executes_complete_contract_payment_forecast_flow()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        await using (var setupDb = CreateDbContext(connection))
        {
            await SeedAsync(setupDb);
        }

        ContractResponse create;
        using (var db = CreateDbContext(connection))
        {
            var service = new ContractService(db, new ContractCalculationService());
            create = await service.CreateContractAsync(new CreateContractRequest
            {
                CustomerId = CustomerId,
                UnitId = UnitId,
                ContractDate = new DateOnly(2026, 8, 1),
                ContractValue = 3600000m,
                DownPaymentPercentage = 20m,
                InstallmentType = InstallmentType.Equal,
                Frequency = PaymentFrequency.Monthly,
                NumberOfInstallments = 24,
                FirstInstallmentDate = new DateOnly(2026, 9, 1)
            });
        }

        Assert.Equal(720000m, create.CalculatedDownPaymentAmount);

        using (var db = CreateDbContext(connection))
        {
            var service = new ContractService(db, new ContractCalculationService());
            await service.GenerateScheduleAsync(create.Id);
        }

        ContractResponse afterGeneration;
        using (var db = CreateDbContext(connection))
        {
            var service = new ContractService(db, new ContractCalculationService());
            afterGeneration = await service.GetContractAsync(create.Id);
        }

        Assert.Equal(ContractStatus.Active, Enum.Parse<ContractStatus>(afterGeneration.Status));

        IReadOnlyList<InstallmentResponse> installmentsAfterGeneration;
        using (var db = CreateDbContext(connection))
        {
            var service = new ContractService(db, new ContractCalculationService());
            installmentsAfterGeneration = await service.GetInstallmentsAsync(create.Id);
        }

        Assert.Equal(24, installmentsAfterGeneration.Count);
        Assert.Equal(new DateOnly(2026, 9, 1), installmentsAfterGeneration[0].DueDate);

        ContractResponse paid;
        using (var db = CreateDbContext(connection))
        {
            var service = new ContractService(db, new ContractCalculationService());
            paid = await service.RecordPaymentAsync(create.Id, new RecordPaymentRequest { Amount = 120000m });
        }

        Assert.Equal(120000m, paid.TotalPaid);
        Assert.Equal(3480000m, paid.Outstanding);
        Assert.Equal(3.33m, Math.Round(paid.CollectionPercentage, 2));

        IReadOnlyList<InstallmentResponse> installments;
        using (var db = CreateDbContext(connection))
        {
            var service = new ContractService(db, new ContractCalculationService());
            installments = await service.GetInstallmentsAsync(create.Id);
        }

        Assert.Equal(InstallmentStatus.Paid, installments[0].Status);

        ForecastResponse forecast;
        using (var db = CreateDbContext(connection))
        {
            var service = new ContractService(db, new ContractCalculationService());
            forecast = await service.GetForecastAsync(create.Id, 3);
        }

        Assert.Equal(360000m, forecast.ExpectedCollection);
        Assert.Equal(480000m, forecast.ProjectedCollected);
        Assert.Equal(13.33m, Math.Round(forecast.ProjectedCollectionPercentage, 2));
    }

    [Fact]
    public async Task Rejects_generating_schedule_twice()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        await using (var setupDb = CreateDbContext(connection))
        {
            await SeedAsync(setupDb);
        }

        var contractId = await CreateAndGenerateAsync(connection);

        using var db = CreateDbContext(connection);
        var service = new ContractService(db, new ContractCalculationService());
        var ex = await Assert.ThrowsAsync<DomainValidationException>(() => service.GenerateScheduleAsync(contractId));
        Assert.Equal("Payment schedule already exists.", ex.Errors["Schedule"][0]);
    }

    [Fact]
    public async Task Rejects_invalid_payment_amount()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        await using (var setupDb = CreateDbContext(connection))
        {
            await SeedAsync(setupDb);
        }

        var contractId = await CreateAndGenerateAsync(connection);

        using var db = CreateDbContext(connection);
        var service = new ContractService(db, new ContractCalculationService());
        await Assert.ThrowsAsync<DomainValidationException>(() => service.RecordPaymentAsync(contractId, new RecordPaymentRequest { Amount = 0m }));
    }

    [Fact]
    public async Task Rejects_forecast_months_outside_supported_values()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        await using (var setupDb = CreateDbContext(connection))
        {
            await SeedAsync(setupDb);
        }

        var contractId = await CreateAndGenerateAsync(connection);

        using var db = CreateDbContext(connection);
        var service = new ContractService(db, new ContractCalculationService());
        await Assert.ThrowsAsync<DomainValidationException>(() => service.GetForecastAsync(contractId, 2));
    }

    private static readonly Guid CustomerId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static readonly Guid UnitId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    private static ForecastDbContext CreateDbContext(SqliteConnection connection)
    {
        var options = new DbContextOptionsBuilder<ForecastDbContext>()
            .UseSqlite(connection)
            .Options;

        var db = new ForecastDbContext(options);
        db.Database.EnsureCreated();
        return db;
    }

    private static async Task SeedAsync(ForecastDbContext db)
    {
        db.Customers.Add(new Customer { Id = CustomerId, Name = "Ahmed Mohamed", Phone = "01000000000", Email = "ahmed@example.com" });
        db.Units.Add(new Unit { Id = UnitId, ProjectName = "Palm Residence", Code = "M38-101", Area = 120m, UnitPrice = 3600000m, Status = "Available" });
        await db.SaveChangesAsync();
    }

    private static async Task<Guid> CreateAndGenerateAsync(SqliteConnection connection)
    {
        Guid contractId;
        await using (var createDb = CreateDbContext(connection))
        {
            var service = new ContractService(createDb, new ContractCalculationService());
            var contract = await service.CreateContractAsync(new CreateContractRequest
            {
                CustomerId = CustomerId,
                UnitId = UnitId,
                ContractDate = new DateOnly(2026, 8, 1),
                ContractValue = 3600000m,
                DownPaymentPercentage = 20m,
                InstallmentType = InstallmentType.Equal,
                Frequency = PaymentFrequency.Monthly,
                NumberOfInstallments = 24,
                FirstInstallmentDate = new DateOnly(2026, 9, 1)
            });

            contractId = contract.Id;
        }

        await using (var generateDb = CreateDbContext(connection))
        {
            var service = new ContractService(generateDb, new ContractCalculationService());
            await service.GenerateScheduleAsync(contractId);
        }

        return contractId;
    }
}
