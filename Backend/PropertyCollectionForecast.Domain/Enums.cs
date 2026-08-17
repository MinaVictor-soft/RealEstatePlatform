namespace PropertyCollectionForecast.Domain;

public enum InstallmentType
{
    Equal = 1
}

public enum PaymentFrequency
{
    Monthly = 1,
    Quarterly = 2,
    Yearly = 3
}

public enum ContractStatus
{
    Draft = 1,
    Active = 2,
    Completed = 3
}

public enum InstallmentStatus
{
    Pending = 1,
    PartiallyPaid = 2,
    Paid = 3
}
