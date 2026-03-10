using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using Logiq.Api.Configuration;
using Logiq.Api.Rag.Abstracts;
using Microsoft.Extensions.Options;

namespace Logiq.Api.Rag;

public sealed class RagRetriever(
    IEmbeddingService embeddingService,
    IOptions<AzureSearchOptions> searchOptions,
    ILogger<RagRetriever> logger) : IRagRetriever
{
    public async Task<string> RetrieveAsync(string query, int maxResults = 5,
        CancellationToken cancellationToken = default)
    {
        AzureSearchOptions searchOpts = searchOptions.Value;
        if (string.IsNullOrEmpty(searchOpts.Endpoint) || string.IsNullOrEmpty(searchOpts.ApiKey))
            return "Knowledge base not configured.";

        try
        {
            SearchClient searchClient = new(
                new Uri(searchOpts.Endpoint),
                searchOpts.IndexName,
                new AzureKeyCredential(searchOpts.ApiKey));

            ReadOnlyMemory<float>? queryVector =
                await embeddingService.GetEmbeddingAsync(query, cancellationToken).ConfigureAwait(false);
            if (!queryVector.HasValue || queryVector.Value.IsEmpty)
                return await KeywordSearchAsync(searchClient, query, maxResults, cancellationToken)
                    .ConfigureAwait(false);

            SearchOptions options = new()
            {
                Size = maxResults,
                Select = {"content", "title"},
                VectorSearch = new VectorSearchOptions
                {
                    Queries =
                    {
                        new VectorizedQuery(queryVector.Value)
                            {KNearestNeighborsCount = maxResults, Fields = {searchOpts.VectorFieldName}}
                    }
                }
            };
            Response<SearchResults<SearchDocument>>? response = await searchClient
                .SearchAsync<SearchDocument>("*", options, cancellationToken).ConfigureAwait(false);
            List<string> parts = new();
            await foreach (SearchResult<SearchDocument>? result in response.Value.GetResultsAsync()
                               .WithCancellation(cancellationToken))
            {
                if (result.Document.TryGetValue("content", out object? content))
                    parts.Add(content?.ToString() ?? string.Empty);
            }

            if (parts.Count > 0)
                return string.Join("\n\n", parts);
            return await KeywordSearchAsync(searchClient, query, maxResults, cancellationToken).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "RAG retrieval failed");
            return "Knowledge base temporarily unavailable.";
        }
    }

    private static async Task<string> KeywordSearchAsync(
        SearchClient searchClient,
        string query,
        int size,
        CancellationToken cancellationToken)
    {
        SearchOptions options = new() {Size = size, Select = {"content", "title"}};
        Response<SearchResults<SearchDocument>>? results = await searchClient
            .SearchAsync<SearchDocument>(query, options, cancellationToken).ConfigureAwait(false);
        List<string> parts = [];
        await foreach (SearchResult<SearchDocument>? result in results.Value.GetResultsAsync()
                           .WithCancellation(cancellationToken))
        {
            if (result.Document.TryGetValue("content", out object? content))
                parts.Add(content?.ToString() ?? string.Empty);
        }

        return parts.Count > 0 ? string.Join("\n\n", parts) : "No relevant documents found.";
    }
}