using System.ComponentModel;
using System.Text.Json;
using Logiq.Api.Storage;
using ModelContextProtocol.Server;

namespace Logiq.Api.Mcp;

[McpServerToolType]
public sealed class DeliveryMetricsTools(IEmployeeRepository employeeRepository)
{
    [McpServerTool]
    [Description("Returns sprint summary metrics for all team members including task completion, velocity, and story points.")]
    public async Task<string> GetSprintSummary(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var sprintData = employees.Select(e => new
        {
            employeeId = e.Id,
            name = e.Name,
            sprintCompletion = e.SprintCompletion,
            prVelocity = e.PrVelocity,
            deliveryScore = e.Delivery.Score,
            deliveryStatus = e.Delivery.Status
        });
        return JsonSerializer.Serialize(sprintData);
    }

    [McpServerTool]
    [Description("Returns pull request velocity and code review metrics for all team members.")]
    public async Task<string> GetPrMetrics(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var prMetrics = employees.Select(e => new
        {
            employeeId = e.Id,
            name = e.Name,
            prVelocity = e.PrVelocity,
            sprintCompletion = e.SprintCompletion
        });
        return JsonSerializer.Serialize(prMetrics);
    }

    [McpServerTool]
    [Description("Returns meeting load and overtime data for each team member to identify overloaded employees.")]
    public async Task<string> GetMeetingLoad(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var meetingData = employees.Select(e => new
        {
            employeeId = e.Id,
            name = e.Name,
            meetingHours = e.MeetingHours,
            meetingLoad = e.MeetingLoad,
            overtimeHours = e.OvertimeHours,
            workLifeBalance = e.WorkLifeBalance
        });
        return JsonSerializer.Serialize(meetingData);
    }
}
