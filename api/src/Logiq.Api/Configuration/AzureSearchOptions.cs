namespace Logiq.Api.Configuration;

public sealed class AzureSearchOptions
{
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string IndexName { get; set; } = string.Empty;
    public string VectorFieldName { get; set; } = "contentVector";
}
