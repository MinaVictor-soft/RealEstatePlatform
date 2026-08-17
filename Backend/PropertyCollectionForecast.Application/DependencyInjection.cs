namespace PropertyCollectionForecast.Application;

using Microsoft.Extensions.DependencyInjection;
using PropertyCollectionForecast.Application.Abstractions;
using PropertyCollectionForecast.Application.Calculation;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IContractCalculationService, ContractCalculationService>();
        return services;
    }
}
