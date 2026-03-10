using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using Logiq.Api.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Logiq.Api.Controllers;

[ApiController]
public sealed class SearchController(IOptions<AzureSearchOptions> options) : ControllerBase
{
    [HttpGet("api/search/status")]
    [ProducesResponseType(typeof(SearchStatusResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken = default)
    {
        AzureSearchOptions opts = options.Value;
        if (string.IsNullOrEmpty(opts.Endpoint) || string.IsNullOrEmpty(opts.ApiKey) || string.IsNullOrEmpty(opts.IndexName))
        {
            return Ok(new SearchStatusResponse
            {
                Configured = false,
                IndexName = opts.IndexName,
                DocumentCount = 0,
                Message = "Azure AI Search is not configured (missing Endpoint, ApiKey, or IndexName)."
            });
        }

        try
        {
            SearchClient searchClient = new(new Uri(opts.Endpoint), opts.IndexName, new AzureKeyCredential(opts.ApiKey));
            SearchOptions searchOptions = new() { Size = 0, IncludeTotalCount = true };
            Response<SearchResults<SearchDocument>>? result = await searchClient.SearchAsync<SearchDocument>("*", searchOptions, cancellationToken).ConfigureAwait(false);
            long count = result.Value.TotalCount ?? 0;
            return Ok(new SearchStatusResponse
            {
                Configured = true,
                IndexName = opts.IndexName,
                DocumentCount = count,
                Message = count > 0 ? $"{count} document(s) in index." : "Index is empty; run seed/provisioning to ingest documents."
            });
        }
        catch (RequestFailedException ex)
        {
            return Ok(new SearchStatusResponse
            {
                Configured = true,
                IndexName = opts.IndexName,
                DocumentCount = 0,
                Message = $"Index error: {ex.Message}"
            });
        }
    }
}

public sealed record SearchStatusResponse
{
    public bool Configured { get; init; }
    public string IndexName { get; init; } = string.Empty;
    public long DocumentCount { get; init; }
    public string Message { get; init; } = string.Empty;
}
