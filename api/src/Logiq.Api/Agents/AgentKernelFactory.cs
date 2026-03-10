using Logiq.Api.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;

namespace Logiq.Api.Agents;

public interface IAgentKernelFactory
{
    Kernel CreateKernel();
}

public sealed class AgentKernelFactory(IOptions<AzureOpenAiOptions> openAiOptions) : IAgentKernelFactory
{
    private readonly AzureOpenAiOptions _opts = openAiOptions.Value;

    public Kernel CreateKernel()
    {
        var endpoint = _opts.Endpoint?.TrimEnd('/');
        if (endpoint?.EndsWith("/openai/v1", StringComparison.OrdinalIgnoreCase) == true)
            endpoint = endpoint[..^"/openai/v1".Length].TrimEnd('/');

        var builder = Kernel.CreateBuilder();
        var baseUrl = endpoint ?? _opts.Endpoint ?? string.Empty;
        builder.AddAzureOpenAIChatCompletion(
            _opts.ChatDeploymentName,
            baseUrl,
            _opts.ApiKey);
        return builder.Build();
    }
}
