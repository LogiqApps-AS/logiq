using Logiq.Api.Contracts;

namespace Logiq.Api.Agents.Abstracts;

public interface IAnalyzerOrchestrator
{
    Task RunFullAnalysisAsync(string teamId, CancellationToken cancellationToken = default);

    Task<ConversationPrep> PrepareConversationAsync(string teamId, string memberId,
        CancellationToken cancellationToken = default);

    Task<TeamKpis> ComputeTeamKpisAsync(string teamId, CancellationToken cancellationToken = default);
}