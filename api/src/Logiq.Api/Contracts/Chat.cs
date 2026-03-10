namespace Logiq.Api.Contracts;

public sealed record ChatRequest
{
    public string Message { get; init; } = string.Empty;
    public string? ConversationId { get; init; }
    public string? TeamId { get; init; }
    public string? MemberId { get; init; }
    public Dictionary<string, string> Context { get; init; } = [];
}

public sealed record ChatResponse
{
    public string ConversationId { get; init; } = string.Empty;
    public string Reply { get; init; } = string.Empty;
    public List<ChatSuggestion> Suggestions { get; init; } = [];
}

public sealed record ChatSuggestion
{
    public string Text { get; init; } = string.Empty;
    public string? Action { get; init; }
}
