using Logiq.Api.Contracts;

namespace Logiq.Api.Agents.Abstracts;

public interface IDevelopmentCoach
{
    Task<ChatResponse> ChatAsync(string memberId, ChatRequest request, CancellationToken cancellationToken = default);
}