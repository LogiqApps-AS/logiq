namespace Logiq.Api.Rag.Abstracts;

public interface IRagIngester
{
    Task IngestAsync(CancellationToken cancellationToken = default);
}