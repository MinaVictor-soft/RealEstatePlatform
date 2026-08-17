namespace PropertyCollectionForecast.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using PropertyCollectionForecast.Application.Abstractions;
using PropertyCollectionForecast.Application.Contracts;

[ApiController]
[Route("api/contracts")]
public sealed class ContractsController : ControllerBase
{
    private readonly IContractService _service;

    public ContractsController(IContractService service)
    {
        _service = service;
    }

    [HttpGet]
    public Task<IReadOnlyList<ContractResponse>> GetAll(CancellationToken cancellationToken)
        => _service.GetContractsAsync(cancellationToken);

    [HttpGet("dashboard")]
    public Task<ContractsDashboardResponse> GetDashboard([FromQuery] int months = 3, CancellationToken cancellationToken = default)
        => _service.GetDashboardAsync(months, cancellationToken);

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _service.DeleteContractAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<ContractResponse>> Create([FromBody] CreateContractRequest request, CancellationToken cancellationToken)
    {
        var contract = await _service.CreateContractAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = contract.Id }, contract);
    }

    [HttpPost("{id:guid}/generate-schedule")]
    public Task<ContractResponse> GenerateSchedule(Guid id, CancellationToken cancellationToken)
        => _service.GenerateScheduleAsync(id, cancellationToken);

    [HttpGet("{id:guid}")]
    public Task<ContractResponse> GetById(Guid id, CancellationToken cancellationToken)
        => _service.GetContractAsync(id, cancellationToken);

    [HttpGet("{id:guid}/summary")]
    public Task<ContractResponse> GetSummary(Guid id, CancellationToken cancellationToken)
        => _service.GetContractAsync(id, cancellationToken);

    [HttpGet("{id:guid}/installments")]
    public Task<IReadOnlyList<InstallmentResponse>> GetInstallments(Guid id, CancellationToken cancellationToken)
        => _service.GetInstallmentsAsync(id, cancellationToken);

    [HttpPost("{id:guid}/payments")]
    public Task<ContractResponse> RecordPayment(Guid id, [FromBody] RecordPaymentRequest request, CancellationToken cancellationToken)
        => _service.RecordPaymentAsync(id, request, cancellationToken);

    [HttpGet("{id:guid}/forecast")]
    public Task<ForecastResponse> GetForecast(Guid id, [FromQuery] int months, CancellationToken cancellationToken)
        => _service.GetForecastAsync(id, months, cancellationToken);
}
