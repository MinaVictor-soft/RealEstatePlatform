namespace PropertyCollectionForecast.Domain.Entities;

using PropertyCollectionForecast.Domain;

public sealed class Installment : BaseEntity
{
    public Guid ContractId { get; set; }
    public Contract? Contract { get; set; }

    public int SequenceNumber { get; set; }
    public DateOnly DueDate { get; set; }
    public decimal ExpectedAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public InstallmentStatus Status { get; set; } = InstallmentStatus.Pending;
}
