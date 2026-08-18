namespace PropertyCollectionForecast.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

public sealed class ForecastDbContextFactory : IDesignTimeDbContextFactory<ForecastDbContext>
{
    public ForecastDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ForecastDbContext>();
        optionsBuilder.UseSqlite("Data Source=forecast.db");
        return new ForecastDbContext(optionsBuilder.Options);
    }
}
