using Logiq.Api.Models;

namespace Logiq.Api.Storage;

public interface ITeamKpiRepository
{
    Task<TeamKpis?> GetCurrentAsync(string teamId, CancellationToken cancellationToken = default);
    Task<TeamFinancials?> GetFinancialsAsync(string teamId, CancellationToken cancellationToken = default);
    Task UpsertAsync(string teamId, TeamKpis kpis, TeamFinancials financials, CancellationToken cancellationToken = default);
}
