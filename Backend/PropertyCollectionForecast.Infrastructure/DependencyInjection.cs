namespace PropertyCollectionForecast.Infrastructure;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PropertyCollectionForecast.Application.Abstractions;
using PropertyCollectionForecast.Infrastructure.Persistence;
using PropertyCollectionForecast.Infrastructure.Seeding;
using PropertyCollectionForecast.Infrastructure.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ForecastDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IContractService, ContractService>();
        services.AddScoped<IDbSeeder, DbSeeder>();
        return services;
    }
}
