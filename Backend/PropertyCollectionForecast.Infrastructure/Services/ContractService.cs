namespace PropertyCollectionForecast.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using PropertyCollectionForecast.Application.Abstractions;
using PropertyCollectionForecast.Application.Contracts;
using PropertyCollectionForecast.Application.Exceptions;
using PropertyCollectionForecast.Domain;
using PropertyCollectionForecast.Domain.Entities;
using PropertyCollectionForecast.Infrastructure.Persistence;

public sealed class ContractService : IContractService
{
    private readonly ForecastDbContext _db;
    private readonly IContractCalculationService _calculationService;

    public ContractService(ForecastDbContext db, IContractCalculationService calculationService)
    {
        _db = db;
        _calculationService = calculationService;
    }

    public async Task<ContractResponse> CreateContractAsync(CreateContractRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureCustomerAndUnitExistAsync(request.CustomerId, request.UnitId, cancellationToken);

        var contract = new Contract
        {
            CustomerId = request.CustomerId,
            UnitId = request.UnitId,
            ContractDate = request.ContractDate,
            ContractValue = request.ContractValue,
            DownPaymentPercentage = request.DownPaymentPercentage,
            DownPaymentAmount = request.DownPaymentAmount,
            InstallmentType = request.InstallmentType,
            Frequency = request.Frequency,
            NumberOfInstallments = request.NumberOfInstallments,
            FirstInstallmentDate = request.FirstInstallmentDate!.Value,
            Status = ContractStatus.Draft
        };

        _calculationService.ValidateConfiguration(contract);

        _db.Contracts.Add(contract);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetContractAsync(contract.Id, cancellationToken);
    }

    public async Task<IReadOnlyList<ContractResponse>> GetContractsAsync(CancellationToken cancellationToken = default)
    {
        var contracts = await _db.Contracts
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.Unit)
            .Include(x => x.Payments)
            .OrderByDescending(x => x.ContractDate)
            .ThenByDescending(x => x.Id)
            .ToListAsync(cancellationToken);

