using Logiq.Api.Models;
using Logiq.Api.Services;
using Logiq.Api.Storage;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Logiq.Api.Agents;

public interface IPeoplePartnerCopilot
{
    Task<ChatResponse> ChatAsync(string teamId, ChatRequest request, CancellationToken cancellationToken = default);
}

public sealed class PeoplePartnerCopilot(
    IAgentKernelFactory kernelFactory,
    IRagService ragService,
    IEmployeeRepository employeeRepository,
    ITeamKpiRepository kpiRepository,
    ISignalRepository signalRepository,
    ILogger<PeoplePartnerCopilot> logger) : IPeoplePartnerCopilot
{
    private const string AgentInstructions = """
        You are the People Partner Copilot for Logiq — an expert AI assistant for people partners and team leads.

        Your capabilities:
        - Answer questions about team health, employee wellbeing, churn risk, and performance
        - Provide guidance on managing difficult conversations and people challenges
        - Help interpret signals and KPIs to drive better people decisions
        - Suggest actions to improve team engagement and retention

        You have access to:
        - Real-time team data including KPIs, signals, and employee profiles
        - HR knowledge base via RAG for best practices and policies
        - Historical context about the team's people trends

        Principles:
        - Always lead with data and evidence, then provide actionable recommendations
        - Be empathetic — these are real people, not just metrics
        - Respect confidentiality — never speculate beyond what the data shows
        - Be concise and direct — people partners are busy

        End each response with 2-3 brief follow-up questions or suggestions to deepen the conversation.
        """;

    public async Task<ChatResponse> ChatAsync(string teamId, ChatRequest request, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("People Partner Copilot processing message for team {TeamId}", teamId);

        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var kpis = await kpiRepository.GetCurrentAsync(teamId, cancellationToken);
        var signals = await signalRepository.ListTeamSignalsAsync(teamId, cancellationToken);

        var ragContext = await ragService.RetrieveContextAsync(request.Message, 5, cancellationToken);

        var kernel = kernelFactory.CreateKernel();
        var agent = new ChatCompletionAgent
        {
            Name = "PeoplePartnerCopilot",
            Instructions = BuildSystemContext(employees, kpis, signals, ragContext),
            Kernel = kernel
        };

        var conversationId = request.ConversationId ?? Guid.NewGuid().ToString();
        var chat = new AgentGroupChat(agent);
        chat.AddChatMessage(new ChatMessageContent(AuthorRole.User, request.Message));

        var reply = string.Empty;
        await foreach (var message in chat.InvokeAsync(cancellationToken))
            reply += message.Content;

        return new ChatResponse
        {
            ConversationId = conversationId,
            Reply = reply,
            Suggestions = ExtractSuggestions(reply)
        };
    }

    private static string BuildSystemContext(
        IReadOnlyList<Employee> employees,
        TeamKpis? kpis,
        IReadOnlyList<Signal> signals,
        string ragContext)
    {
        var atRisk = employees.Where(e => e.ChurnRisk is "At risk" or "Medium").ToList();
        var signalSummary = signals.Count > 0
            ? $"{signals.Count} active signals ({signals.Count(s => s.Type == "critical")} critical)"
            : "No active signals";

        return $"""
            {AgentInstructions}

            CURRENT TEAM CONTEXT:
            Team size: {employees.Count} members
            At-risk employees: {atRisk.Count} ({string.Join(", ", atRisk.Select(e => e.Name))})
            Team KPIs: Wellbeing {kpis?.Wellbeing.Score ?? 0}% ({kpis?.Wellbeing.Status ?? "unknown"}), Skills {kpis?.Skills.Score ?? 0}%, Delivery {kpis?.Delivery.Score ?? 0}%
            Active signals: {signalSummary}

            RELEVANT HR KNOWLEDGE:
            {ragContext}
            """;
    }

    private static List<ChatSuggestion> ExtractSuggestions(string reply)
    {
        return
        [
            new ChatSuggestion { Text = "Show me the full team wellbeing breakdown" },
            new ChatSuggestion { Text = "Which employees are at highest churn risk?" },
            new ChatSuggestion { Text = "Generate 1:1 prep for the next meeting" }
        ];
    }
}
