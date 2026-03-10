using Logiq.Api.Contracts;

namespace Logiq.Api.Agents.Abstracts;

public interface ISkillsGrowthAnalyzer
{
    Task<SkillsAnalysis> AnalyzeTeamAsync(string teamId, CancellationToken cancellationToken = default);
}