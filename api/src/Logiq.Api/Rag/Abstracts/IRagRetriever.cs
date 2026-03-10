namespace Logiq.Api.Rag.Abstracts;

public interface IRagRetriever
{
    Task<string> RetrieveAsync(string query, int maxResults = 5, CancellationToken cancellationToken = default);
}