namespace PropertyCollectionForecast.Application.Contracts;

using System.ComponentModel.DataAnnotations;
using PropertyCollectionForecast.Domain;

public sealed class CreateContractRequest
{
    [Required]
    public Guid CustomerId { get; set; }

    [Required]
    public Guid UnitId { get; set; }

    [Required]
    public DateOnly ContractDate { get; set; }

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal ContractValue { get; set; }

    [Range(typeof(decimal), "0", "100")]
    public decimal? DownPaymentPercentage { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? DownPaymentAmount { get; set; }

    [Required]
    public InstallmentType InstallmentType { get; set; } = InstallmentType.Equal;

    [Required]
    public PaymentFrequency Frequency { get; set; } = PaymentFrequency.Monthly;

    [Range(1, int.MaxValue)]
    public int NumberOfInstallments { get; set; }

    [Required]
    public DateOnly? FirstInstallmentDate { get; set; }
}

public sealed class RecordPaymentRequest
{
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Amount { get; set; }

    public DateOnly? PaymentDate { get; set; }
    public string? Reference { get; set; }
}

public sealed class ContractResponse
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public Guid UnitId { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public DateOnly ContractDate { get; set; }
    public decimal ContractValue { get; set; }
    public decimal? DownPaymentPercentage { get; set; }
    public decimal? DownPaymentAmount { get; set; }
    public decimal CalculatedDownPaymentAmount { get; set; }
    public InstallmentType InstallmentType { get; set; }
    public PaymentFrequency Frequency { get; set; }
    public int NumberOfInstallments { get; set; }
    public DateOnly FirstInstallmentDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalPaid { get; set; }
    public decimal Outstanding { get; set; }
    public decimal CollectionPercentage { get; set; }
}

public sealed class InstallmentResponse
{
    public Guid Id { get; set; }
    public int SequenceNumber { get; set; }
    public DateOnly DueDate { get; set; }
    public decimal ExpectedAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public InstallmentStatus Status { get; set; }
}

public sealed class ForecastResponse
{
    public int Months { get; set; }
    public decimal ContractValue { get; set; }
    public decimal CurrentPaid { get; set; }
    public decimal ExpectedCollection { get; set; }
    public decimal ProjectedCollected { get; set; }
    public decimal Outstanding { get; set; }
    public decimal ProjectedCollectionPercentage { get; set; }
}

public sealed class ContractForecastResponse
{
    public ContractResponse Contract { get; set; } = new();
    public ForecastResponse Forecast { get; set; } = new();
}

public sealed class ContractsDashboardResponse
{
    public int Months { get; set; }
    public int TotalContracts { get; set; }
    public decimal TotalContractValue { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalOutstanding { get; set; }
    public decimal ExpectedCollection { get; set; }
    public decimal ProjectedCollected { get; set; }
    public decimal ProjectedCollectionPercentage { get; set; }
    public IReadOnlyList<ContractForecastResponse> Contracts { get; set; } = Array.Empty<ContractForecastResponse>();
}
