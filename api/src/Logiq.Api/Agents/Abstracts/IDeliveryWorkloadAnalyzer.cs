using Logiq.Api.Contracts;

namespace Logiq.Api.Agents.Abstracts;

public interface IDeliveryWorkloadAnalyzer
{
    Task<DeliveryAnalysis> AnalyzeTeamAsync(string teamId, CancellationToken cancellationToken = default);
}