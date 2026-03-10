namespace Logiq.Api.Rag.Abstracts;

public interface IEmbeddingService
{
    Task<ReadOnlyMemory<float>?> GetEmbeddingAsync(string text, CancellationToken cancellationToken = default);
}