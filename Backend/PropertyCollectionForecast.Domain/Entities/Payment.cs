namespace PropertyCollectionForecast.Domain.Entities;

public sealed class Payment : BaseEntity
{
    public Guid ContractId { get; set; }
    public Contract? Contract { get; set; }

    public DateOnly PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string? Reference { get; set; }
}
