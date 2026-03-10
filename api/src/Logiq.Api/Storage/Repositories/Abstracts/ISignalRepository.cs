using Logiq.Api.Contracts;

namespace Logiq.Api.Storage.Repositories.Abstracts;

public interface ISignalRepository
{
    Task<IReadOnlyList<Signal>> ListTeamSignalsAsync(string teamId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MemberSignal>> ListMemberSignalsAsync(string teamId, string memberId,
        CancellationToken cancellationToken = default);

    Task UpsertTeamSignalAsync(string teamId, Signal signal, CancellationToken cancellationToken = default);

    Task UpsertMemberSignalAsync(string teamId, string memberId, MemberSignal signal,
        CancellationToken cancellationToken = default);
}