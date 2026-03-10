using System.ClientModel;
using Azure;
using Azure.AI.OpenAI;
using Logiq.Api.Configuration;
using Logiq.Api.Rag.Abstracts;
using Microsoft.Extensions.Options;
using OpenAI.Embeddings;

namespace Logiq.Api.Rag;

public sealed class EmbeddingService(
    IOptions<AzureOpenAiOptions> openAiOptions,
    ILogger<EmbeddingService> logger) : IEmbeddingService
{
    public async Task<ReadOnlyMemory<float>?> GetEmbeddingAsync(string text,
        CancellationToken cancellationToken = default)
    {
        AzureOpenAiOptions opts = openAiOptions.Value;
        if (string.IsNullOrEmpty(opts.EmbeddingDeploymentName) || string.IsNullOrEmpty(opts.Endpoint) ||
            string.IsNullOrEmpty(opts.ApiKey))
            return null;

        if (string.IsNullOrWhiteSpace(text))
            return null;

        try
        {
            string endpoint = opts.Endpoint.TrimEnd('/');
            if (endpoint.EndsWith("/openai/v1", StringComparison.OrdinalIgnoreCase))
                endpoint = endpoint[..^"/openai/v1".Length].TrimEnd('/');

            AzureOpenAIClient client = new(new Uri(endpoint), new AzureKeyCredential(opts.ApiKey));
            EmbeddingClient? embeddingClient = client.GetEmbeddingClient(opts.EmbeddingDeploymentName);
            ClientResult<OpenAIEmbeddingCollection>? response = await embeddingClient
                .GenerateEmbeddingsAsync([text], cancellationToken: cancellationToken).ConfigureAwait(false);
            OpenAIEmbedding? first = response.Value.FirstOrDefault();
            return first?.ToFloats();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Embedding generation failed");
            return null;
        }
    }
}