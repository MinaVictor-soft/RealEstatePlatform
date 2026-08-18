namespace PropertyCollectionForecast.Application.Calculation;

using PropertyCollectionForecast.Application.Abstractions;
using PropertyCollectionForecast.Application.Exceptions;
using PropertyCollectionForecast.Domain;
using PropertyCollectionForecast.Domain.Entities;

public sealed class ContractCalculationService : IContractCalculationService
{
    public decimal CalculateDownPaymentAmount(Contract contract)
    {
        if (contract.DownPaymentAmount.HasValue)
        {
            return RoundMoney(contract.DownPaymentAmount.Value);
        }

        if (contract.DownPaymentPercentage.HasValue)
        {
            return RoundMoney(contract.ContractValue * contract.DownPaymentPercentage.Value / 100m);
        }

        return 0m;
    }

    public IReadOnlyList<Installment> GenerateSchedule(Contract contract)
    {
        ValidateConfiguration(contract);

        var schedule = new List<Installment>();
        var downPayment = CalculateDownPaymentAmount(contract);
        var remaining = RoundMoney(contract.ContractValue - downPayment);

        var stepMonths = FrequencyToMonths(contract.Frequency);
        var installmentAmount = RoundMoney(remaining / contract.NumberOfInstallments);
        var accumulated = 0m;
        var dueDate = contract.FirstInstallmentDate;

        for (var index = 1; index <= contract.NumberOfInstallments; index++)
        {
            var amount = index == contract.NumberOfInstallments
                ? RoundMoney(remaining - accumulated)
                : installmentAmount;

            accumulated += amount;
            schedule.Add(new Installment
            {
                SequenceNumber = index,
                DueDate = dueDate,
                ExpectedAmount = amount,
                PaidAmount = 0m,
                RemainingAmount = amount,
                Status = InstallmentStatus.Pending
            });

            dueDate = dueDate.AddMonths(stepMonths);
        }

        return schedule;
    }

    public decimal CalculateTotalPaid(Contract contract)
        => RoundMoney(contract.Payments.Sum(payment => payment.Amount));

    public decimal CalculateOutstanding(decimal contractValue, decimal totalPaid)
        => RoundMoney(contractValue - totalPaid);

    public decimal CalculateCollectionPercentage(decimal totalPaid, decimal contractValue)
        => contractValue == 0m ? 0m : RoundMoney(totalPaid / contractValue * 100m);

    public ForecastResult CalculateForecast(Contract contract, int months, DateOnly asOf)
    {
        if (months <= 0)
        {
            throw DomainValidationException.Single(nameof(months), "Forecast months must be greater than zero.");
        }

        var installments = contract.Installments.Count > 0
            ? contract.Installments.ToList()
            : GenerateSchedule(contract).ToList();

        var futureEnd = asOf.AddMonths(months);
        var expectedCollection = RoundMoney(installments
            .Where(installment => installment.DueDate >= asOf && installment.DueDate <= futureEnd)
            .Sum(installment => installment.ExpectedAmount));

        var currentPaid = CalculateTotalPaid(contract);
        var projectedCollected = RoundMoney(currentPaid + expectedCollection);
        var projectedCollectionPercentage = CalculateCollectionPercentage(projectedCollected, contract.ContractValue);
        var outstanding = CalculateOutstanding(contract.ContractValue, currentPaid);

        return new ForecastResult(expectedCollection, projectedCollected, projectedCollectionPercentage, outstanding);
    }

    public void ValidateConfiguration(Contract contract)
    {
        var errors = new Dictionary<string, string[]>();

        if (contract.ContractValue <= 0m)
        {
            errors[nameof(contract.ContractValue)] = ["Contract value must be greater than 0."];
        }

        if (contract.NumberOfInstallments <= 0)
        {
            errors[nameof(contract.NumberOfInstallments)] = ["Number of installments must be greater than 0."];
        }

        if (contract.FirstInstallmentDate == default)
        {
            errors[nameof(contract.FirstInstallmentDate)] = ["First installment date is required."];
        }

        if (!contract.DownPaymentAmount.HasValue && !contract.DownPaymentPercentage.HasValue)
        {
            errors["DownPayment"] = ["Provide either a down payment amount or a down payment percentage."];
        }

        var downPayment = CalculateDownPaymentAmount(contract);

        if (downPayment < 0m)
        {
            errors["DownPayment"] = ["Down payment must be greater than or equal to 0."];
        }

        if (downPayment > contract.ContractValue)
        {
            errors["DownPayment"] = ["Down payment cannot exceed the contract value."];
        }

        if (downPayment >= contract.ContractValue && contract.NumberOfInstallments > 0)
        {
            errors["DownPayment"] = ["Down payment must leave a remaining balance for installments."];
        }

        if (contract.DownPaymentPercentage.HasValue && (contract.DownPaymentPercentage < 0m || contract.DownPaymentPercentage > 100m))
        {
            errors[nameof(contract.DownPaymentPercentage)] = ["Down payment percentage must be between 0 and 100."];
        }

        if (contract.InstallmentType != InstallmentType.Equal)
        {
            errors[nameof(contract.InstallmentType)] = ["Only equal installments are supported in this demo."];
        }

        if (contract.Frequency is not (PaymentFrequency.Monthly or PaymentFrequency.Quarterly or PaymentFrequency.Yearly))
        {
            errors[nameof(contract.Frequency)] = ["Unsupported installment frequency."];
        }

        if (errors.Count > 0)
        {
            throw new DomainValidationException(errors);
        }
    }

    private static int FrequencyToMonths(PaymentFrequency frequency) => frequency switch
    {
        PaymentFrequency.Monthly => 1,
        PaymentFrequency.Quarterly => 3,
        PaymentFrequency.Yearly => 12,
        _ => throw DomainValidationException.Single(nameof(frequency), "Unsupported installment frequency.")
    };

    private static decimal RoundMoney(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
