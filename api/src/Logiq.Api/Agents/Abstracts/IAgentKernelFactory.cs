using Microsoft.SemanticKernel;

namespace Logiq.Api.Agents.Abstracts;

public interface IAgentKernelFactory
{
    Kernel CreateKernel();
}