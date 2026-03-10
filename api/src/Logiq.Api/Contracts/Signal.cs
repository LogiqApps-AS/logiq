namespace Logiq.Api.Contracts;

public sealed record Signal
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = "info";
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? EmployeeId { get; init; }
    public string Icon { get; init; } = string.Empty;
    public string Time { get; init; } = string.Empty;
    public string? Action { get; init; }
    public string? ActionLabel { get; init; }
}