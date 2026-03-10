using System.ComponentModel;
using System.Text.Json;
using Logiq.Api.Contracts;
using Logiq.Api.Storage.Repositories.Abstracts;
using ModelContextProtocol.Server;

namespace Logiq.Api.Mcp;

[McpServerToolType]
public sealed class LearningSkillsTools(
    IEmployeeRepository employeeRepository,
    IMemberRepository memberRepository)
{
    [McpServerTool]
    [Description(
        "Returns training records for all team members including completed courses, hours, and certification progress.")]
    public async Task<string> GetTrainingRecords(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        IReadOnlyList<Employee> employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var records = employees.Select(e => new
        {
            employeeId = e.Id,
            name = e.Name,
            learningHours = e.LearningHours,
            skillsCoverage = e.SkillsCoverage,
            idpGoalProgress = e.IdpGoalProgress
        });
        return JsonSerializer.Serialize(records);
    }

    [McpServerTool]
    [Description("Returns individual development plan goals for all team members, including progress and status.")]
    public async Task<string> GetIdpGoals(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        IReadOnlyList<Employee> employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var goals = employees.Select(e => new
        {
            employeeId = e.Id,
            name = e.Name,
            idpGoalProgress = e.IdpGoalProgress,
            goalAchievement = e.GoalAchievement
        });
        return JsonSerializer.Serialize(goals);
    }

    [McpServerTool]
    [Description("Returns the full skills matrix for a team including all skills and each employee's skill levels.")]
    public async Task<string> GetSkillAssessments(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        SkillsMatrix matrix = await memberRepository.GetSkillsMatrixAsync(teamId, cancellationToken);
        return JsonSerializer.Serialize(matrix);
    }

    [McpServerTool]
    [Description("Returns skill coverage percentage and skills data for a specific team member.")]
    public async Task<string> GetMemberSkillProfile(
        [Description("The team identifier")] string teamId,
        [Description("The employee identifier")]
        string memberId,
        CancellationToken cancellationToken)
    {
        Employee? employee = await employeeRepository.GetByIdAsync(teamId, memberId, cancellationToken);
        MemberDashboard? dashboard = await memberRepository.GetDashboardAsync(teamId, memberId, cancellationToken);
        var result = new
        {
            employeeId = memberId,
            skillsCoverage = employee?.SkillsCoverage ?? 0,
            idpGoalProgress = employee?.IdpGoalProgress ?? 0,
            skills = dashboard?.Skills ?? [],
            devGoals = dashboard?.DevGoals ?? []
        };
        return JsonSerializer.Serialize(result);
    }
}