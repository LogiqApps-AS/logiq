using Logiq.Api.Contracts;

namespace Logiq.Api.Agents.Abstracts;

public interface IWellbeingRiskAnalyzer
{
    Task<WellbeingAnalysis> AnalyzeTeamAsync(string teamId, CancellationToken cancellationToken = default);
}