        return contracts.Select(MapContract).ToList();
    }

    public async Task<ContractsDashboardResponse> GetDashboardAsync(int months, CancellationToken cancellationToken = default)
    {
        var contracts = await _db.Contracts
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.Unit)
            .Include(x => x.Installments)
            .Include(x => x.Payments)
            .OrderByDescending(x => x.ContractDate)
            .ThenByDescending(x => x.Id)
            .ToListAsync(cancellationToken);

        var items = contracts.Select(contract =>
        {
            var forecast = _calculationService.CalculateForecast(contract, months, DateOnly.FromDateTime(DateTime.UtcNow.Date));
            return new ContractForecastResponse
            {
                Contract = MapContract(contract),
                Forecast = new ForecastResponse
                {
                    Months = months,
                    ContractValue = contract.ContractValue,
                    CurrentPaid = _calculationService.CalculateTotalPaid(contract),
                    ExpectedCollection = forecast.ExpectedCollection,
                    ProjectedCollected = forecast.ProjectedCollected,
                    Outstanding = forecast.Outstanding,
                    ProjectedCollectionPercentage = forecast.ProjectedCollectionPercentage
                }
            };
        }).ToList();

        var totalContractValue = contracts.Sum(x => x.ContractValue);
        var totalPaid = contracts.Sum(x => _calculationService.CalculateTotalPaid(x));
        var totalOutstanding = contracts.Sum(x => _calculationService.CalculateOutstanding(x.ContractValue, _calculationService.CalculateTotalPaid(x)));
        var expectedCollection = items.Sum(x => x.Forecast.ExpectedCollection);
        var projectedCollected = items.Sum(x => x.Forecast.ProjectedCollected);

        return new ContractsDashboardResponse
        {
            Months = months,
            TotalContracts = contracts.Count,
            TotalContractValue = totalContractValue,
            TotalPaid = totalPaid,
            TotalOutstanding = totalOutstanding,
            ExpectedCollection = expectedCollection,
            ProjectedCollected = projectedCollected,
            ProjectedCollectionPercentage = _calculationService.CalculateCollectionPercentage(projectedCollected, totalContractValue),
            Contracts = items
        };
    }

    public async Task DeleteContractAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var contract = await _db.Contracts.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Contract not found.");

        _db.Contracts.Remove(contract);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ContractResponse> GenerateScheduleAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var contract = await _db.Contracts
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.Unit)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Contract not found.");

        var hasInstallments = await _db.Installments.AnyAsync(x => x.ContractId == id, cancellationToken);
        if (hasInstallments)
        {
            throw DomainValidationException.Single("Schedule", "Payment schedule already exists.");
        }

        var hasPayments = await _db.Payments.AnyAsync(x => x.ContractId == id, cancellationToken);
        if (hasPayments)
        {
            throw DomainValidationException.Single("Schedule", "Cannot generate the schedule after payments were recorded.");
        }

        var installments = _calculationService.GenerateSchedule(contract);
        foreach (var installment in installments)
        {
            installment.ContractId = contract.Id;
        }

        _db.Installments.AddRange(installments);

        await _db.SaveChangesAsync(cancellationToken);

        return await GetContractAsync(id, cancellationToken);
    }

    public async Task<ContractResponse> GetContractAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var contract = await LoadContractAsync(id, cancellationToken);
        return MapContract(contract);
    }

    public async Task<IReadOnlyList<InstallmentResponse>> GetInstallmentsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var installments = await _db.Installments
            .AsNoTracking()
            .Where(x => x.ContractId == id)
            .OrderBy(x => x.SequenceNumber)
            .Select(x => new InstallmentResponse
            {
                Id = x.Id,
                SequenceNumber = x.SequenceNumber,
                DueDate = x.DueDate,
                ExpectedAmount = x.ExpectedAmount,
                PaidAmount = x.PaidAmount,
                RemainingAmount = x.RemainingAmount,
                Status = x.Status
            })
            .ToListAsync(cancellationToken);

        return installments;
    }

    public async Task<ContractResponse> RecordPaymentAsync(Guid id, RecordPaymentRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Amount <= 0m)
        {
            throw DomainValidationException.Single(nameof(request.Amount), "Payment amount must be greater than 0.");
        }

        var contract = await _db.Contracts
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Contract not found.");

        var installments = await _db.Installments
            .Where(x => x.ContractId == id)
            .OrderBy(x => x.SequenceNumber)
            .ToListAsync(cancellationToken);

        if (installments.Count == 0)
        {
            throw DomainValidationException.Single("Schedule", "Generate the payment schedule first.");
        }

        var existingPaid = (await _db.Payments
            .Where(x => x.ContractId == id)
            .Select(x => x.Amount)
            .ToListAsync(cancellationToken))
            .Sum();
        var remainingContractAmount = _calculationService.CalculateOutstanding(contract.ContractValue, existingPaid);
        if (request.Amount > remainingContractAmount)
        {
            throw DomainValidationException.Single(nameof(request.Amount), "Payment cannot exceed the remaining contract amount.");
        }

        var payment = new Payment
        {
            ContractId = id,
            PaymentDate = request.PaymentDate ?? DateOnly.FromDateTime(DateTime.UtcNow.Date),
            Amount = request.Amount,
            Reference = request.Reference
        };

        var toAllocate = request.Amount;
        foreach (var installment in installments)
        {
            if (toAllocate <= 0m)
            {
                break;
            }

            if (installment.RemainingAmount <= 0m)
            {
                continue;
            }

            var allocated = Math.Min(installment.RemainingAmount, toAllocate);
            installment.PaidAmount += allocated;
            installment.RemainingAmount -= allocated;
            installment.Status = installment.RemainingAmount == 0m ? InstallmentStatus.Paid : InstallmentStatus.PartiallyPaid;
            toAllocate -= allocated;
        }

        _db.Payments.Add(payment);

        await _db.SaveChangesAsync(cancellationToken);
        return await GetContractAsync(id, cancellationToken);
    }

    public async Task<ForecastResponse> GetForecastAsync(Guid id, int months, CancellationToken cancellationToken = default)
    {
        var contract = await LoadContractAsync(id, cancellationToken);
        var forecast = _calculationService.CalculateForecast(contract, months, DateOnly.FromDateTime(DateTime.UtcNow.Date));

        return new ForecastResponse
        {
            Months = months,
            ContractValue = contract.ContractValue,
            CurrentPaid = _calculationService.CalculateTotalPaid(contract),
            ExpectedCollection = forecast.ExpectedCollection,
            ProjectedCollected = forecast.ProjectedCollected,
            Outstanding = forecast.Outstanding,
            ProjectedCollectionPercentage = forecast.ProjectedCollectionPercentage
        };
    }

    private async Task EnsureCustomerAndUnitExistAsync(Guid customerId, Guid unitId, CancellationToken cancellationToken)
    {
        var customerExists = await _db.Customers.AnyAsync(x => x.Id == customerId, cancellationToken);
        if (!customerExists)
        {
            throw KeyNotFoundExceptionFor(nameof(customerId), "Customer not found.");
        }

        var unitExists = await _db.Units.AnyAsync(x => x.Id == unitId, cancellationToken);
        if (!unitExists)
        {
            throw KeyNotFoundExceptionFor(nameof(unitId), "Unit not found.");
        }
    }

    private async Task<Contract> LoadContractAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _db.Contracts
            .Include(x => x.Customer)
            .Include(x => x.Unit)
            .Include(x => x.Installments)
            .Include(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Contract not found.");
    }

    private ContractResponse MapContract(Contract contract)
    {
        var totalPaid = _calculationService.CalculateTotalPaid(contract);
        var outstanding = _calculationService.CalculateOutstanding(contract.ContractValue, totalPaid);

        return new ContractResponse
        {
            Id = contract.Id,
            CustomerId = contract.CustomerId,
            CustomerName = contract.Customer?.Name ?? string.Empty,
            UnitId = contract.UnitId,
            UnitCode = contract.Unit?.Code ?? string.Empty,
            ProjectName = contract.Unit?.ProjectName ?? string.Empty,
            ContractDate = contract.ContractDate,
            ContractValue = contract.ContractValue,
            DownPaymentPercentage = contract.DownPaymentPercentage,
            DownPaymentAmount = contract.DownPaymentAmount,
            CalculatedDownPaymentAmount = _calculationService.CalculateDownPaymentAmount(contract),
            InstallmentType = contract.InstallmentType,
            Frequency = contract.Frequency,
            NumberOfInstallments = contract.NumberOfInstallments,
            FirstInstallmentDate = contract.FirstInstallmentDate,
            Status = contract.Status.ToString(),
            TotalPaid = totalPaid,
            Outstanding = outstanding,
            CollectionPercentage = _calculationService.CalculateCollectionPercentage(totalPaid, contract.ContractValue)
        };
    }

    private static KeyNotFoundException KeyNotFoundExceptionFor(string field, string message)
        => new($"{field}: {message}");
}
