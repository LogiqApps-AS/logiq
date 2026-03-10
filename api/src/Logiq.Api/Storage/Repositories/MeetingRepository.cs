using System.Text.Json;
using Azure;
using Azure.Data.Tables;
using Logiq.Api.Configuration;
using Logiq.Api.Contracts;
using Logiq.Api.Storage.Entities;
using Logiq.Api.Storage.Repositories.Abstracts;
using Microsoft.Extensions.Options;

namespace Logiq.Api.Storage.Repositories;

public sealed class MeetingRepository(IOptions<StorageOptions> options) : IMeetingRepository
{
    private readonly TableClient _deferred = new(options.Value.ConnectionString, options.Value.DeferredTopicsTable);
    private readonly TableClient _meetings = new(options.Value.ConnectionString, options.Value.MeetingsTable);

    public async Task<IReadOnlyList<Meeting>> ListUpcomingAsync(string teamId,
        CancellationToken cancellationToken = default)
    {
        await _meetings.CreateIfNotExistsAsync(cancellationToken);
        List<Meeting> results = new();
        await foreach (MeetingEntity? entity in _meetings.QueryAsync<MeetingEntity>(
                           e => e.PartitionKey == teamId && !e.IsPast, cancellationToken: cancellationToken))
            results.Add(MapToModel(entity));
        return results;
    }

    public async Task<IReadOnlyList<Meeting>> ListPastAsync(string teamId,
        CancellationToken cancellationToken = default)
    {
        await _meetings.CreateIfNotExistsAsync(cancellationToken);
        List<Meeting> results = new();
        await foreach (MeetingEntity? entity in _meetings.QueryAsync<MeetingEntity>(
                           e => e.PartitionKey == teamId && e.IsPast, cancellationToken: cancellationToken))
            results.Add(MapToModel(entity));
        return results;
    }

    public async Task<Meeting?> GetByIdAsync(string teamId, string meetingId,
        CancellationToken cancellationToken = default)
    {
        await _meetings.CreateIfNotExistsAsync(cancellationToken);
        try
        {
            Response<MeetingEntity>? response =
                await _meetings.GetEntityAsync<MeetingEntity>(teamId, meetingId, cancellationToken: cancellationToken);
            return MapToModel(response.Value);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }

    public async Task<IReadOnlyList<DeferredTopic>> ListDeferredTopicsAsync(string teamId,
        CancellationToken cancellationToken = default)
    {
        await _deferred.CreateIfNotExistsAsync(cancellationToken);
        List<DeferredTopic> results = new();
        await foreach (TableEntity? entity in _deferred.QueryAsync<TableEntity>(e => e.PartitionKey == teamId,
                           cancellationToken: cancellationToken))
        {
            results.Add(new DeferredTopic
            {
                Id = entity.RowKey,
                Text = entity.GetString("Text") ?? string.Empty,
                Person = entity.GetString("Person") ?? string.Empty
            });
        }

        return results;
    }

    public async Task UpsertAsync(string teamId, Meeting meeting, bool isPast,
        CancellationToken cancellationToken = default)
    {
        await _meetings.CreateIfNotExistsAsync(cancellationToken);
        MeetingEntity entity = new()
        {
            PartitionKey = teamId,
            RowKey = meeting.Id,
            Name = meeting.Name,
            Role = meeting.Role,
            AvatarColor = meeting.AvatarColor,
            Date = meeting.Date,
            Duration = meeting.Duration,
            TopicCount = meeting.TopicCount,
            RiskLevel = meeting.RiskLevel,
            Notes = meeting.Notes,
            IsPast = isPast,
            TopicsJson = JsonSerializer.Serialize(meeting.Topics),
            FollowUpsJson = JsonSerializer.Serialize(meeting.FollowUps)
        };
        await _meetings.UpsertEntityAsync(entity, TableUpdateMode.Replace, cancellationToken);
    }

    public async Task UpsertDeferredTopicAsync(string teamId, DeferredTopic topic,
        CancellationToken cancellationToken = default)
    {
        await _deferred.CreateIfNotExistsAsync(cancellationToken);
        TableEntity entity = new(teamId, topic.Id)
        {
            ["Text"] = topic.Text,
            ["Person"] = topic.Person
        };
        await _deferred.UpsertEntityAsync(entity, TableUpdateMode.Replace, cancellationToken);
    }

    private static Meeting MapToModel(MeetingEntity e) => new()
    {
        Id = e.RowKey,
        Name = e.Name,
        Role = e.Role,
        AvatarColor = e.AvatarColor,
        Date = e.Date,
        Duration = e.Duration,
        TopicCount = e.TopicCount,
        RiskLevel = e.RiskLevel,
        Notes = e.Notes,
        Topics = JsonSerializer.Deserialize<List<MeetingTopic>>(e.TopicsJson) ?? [],
        FollowUps = JsonSerializer.Deserialize<List<FollowUpAction>>(e.FollowUpsJson) ?? []
    };
}