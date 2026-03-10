namespace Logiq.Api.Contracts;

public sealed record MeetingTopic
{
    public string Id { get; init; } = string.Empty;
    public string Icon { get; init; } = "target";
    public string Text { get; init; } = string.Empty;
    public string Status { get; init; } = "pending";
}

public sealed record FollowUpAction
{
    public string Id { get; init; } = string.Empty;
    public string Text { get; init; } = string.Empty;
    public bool Done { get; init; }
}

public sealed record Meeting
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string AvatarColor { get; init; } = string.Empty;
    public string Date { get; init; } = string.Empty;
    public string Duration { get; init; } = string.Empty;
    public int TopicCount { get; init; }
    public string? RiskLevel { get; init; }
    public List<MeetingTopic> Topics { get; init; } = [];
    public string Notes { get; init; } = string.Empty;
    public List<FollowUpAction> FollowUps { get; init; } = [];
}

public sealed record DeferredTopic
{
    public string Id { get; init; } = string.Empty;
    public string Text { get; init; } = string.Empty;
    public string Person { get; init; } = string.Empty;
}
