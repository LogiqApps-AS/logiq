namespace Logiq.Api.Contracts;

public sealed record TeamKpis
{
    public TeamKpiMetric Wellbeing { get; init; } = new();
    public TeamKpiMetric Skills { get; init; } = new();
    public TeamKpiMetric Motivation { get; init; } = new();
    public TeamKpiMetric Churn { get; init; } = new();
    public TeamKpiMetric Delivery { get; init; } = new();
}