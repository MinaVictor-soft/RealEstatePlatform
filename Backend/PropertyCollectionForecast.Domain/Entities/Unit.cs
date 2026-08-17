namespace PropertyCollectionForecast.Domain.Entities;

public sealed class Unit : BaseEntity
{
    public string ProjectName { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public decimal Area { get; set; }
    public decimal UnitPrice { get; set; }
    public string Status { get; set; } = "Available";

    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}
