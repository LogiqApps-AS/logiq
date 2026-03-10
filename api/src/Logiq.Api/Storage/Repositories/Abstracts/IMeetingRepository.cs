using Logiq.Api.Contracts;

namespace Logiq.Api.Storage.Repositories.Abstracts;

public interface IMeetingRepository
{
    Task<IReadOnlyList<Meeting>> ListUpcomingAsync(string teamId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Meeting>> ListPastAsync(string teamId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DeferredTopic>> ListDeferredTopicsAsync(string teamId,
        CancellationToken cancellationToken = default);

    Task<Meeting?> GetByIdAsync(string teamId, string meetingId, CancellationToken cancellationToken = default);
    Task UpsertAsync(string teamId, Meeting meeting, bool isPast, CancellationToken cancellationToken = default);
    Task UpsertDeferredTopicAsync(string teamId, DeferredTopic topic, CancellationToken cancellationToken = default);
}