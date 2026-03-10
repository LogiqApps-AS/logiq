using Logiq.Api.Contracts;

namespace Logiq.Api.Storage.Repositories.Abstracts;

public interface IMemberRepository
{
    Task<MemberDetail?> GetDetailAsync(string teamId, string memberId, CancellationToken cancellationToken = default);

    Task<MemberDashboard?> GetDashboardAsync(string teamId, string memberId,
        CancellationToken cancellationToken = default);

    Task<SkillsMatrix> GetSkillsMatrixAsync(string teamId, CancellationToken cancellationToken = default);

    Task UpsertDetailAsync(string teamId, string memberId, MemberDetail detail,
        CancellationToken cancellationToken = default);

    Task UpsertDashboardAsync(string teamId, string memberId, MemberDashboard dashboard,
        CancellationToken cancellationToken = default);

    Task UpsertSkillsMatrixAsync(string teamId, SkillsMatrix matrix, CancellationToken cancellationToken = default);
}