using System.Text.Json;
using Logiq.Api.Agents.Abstracts;
using Logiq.Api.Contracts;
using Logiq.Api.Mcp;
using Logiq.Api.Storage.Repositories.Abstracts;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Logiq.Api.Agents;

public sealed class DeliveryWorkloadAnalyzer(
    IAgentKernelFactory kernelFactory,
    ISignalRepository signalRepository,
    DeliveryMetricsTools deliveryTools,
    ILogger<DeliveryWorkloadAnalyzer> logger) : IDeliveryWorkloadAnalyzer
{
    private const string AgentInstructions = """
                                             You are the Delivery & Workload Analyzer for LogIQ.

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

        string sprintJson = await deliveryTools.GetSprintSummary(teamId, cancellationToken);
        string prJson = await deliveryTools.GetPrMetrics(teamId, cancellationToken);
        string meetingJson = await deliveryTools.GetMeetingLoad(teamId, cancellationToken);

        Kernel kernel = kernelFactory.CreateKernel();
        ChatCompletionAgent agent = new()
        {
            Name = "DeliveryWorkloadAnalyzer",
            Instructions = AgentInstructions,
            Kernel = kernel
        };

        string prompt = $"""
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

        AgentGroupChat chat = new(agent);
        chat.AddChatMessage(new ChatMessageContent(AuthorRole.User, prompt));

        string responseText = string.Empty;
        await foreach (ChatMessageContent message in chat.InvokeAsync(cancellationToken))
            responseText += message.Content;

        DeliveryAnalysis analysis = TryParseAnalysis(responseText, teamId, logger);

        await PersistWorkloadSignals(teamId, analysis, cancellationToken);

        return analysis;
    }

    private async Task PersistWorkloadSignals(string teamId, DeliveryAnalysis analysis,
        CancellationToken cancellationToken)
    {
        foreach (EmployeeDeliveryInsight overloaded in analysis.EmployeeInsights.Where(e =>
                     e.WorkloadStatus is "overloaded" or "critical"))
        {
            Signal signal = new()
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

    private static DeliveryAnalysis TryParseAnalysis(string raw, string teamId, ILogger logger)
    {
        string json = AgentJsonHelper.ExtractJsonFromResponse(raw);
        if (string.IsNullOrWhiteSpace(json))
        {
            logger.LogWarning("DeliveryAnalysis: empty response or no JSON extracted");
            return FallbackAnalysis(teamId);
        }
        try
        {
            DeliveryAnalysis? result = JsonSerializer.Deserialize<DeliveryAnalysis>(json,
#pragma warning disable CA1869
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, PropertyNameCaseInsensitive = true });
#pragma warning restore CA1869
            if (result == null)
            {
                logger.LogWarning("DeliveryAnalysis: Deserialized but result null");
                return FallbackAnalysis(teamId);
            }
            return result;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "DeliveryAnalysis: JSON parse failed");
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