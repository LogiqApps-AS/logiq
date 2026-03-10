namespace Logiq.Api.Contracts;

public sealed record MemberSignal
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = "info";
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Time { get; init; } = string.Empty;
    public bool Unread { get; init; }
}