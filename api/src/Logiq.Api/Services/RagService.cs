using Azure;
using Azure.AI.OpenAI;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using Logiq.Api.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Logiq.Api.Services;

public interface IRagService
{
    Task<string> RetrieveContextAsync(string query, int maxResults = 5, CancellationToken cancellationToken = default);
}

public sealed class RagService(
    IOptions<AzureOpenAiOptions> openAiOptions,
    IOptions<AzureSearchOptions> searchOptions,
    ILogger<RagService> logger) : IRagService
{
    public async Task<string> RetrieveContextAsync(string query, int maxResults = 5, CancellationToken cancellationToken = default)
    {
        var searchOpts = searchOptions.Value;
        if (string.IsNullOrEmpty(searchOpts.Endpoint) || string.IsNullOrEmpty(searchOpts.ApiKey))
            return "Knowledge base not configured.";

        try
        {
            var searchClient = new SearchClient(
                new Uri(searchOpts.Endpoint),
                searchOpts.IndexName,
                new Azure.AzureKeyCredential(searchOpts.ApiKey));

            return await KeywordSearchAsync(searchClient, query, maxResults, cancellationToken).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "RAG retrieval failed");
            return "Knowledge base temporarily unavailable.";
        }
    }

    private async Task<ReadOnlyMemory<float>?> GetQueryEmbeddingAsync(string text, CancellationToken cancellationToken = default)
    {
        var opts = openAiOptions.Value;
        if (string.IsNullOrEmpty(opts.EmbeddingDeploymentName) || string.IsNullOrEmpty(opts.Endpoint) || string.IsNullOrEmpty(opts.ApiKey))
            return null;

        var endpoint = opts.Endpoint.TrimEnd('/');
        if (endpoint.EndsWith("/openai/v1", StringComparison.OrdinalIgnoreCase))
            endpoint = endpoint[..^"/openai/v1".Length].TrimEnd('/');

        var client = new AzureOpenAIClient(new Uri(endpoint), new AzureKeyCredential(opts.ApiKey));
        var embeddingClient = client.GetEmbeddingClient(opts.EmbeddingDeploymentName);
        var response = await embeddingClient.GenerateEmbeddingsAsync([text], cancellationToken: cancellationToken).ConfigureAwait(false);
        var first = response.Value?.FirstOrDefault();
        return first?.ToFloats();
    }

    private static async Task<string> KeywordSearchAsync(
        SearchClient searchClient,
        string query,
        int size,
        CancellationToken cancellationToken)
    {
        var options = new SearchOptions { Size = size, Select = { "content", "title" } };
        var results = await searchClient.SearchAsync<SearchDocument>(query, options, cancellationToken).ConfigureAwait(false);
        var parts = new List<string>();
        await foreach (var result in results.Value.GetResultsAsync().WithCancellation(cancellationToken))
        {
            if (result.Document.TryGetValue("content", out var content))
                parts.Add(content?.ToString() ?? string.Empty);
        }

        return parts.Count > 0 ? string.Join("\n\n", parts) : "No relevant documents found.";
    }
}
