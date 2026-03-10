using Logiq.Api.Contracts;

namespace Logiq.Api.Agents.Abstracts;

public interface IPeoplePartnerCopilot
{
    Task<ChatResponse> ChatAsync(string teamId, ChatRequest request, CancellationToken cancellationToken = default);
}