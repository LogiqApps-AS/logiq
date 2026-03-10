namespace Logiq.Api.Contracts;

public sealed record TeamFinancials
{
    public int AtRiskCount { get; init; }
    public int TotalEmployees { get; init; }
    public int ChurnExposure { get; init; }
    public int TotalPeopleRisk { get; init; }
}