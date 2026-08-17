namespace PropertyCollectionForecast.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using PropertyCollectionForecast.Domain.Entities;

public sealed class ForecastDbContext : DbContext
{
    public ForecastDbContext(DbContextOptions<ForecastDbContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<Installment> Installments => Set<Installment>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ForecastDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
