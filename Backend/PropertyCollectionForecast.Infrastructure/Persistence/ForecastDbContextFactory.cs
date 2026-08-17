namespace PropertyCollectionForecast.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

public sealed class ForecastDbContextFactory : IDesignTimeDbContextFactory<ForecastDbContext>
{
    public ForecastDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ForecastDbContext>();
        optionsBuilder.UseSqlServer("Server=.;Database=PropertyCollectionForecast;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True");
        return new ForecastDbContext(optionsBuilder.Options);
    }
}
