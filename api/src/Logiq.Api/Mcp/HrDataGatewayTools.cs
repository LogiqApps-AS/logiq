using System.ComponentModel;
using System.Text.Json;
using Logiq.Api.Storage;
using ModelContextProtocol.Server;

namespace Logiq.Api.Mcp;

[McpServerToolType]
public sealed class HrDataGatewayTools(
    IEmployeeRepository employeeRepository,
    IMeetingRepository meetingRepository)
{
    [McpServerTool]
    [Description("Retrieves a full employee profile including KPI scores, churn risk, and engagement metrics by team and employee ID.")]
    public async Task<string> GetEmployeeProfile(
        [Description("The team identifier")] string teamId,
        [Description("The employee identifier")] string employeeId,
        CancellationToken cancellationToken)
    {
        var employee = await employeeRepository.GetByIdAsync(teamId, employeeId, cancellationToken);
        return JsonSerializer.Serialize(employee);
    }

    [McpServerTool]
    [Description("Lists all employees in a team with their current KPI scores, churn risk levels, and key metrics.")]
    public async Task<string> ListTeamEmployees(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        return JsonSerializer.Serialize(employees);
    }

    [McpServerTool]
    [Description("Lists all absences and sick leave records for employees in a team, including sick days and sick leave rates.")]
    public async Task<string> ListAbsences(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var absences = employees.Select(e => new
        {
            employeeId = e.Id,
            name = e.Name,
            sickDays = e.SickDays,
            sickLeaveRate = e.SickLeaveRate,
            overtimeHours = e.OvertimeHours
        });
        return JsonSerializer.Serialize(absences);
    }

    [McpServerTool]
    [Description("Returns the organisational tree for a team showing roles, tenures, and reporting relationships.")]
    public async Task<string> GetOrgTree(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var orgNodes = employees.Select(e => new
        {
            id = e.Id,
            name = e.Name,
            role = e.Role,
            tenure = e.Tenure,
            churnRisk = e.ChurnRisk
        });
        return JsonSerializer.Serialize(orgNodes);
    }

    [McpServerTool]
    [Description("Returns all 1:1 meetings scheduled for a team including topics, follow-ups, and risk levels.")]
    public async Task<string> ListMeetings(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var meetings = await meetingRepository.ListUpcomingAsync(teamId, cancellationToken);
        return JsonSerializer.Serialize(meetings);
    }

    [McpServerTool]
    [Description("Returns deferred topics across all 1:1 meetings for a team — items that were postponed and need follow-up.")]
    public async Task<string> GetDeferredTopics(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var topics = await meetingRepository.ListDeferredTopicsAsync(teamId, cancellationToken);
        return JsonSerializer.Serialize(topics);
    }
}
