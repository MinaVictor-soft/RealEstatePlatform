namespace PropertyCollectionForecast.Application.Abstractions;

using PropertyCollectionForecast.Application.Contracts;

public interface IContractService
{
    Task<ContractResponse> CreateContractAsync(CreateContractRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ContractResponse>> GetContractsAsync(CancellationToken cancellationToken = default);
    Task<ContractsDashboardResponse> GetDashboardAsync(int months, CancellationToken cancellationToken = default);
    Task DeleteContractAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ContractResponse> GenerateScheduleAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ContractResponse> GetContractAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InstallmentResponse>> GetInstallmentsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ContractResponse> RecordPaymentAsync(Guid id, RecordPaymentRequest request, CancellationToken cancellationToken = default);
    Task<ForecastResponse> GetForecastAsync(Guid id, int months, CancellationToken cancellationToken = default);
}
