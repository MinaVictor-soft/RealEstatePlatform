namespace PropertyCollectionForecast.Tests;

using PropertyCollectionForecast.Application.Calculation;
using PropertyCollectionForecast.Application.Exceptions;
using PropertyCollectionForecast.Domain;
using PropertyCollectionForecast.Domain.Entities;

public sealed class ContractCalculationServiceTests
{
    private readonly ContractCalculationService _service = new();

    [Fact]
    public void Generates_equal_monthly_installments()
    {
        var contract = CreateContract(
            contractValue: 3600000m,
            downPaymentPercentage: 20m,
            installments: 24,
            frequency: PaymentFrequency.Monthly,
            firstInstallmentDate: new DateOnly(2026, 9, 1));

        var schedule = _service.GenerateSchedule(contract);

        Assert.Equal(24, schedule.Count);
        Assert.Equal(new DateOnly(2026, 9, 1), schedule[0].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 1), schedule[1].DueDate);
        Assert.Equal(120000m, schedule[0].ExpectedAmount);
        Assert.All(schedule, installment => Assert.Equal(120000m, installment.ExpectedAmount));
    }

    [Fact]
    public void Generates_equal_quarterly_installments()
    {
        var contract = CreateContract(
            contractValue: 120000m,
            downPaymentAmount: 0m,
            installments: 4,
            frequency: PaymentFrequency.Quarterly,
            firstInstallmentDate: new DateOnly(2026, 1, 1));

        var schedule = _service.GenerateSchedule(contract);

        Assert.Equal(4, schedule.Count);
        Assert.Equal(new DateOnly(2026, 1, 1), schedule[0].DueDate);
        Assert.Equal(new DateOnly(2026, 4, 1), schedule[1].DueDate);
        Assert.Equal(new DateOnly(2026, 7, 1), schedule[2].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 1), schedule[3].DueDate);
        Assert.All(schedule, installment => Assert.Equal(30000m, installment.ExpectedAmount));
    }

    [Fact]
    public void Calculates_down_payment_correctly()
    {
        var contract = CreateContract(3600000m, downPaymentPercentage: 20m, installments: 24, frequency: PaymentFrequency.Monthly, firstInstallmentDate: new DateOnly(2026, 9, 1));

        Assert.Equal(720000m, _service.CalculateDownPaymentAmount(contract));
    }

    [Fact]
    public void Calculates_outstanding_correctly()
    {
        Assert.Equal(2600000m, _service.CalculateOutstanding(3600000m, 1000000m));
    }

    [Fact]
    public void Calculates_collection_percentage_correctly()
    {
        Assert.Equal(50m, _service.CalculateCollectionPercentage(1800000m, 3600000m));
    }

    [Fact]
    public void Calculates_forecast_correctly()
    {
        var contract = CreateContract(
            contractValue: 3600000m,
            downPaymentPercentage: 20m,
            installments: 24,
            frequency: PaymentFrequency.Monthly,
            firstInstallmentDate: new DateOnly(2026, 9, 1));

        foreach (var installment in _service.GenerateSchedule(contract))
        {
            contract.Installments.Add(installment);
        }

        var forecast = _service.CalculateForecast(contract, 3, new DateOnly(2026, 8, 17));

        Assert.Equal(360000m, forecast.ExpectedCollection);
        Assert.Equal(360000m, forecast.ProjectedCollected);
        Assert.Equal(10m, forecast.ProjectedCollectionPercentage);
        Assert.Equal(3600000m, forecast.Outstanding);
    }

    [Fact]
    public void Rejects_invalid_configuration()
    {
        var contract = CreateContract(
            contractValue: 0m,
            downPaymentPercentage: 20m,
            installments: 24,
            frequency: PaymentFrequency.Monthly,
            firstInstallmentDate: new DateOnly(2026, 9, 1));

        Assert.Throws<DomainValidationException>(() => _service.GenerateSchedule(contract));
    }

    private static Contract CreateContract(
        decimal contractValue,
        decimal? downPaymentPercentage = null,
        decimal? downPaymentAmount = null,
        int installments = 24,
        PaymentFrequency frequency = PaymentFrequency.Monthly,
        DateOnly? firstInstallmentDate = null)
    {
        return new Contract
        {
            ContractDate = new DateOnly(2026, 8, 1),
            ContractValue = contractValue,
            DownPaymentPercentage = downPaymentPercentage,
            DownPaymentAmount = downPaymentAmount,
            InstallmentType = InstallmentType.Equal,
            Frequency = frequency,
            NumberOfInstallments = installments,
            FirstInstallmentDate = firstInstallmentDate ?? new DateOnly(2026, 9, 1)
        };
    }
}
