using Azure.Data.Tables;
using Logiq.Api.Configuration;
using Logiq.Api.Contracts;
using Logiq.Api.Storage.Entities;
using Logiq.Api.Storage.Repositories.Abstracts;
using Microsoft.Extensions.Options;

namespace Logiq.Api.Storage.Repositories;

public sealed class SignalRepository(IOptions<StorageOptions> options) : ISignalRepository
{
    private readonly TableClient _table = new(options.Value.ConnectionString, options.Value.SignalsTable);

    public async Task<IReadOnlyList<Signal>> ListTeamSignalsAsync(string teamId,
        CancellationToken cancellationToken = default)
    {
        await _table.CreateIfNotExistsAsync(cancellationToken);
        List<Signal> results = new();
        await foreach (SignalEntity? entity in _table.QueryAsync<SignalEntity>(
                           e => e.PartitionKey == teamId && !e.IsMemberSignal, cancellationToken: cancellationToken))
            results.Add(MapToSignal(entity));
        return results;
    }

    public async Task<IReadOnlyList<MemberSignal>> ListMemberSignalsAsync(string teamId, string memberId,
        CancellationToken cancellationToken = default)
    {
        await _table.CreateIfNotExistsAsync(cancellationToken);
        string partitionKey = $"{teamId}:{memberId}";
        List<MemberSignal> results = new();
        await foreach (SignalEntity? entity in _table.QueryAsync<SignalEntity>(
                           e => e.PartitionKey == partitionKey && e.IsMemberSignal,
                           cancellationToken: cancellationToken))
            results.Add(MapToMemberSignal(entity));
        return results;
    }

    public async Task UpsertTeamSignalAsync(string teamId, Signal signal, CancellationToken cancellationToken = default)
    {
        await _table.CreateIfNotExistsAsync(cancellationToken);
        SignalEntity entity = new()
        {
            PartitionKey = teamId,
            RowKey = signal.Id,
            Type = signal.Type,
            Title = signal.Title,
            Message = signal.Message,
            EmployeeId = signal.EmployeeId,
            Icon = signal.Icon,
            Time = signal.Time,
            Action = signal.Action,
            ActionLabel = signal.ActionLabel,
            IsMemberSignal = false
        };
        await _table.UpsertEntityAsync(entity, TableUpdateMode.Replace, cancellationToken);
    }

    public async Task UpsertMemberSignalAsync(string teamId, string memberId, MemberSignal signal,
        CancellationToken cancellationToken = default)
    {
        await _table.CreateIfNotExistsAsync(cancellationToken);
        SignalEntity entity = new()
        {
            PartitionKey = $"{teamId}:{memberId}",
            RowKey = signal.Id,
            Type = signal.Type,
            Title = signal.Title,
            Description = signal.Description,
            Time = signal.Time,
            Unread = signal.Unread,
            IsMemberSignal = true
        };
        await _table.UpsertEntityAsync(entity, TableUpdateMode.Replace, cancellationToken);
    }

    private static Signal MapToSignal(SignalEntity e) => new()
    {
        Id = e.RowKey,
        Type = e.Type,
        Title = e.Title,
        Message = e.Message,
        EmployeeId = e.EmployeeId,
        Icon = e.Icon,
        Time = e.Time,
        Action = e.Action,
        ActionLabel = e.ActionLabel
    };

    private static MemberSignal MapToMemberSignal(SignalEntity e) => new()
    {
        Id = e.RowKey,
        Type = e.Type,
        Title = e.Title,
        Description = e.Description,
        Time = e.Time,
        Unread = e.Unread
    };
}