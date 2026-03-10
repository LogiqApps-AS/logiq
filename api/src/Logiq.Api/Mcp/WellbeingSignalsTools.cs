using System.ComponentModel;
using System.Text.Json;
using Logiq.Api.Storage;
using ModelContextProtocol.Server;

namespace Logiq.Api.Mcp;

[McpServerToolType]
public sealed class WellbeingSignalsTools(
    IEmployeeRepository employeeRepository,
    ISignalRepository signalRepository)
{
    [McpServerTool]
    [Description("Returns pulse survey results and engagement scores for all team members including wellbeing index and engagement pulse.")]
    public async Task<string> GetPulseResults(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var pulse = employees.Select(e => new
        {
            employeeId = e.Id,
            name = e.Name,
            wellbeingScore = e.Wellbeing.Score,
            wellbeingStatus = e.Wellbeing.Status,
            engagementPulse = e.EngagementPulse,
            motivationScore = e.Motivation.Score,
            motivationStatus = e.Motivation.Status
        });
        return JsonSerializer.Serialize(pulse);
    }

    [McpServerTool]
    [Description("Returns psychological safety scores and work-life balance metrics for all team members.")]
    public async Task<string> GetSafetyScores(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var scores = employees.Select(e => new
        {
            employeeId = e.Id,
            name = e.Name,
            psychSafety = e.PsychSafety,
            workLifeBalance = e.WorkLifeBalance,
            overtimeHours = e.OvertimeHours
        });
        return JsonSerializer.Serialize(scores);
    }

    [McpServerTool]
    [Description("Returns all current wellbeing and risk signals for a team including churn risk signals and alerts.")]
    public async Task<string> GetTeamSignals(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var signals = await signalRepository.ListTeamSignalsAsync(teamId, cancellationToken);
        return JsonSerializer.Serialize(signals);
    }

    [McpServerTool]
    [Description("Returns sentiment trend data derived from churn risk, preventability, and retention metrics for each employee.")]
    public async Task<string> GetSentimentTrends(
        [Description("The team identifier")] string teamId,
        CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var trends = employees.Select(e => new
        {
            employeeId = e.Id,
            name = e.Name,
            churnRisk = e.ChurnRisk,
            churnPercent = e.ChurnPercent,
            preventabilityScore = e.PreventabilityScore,
            retentionRate = e.RetentionRate,
            feedbackScore360 = e.FeedbackScore360
        });
        return JsonSerializer.Serialize(trends);
    }

    [McpServerTool]
    [Description("Returns signals for a specific team member including warnings, opportunities, and recognition alerts.")]
    public async Task<string> GetMemberSignals(
        [Description("The team identifier")] string teamId,
        [Description("The employee identifier")] string memberId,
        CancellationToken cancellationToken)
    {
        var signals = await signalRepository.ListMemberSignalsAsync(teamId, memberId, cancellationToken);
        return JsonSerializer.Serialize(signals);
    }
}
