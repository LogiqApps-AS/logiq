using Logiq.Api.Agents.Abstracts;
using Logiq.Api.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;

namespace Logiq.Api.Agents;

public sealed class AgentKernelFactory(IOptions<AzureOpenAiOptions> openAiOptions) : IAgentKernelFactory
{
    private readonly AzureOpenAiOptions _opts = openAiOptions.Value;

    public Kernel CreateKernel()
    {
        string endpoint = _opts.Endpoint.TrimEnd('/');
        if (endpoint.EndsWith("/openai/v1", StringComparison.OrdinalIgnoreCase))
            endpoint = endpoint[..^"/openai/v1".Length].TrimEnd('/');

        IKernelBuilder builder = Kernel.CreateBuilder();
        string baseUrl = endpoint;
        builder.AddAzureOpenAIChatCompletion(
            _opts.ChatDeploymentName,
            baseUrl,
            _opts.ApiKey);
        return builder.Build();
    }
}