namespace Logiq.Api.Contracts;

public sealed record TeamKpiMetric
{
    public int Score { get; init; }
    public string Status { get; init; } = "green";
    public string Label { get; init; } = string.Empty;
    public double Trend { get; init; }
    public string Description { get; init; } = string.Empty;
}