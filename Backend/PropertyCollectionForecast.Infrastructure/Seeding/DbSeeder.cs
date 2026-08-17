namespace PropertyCollectionForecast.Infrastructure.Seeding;

using Microsoft.EntityFrameworkCore;
using PropertyCollectionForecast.Application.Abstractions;
using PropertyCollectionForecast.Domain;
using PropertyCollectionForecast.Domain.Entities;
using PropertyCollectionForecast.Infrastructure.Persistence;

public interface IDbSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}

public sealed class DbSeeder : IDbSeeder
{
    private static readonly Guid Customer1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid Customer2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid Unit1Id = Guid.Parse("33333333-3333-3333-3333-333333333333");
    private static readonly Guid Unit2Id = Guid.Parse("44444444-4444-4444-4444-444444444444");
    private static readonly Guid Contract1Id = Guid.Parse("55555555-5555-5555-5555-555555555555");

    private readonly ForecastDbContext _db;
    private readonly IContractCalculationService _calculationService;

    public DbSeeder(ForecastDbContext db, IContractCalculationService calculationService)
    {
        _db = db;
        _calculationService = calculationService;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await _db.Customers.AnyAsync(cancellationToken))
        {
            return;
        }

        var customers = new[]
        {
            new Customer { Id = Customer1Id, Name = "Ahmed Hassan", Phone = "+201000000001", Email = "ahmed@example.com" },
            new Customer { Id = Customer2Id, Name = "Mona Ali", Phone = "+201000000002", Email = "mona@example.com" }
        };

        var units = new[]
        {
            new Unit { Id = Unit1Id, ProjectName = "Palm Residence", Code = "PR-101", Area = 145.5m, UnitPrice = 3600000m, Status = "Reserved" },
            new Unit { Id = Unit2Id, ProjectName = "Palm Residence", Code = "PR-102", Area = 180m, UnitPrice = 4200000m, Status = "Available" }
        };

        var contract = new Contract
        {
            Id = Contract1Id,
            CustomerId = Customer1Id,
            UnitId = Unit1Id,
            ContractDate = new DateOnly(2026, 8, 1),
            ContractValue = 3600000m,
            DownPaymentPercentage = 20m,
            InstallmentType = InstallmentType.Equal,
            Frequency = PaymentFrequency.Monthly,
            NumberOfInstallments = 24,
            FirstInstallmentDate = new DateOnly(2026, 9, 1),
            Status = ContractStatus.Active
        };

        var schedule = _calculationService.GenerateSchedule(contract);
        foreach (var installment in schedule)
        {
            contract.Installments.Add(installment);
        }

        _db.Customers.AddRange(customers);
        _db.Units.AddRange(units);
        _db.Contracts.Add(contract);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
