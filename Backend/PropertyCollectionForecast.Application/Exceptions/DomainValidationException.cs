namespace PropertyCollectionForecast.Application.Exceptions;

public sealed class DomainValidationException : Exception
{
    public DomainValidationException(IDictionary<string, string[]> errors)
        : base("Validation failed.")
    {
        Errors = new Dictionary<string, string[]>(errors);
    }

    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public static DomainValidationException Single(string field, string message)
        => new(new Dictionary<string, string[]> { [field] = [message] });
}
