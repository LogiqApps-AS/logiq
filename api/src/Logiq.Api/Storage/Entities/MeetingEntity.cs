using Azure;
using Azure.Data.Tables;

namespace Logiq.Api.Storage.Entities;

public sealed class MeetingEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public int TopicCount { get; set; }
    public string? RiskLevel { get; set; }
    public string Notes { get; set; } = string.Empty;
    public bool IsPast { get; set; }
    public string TopicsJson { get; set; } = "[]";
    public string FollowUpsJson { get; set; } = "[]";
}
