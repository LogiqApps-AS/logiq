namespace Logiq.Api.Contracts;

public sealed record SkillsMatrix
{
    public List<string> AllSkills { get; init; } = [];
    public Dictionary<string, List<string>> EmployeeSkills { get; init; } = [];
}
