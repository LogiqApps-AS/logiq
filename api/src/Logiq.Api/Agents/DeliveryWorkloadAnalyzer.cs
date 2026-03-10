using System.Text.Json;
using Logiq.Api.Mcp;
using Logiq.Api.Models;
using Logiq.Api.Storage;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Logiq.Api.Agents;

public interface IDeliveryWorkloadAnalyzer
{
    Task<DeliveryAnalysis> AnalyzeTeamAsync(string teamId, CancellationToken cancellationToken = default);
}

public sealed class DeliveryWorkloadAnalyzer(
    IAgentKernelFactory kernelFactory,
    ISignalRepository signalRepository,
    DeliveryMetricsTools deliveryTools,
    ILogger<DeliveryWorkloadAnalyzer> logger) : IDeliveryWorkloadAnalyzer
{
    private const string AgentInstructions = """
        You are the Delivery & Workload Analyzer for Logiq.

        Your role:
        - Evaluate team delivery velocity and sprint performance
        - Identify employees with dangerous workload patterns
        - Surface meeting overload and overtime concerns

        When given delivery data, you will:
        1. Calculate average sprint velocity across the team
        2. Identify employees with >20 overtime hours/week or >60% meeting load as overloaded
        3. Flag employees with sprint completion below 70% as delivery concerns
        4. Generate workload alerts as clear, actionable strings
        5. For each employee, classify workload as: "normal", "elevated", "overloaded", or "critical"
        6. Produce a summary with the top delivery insights

        Return a JSON object matching DeliveryAnalysis schema with: teamId, teamVelocityAvg, workloadAlerts (string array), employeeInsights (array), summary.
        Each employeeInsight has: employeeId, name, sprintCompletion, meetingLoad, overtimeHours, workloadStatus.

        Return ONLY valid JSON. No markdown, no explanation.
        """;

    public async Task<DeliveryAnalysis> AnalyzeTeamAsync(string teamId, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Running Delivery & Workload analysis for team {TeamId}", teamId);

        var sprintJson = await deliveryTools.GetSprintSummary(teamId, cancellationToken);
        var prJson = await deliveryTools.GetPrMetrics(teamId, cancellationToken);
        var meetingJson = await deliveryTools.GetMeetingLoad(teamId, cancellationToken);

        var kernel = kernelFactory.CreateKernel();
        var agent = new ChatCompletionAgent
        {
            Name = "DeliveryWorkloadAnalyzer",
            Instructions = AgentInstructions,
            Kernel = kernel
        };

        var prompt = $"""
            Analyze this team's delivery and workload data. Return a JSON DeliveryAnalysis object.
            Team ID: {teamId}

            Sprint summary:
            {sprintJson}

            PR metrics:
            {prJson}

            Meeting load and overtime:
            {meetingJson}

            Return ONLY valid JSON matching the DeliveryAnalysis schema. No markdown, no explanation.
            """;

        var chat = new AgentGroupChat(agent);
        chat.AddChatMessage(new ChatMessageContent(AuthorRole.User, prompt));

        var responseText = string.Empty;
        await foreach (var message in chat.InvokeAsync(cancellationToken))
            responseText += message.Content;

        var analysis = TryParseAnalysis(responseText, teamId);

        await PersistWorkloadSignals(teamId, analysis, cancellationToken);

        return analysis;
    }

    private async Task PersistWorkloadSignals(string teamId, DeliveryAnalysis analysis, CancellationToken cancellationToken)
    {
        foreach (var overloaded in analysis.EmployeeInsights.Where(e => e.WorkloadStatus is "overloaded" or "critical"))
        {
            var signal = new Signal
            {
                Id = $"delivery-{overloaded.EmployeeId}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
                Type = "warning",
                Title = $"Workload Alert: {overloaded.Name}",
                Message = $"Meeting load: {overloaded.MeetingLoad:P0}, Overtime: {overloaded.OvertimeHours:F0}h",
                EmployeeId = overloaded.EmployeeId,
                Icon = "chart",
                Time = "just now",
                ActionLabel = "Review Workload"
            };
            await signalRepository.UpsertTeamSignalAsync(teamId, signal, cancellationToken);
        }
    }

    private static DeliveryAnalysis TryParseAnalysis(string json, string teamId)
    {
        try
        {
            var result = JsonSerializer.Deserialize<DeliveryAnalysis>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return result ?? FallbackAnalysis(teamId);
        }
        catch
        {
            return FallbackAnalysis(teamId);
        }
    }

    private static DeliveryAnalysis FallbackAnalysis(string teamId) => new()
    {
        TeamId = teamId,
        TeamVelocityAvg = 64,
        WorkloadAlerts = ["Delivery data analysis unavailable — using baseline metrics."],
        Summary = "Delivery analysis unavailable — using baseline metrics."
    };
}
