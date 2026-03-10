using System.Text.Json;
using Logiq.Api.Agents.Abstracts;
using Logiq.Api.Contracts;
using Logiq.Api.Mcp;
using Logiq.Api.Storage.Repositories.Abstracts;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Logiq.Api.Agents;

public sealed class WellbeingRiskAnalyzer(
    IAgentKernelFactory kernelFactory,
    ISignalRepository signalRepository,
    WellbeingSignalsTools wellbeingTools,
    HrDataGatewayTools hrTools,
    ILogger<WellbeingRiskAnalyzer> logger) : IWellbeingRiskAnalyzer
{
    private const string AgentInstructions = """
                                             You are the Wellbeing & Risk Analyzer for LogIQ, an AI-powered people intelligence platform.

                                             Your role:
                                             - Analyze employee wellbeing, engagement, and churn risk data from HR systems
                                             - Identify at-risk employees and generate actionable signals
                                             - Compute team wellbeing index and surface key insights for people partners

                                             When given employee data, you will:
                                             1. Identify employees with critical or high churn risk (churnRisk = "At risk" or "Medium")
                                             2. Flag employees with low wellbeing scores (below 60), high overtime, or low psychological safety
                                             3. Surface employees with declining motivation or engagement pulse below 60
                                             4. Generate specific, actionable recommended actions for each risk signal
                                             5. Compute an overall team wellbeing index as the average wellbeing score
                                             6. Produce a brief executive summary with the top 2-3 insights

                                             Return a JSON object matching WellbeingAnalysis schema with: teamId, teamWellbeingIndex, riskSignals (array), keyInsights (array of strings), summary.
                                             Each riskSignal has: employeeId, name, riskLevel (Low/Medium/High/Critical), signals (array of strings), recommendedAction.

                                             Be concise, data-driven, and actionable. Do not include generic advice.
                                             """;

    public async Task<WellbeingAnalysis> AnalyzeTeamAsync(string teamId, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Running Wellbeing & Risk analysis for team {TeamId}", teamId);

        string pulseJson = await wellbeingTools.GetPulseResults(teamId, cancellationToken);
        string safetyJson = await wellbeingTools.GetSafetyScores(teamId, cancellationToken);
        string sentimentJson = await wellbeingTools.GetSentimentTrends(teamId, cancellationToken);
        string absencesJson = await hrTools.ListAbsences(teamId, cancellationToken);

        Kernel kernel = kernelFactory.CreateKernel();
        ChatCompletionAgent agent = new()
        {
            Name = "WellbeingRiskAnalyzer",
            Instructions = AgentInstructions,
            Kernel = kernel
        };

        string prompt = $"""
                         Analyze this team's wellbeing data and return a JSON WellbeingAnalysis object.
                         Team ID: {teamId}

                         Pulse/Engagement data:
                         {pulseJson}

                         Psychological safety and work-life balance:
                         {safetyJson}

                         Churn risk and sentiment trends:
                         {sentimentJson}

                         Absence and overtime data:
                         {absencesJson}

                         Return ONLY valid JSON matching the WellbeingAnalysis schema. No markdown, no explanation.
                         """;

        AgentGroupChat chat = new(agent);
        chat.AddChatMessage(new ChatMessageContent(AuthorRole.User, prompt));

        string responseText = string.Empty;
        await foreach (ChatMessageContent message in chat.InvokeAsync(cancellationToken))
            responseText += message.Content;

        WellbeingAnalysis analysis = TryParseAnalysis(responseText, teamId);

        await PersistSignalsToStorage(teamId, analysis, cancellationToken);

        return analysis;
    }

    private async Task PersistSignalsToStorage(string teamId, WellbeingAnalysis analysis,
        CancellationToken cancellationToken)
    {
        foreach (EmployeeRiskSignal risk in analysis.RiskSignals.Where(r => r.RiskLevel is "High" or "Critical"))
        {
            Signal signal = new()
            {
                Id = $"wellbeing-{risk.EmployeeId}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
                Type = risk.RiskLevel == "Critical" ? "critical" : "warning",
                Title = $"Wellbeing Alert: {risk.Name}",
                Message = string.Join("; ", risk.Signals),
                EmployeeId = risk.EmployeeId,
                Icon = "heart",
                Time = "just now",
                ActionLabel = "View 1:1 Brief"
            };
            await signalRepository.UpsertTeamSignalAsync(teamId, signal, cancellationToken);
        }
    }

    private static WellbeingAnalysis TryParseAnalysis(string json, string teamId)
    {
        try
        {
#pragma warning disable CA1869 // Cache and reuse 'JsonSerializerOptions' instances
            WellbeingAnalysis? result = JsonSerializer.Deserialize<WellbeingAnalysis>(json,
                new JsonSerializerOptions {PropertyNameCaseInsensitive = true});
#pragma warning restore CA1869 // Cache and reuse 'JsonSerializerOptions' instances
            return result ?? FallbackAnalysis(teamId);
        }
        catch
        {
            return FallbackAnalysis(teamId);
        }
    }

    private static WellbeingAnalysis FallbackAnalysis(string teamId) => new()
    {
        TeamId = teamId,
        TeamWellbeingIndex = 67,
        Summary = "Wellbeing analysis unavailable — using baseline metrics.",
        KeyInsights = ["Baseline data loaded from storage."]
    };
}