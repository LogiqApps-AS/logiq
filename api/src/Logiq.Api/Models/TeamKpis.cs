namespace Logiq.Api.Models;

public sealed record TeamKpiMetric
{
    public int Score { get; init; }
    public string Status { get; init; } = "green";
    public string Label { get; init; } = string.Empty;
    public double Trend { get; init; }
    public string Description { get; init; } = string.Empty;
}

public sealed record TeamKpis
{
    public TeamKpiMetric Wellbeing { get; init; } = new();
    public TeamKpiMetric Skills { get; init; } = new();
    public TeamKpiMetric Motivation { get; init; } = new();
    public TeamKpiMetric Churn { get; init; } = new();
    public TeamKpiMetric Delivery { get; init; } = new();
}

public sealed record TeamFinancials
{
    public int AtRiskCount { get; init; }
    public int TotalEmployees { get; init; }
    public int ChurnExposure { get; init; }
    public int TotalPeopleRisk { get; init; }
}
