namespace Logiq.Api.Models;

public sealed record SkillsMatrix
{
    public List<string> AllSkills { get; init; } = [];
    public Dictionary<string, List<string>> EmployeeSkills { get; init; } = [];
}
