namespace PropertyCollectionForecast.Domain.Entities;

public sealed class Customer : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }

    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}
