namespace PropertyCollectionForecast.Domain.Entities;

using PropertyCollectionForecast.Domain;

public sealed class Contract : BaseEntity
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid UnitId { get; set; }
    public Unit? Unit { get; set; }

    public DateOnly ContractDate { get; set; }
    public decimal ContractValue { get; set; }
    public decimal? DownPaymentPercentage { get; set; }
    public decimal? DownPaymentAmount { get; set; }
    public InstallmentType InstallmentType { get; set; } = InstallmentType.Equal;
    public PaymentFrequency Frequency { get; set; } = PaymentFrequency.Monthly;
    public int NumberOfInstallments { get; set; }
    public DateOnly FirstInstallmentDate { get; set; }
    public ContractStatus Status { get; set; } = ContractStatus.Draft;

    public ICollection<Installment> Installments { get; set; } = new List<Installment>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
