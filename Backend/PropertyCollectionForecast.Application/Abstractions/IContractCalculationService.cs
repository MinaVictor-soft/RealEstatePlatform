namespace PropertyCollectionForecast.Application.Abstractions;

using PropertyCollectionForecast.Domain.Entities;

public interface IContractCalculationService
{
    decimal CalculateDownPaymentAmount(Contract contract);
    IReadOnlyList<Installment> GenerateSchedule(Contract contract);
    decimal CalculateTotalPaid(Contract contract);
    decimal CalculateOutstanding(decimal contractValue, decimal totalPaid);
    decimal CalculateCollectionPercentage(decimal totalPaid, decimal contractValue);
    ForecastResult CalculateForecast(Contract contract, int months, DateOnly asOf);
    void ValidateConfiguration(Contract contract);
}

public sealed record ForecastResult(decimal ExpectedCollection, decimal ProjectedCollected, decimal ProjectedCollectionPercentage, decimal Outstanding);
