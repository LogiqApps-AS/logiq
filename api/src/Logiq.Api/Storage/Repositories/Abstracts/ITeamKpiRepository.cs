using Logiq.Api.Contracts;

namespace Logiq.Api.Storage.Repositories.Abstracts;

public interface ITeamKpiRepository
{
    Task<TeamKpis?> GetCurrentAsync(string teamId, CancellationToken cancellationToken = default);
    Task<TeamFinancials?> GetFinancialsAsync(string teamId, CancellationToken cancellationToken = default);

    Task UpsertAsync(string teamId, TeamKpis kpis, TeamFinancials financials,
        CancellationToken cancellationToken = default);
}