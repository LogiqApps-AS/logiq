using Logiq.Api.Models;
using Logiq.Api.Services;
using Logiq.Api.Storage;
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

        IReadOnlyList<Employee> employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        TeamKpis? kpis = await kpiRepository.GetCurrentAsync(teamId, cancellationToken);
        IReadOnlyList<Signal> signals = await signalRepository.ListTeamSignalsAsync(teamId, cancellationToken);

        string ragContext = await ragService.RetrieveContextAsync(request.Message, 5, cancellationToken);

        Kernel kernel = kernelFactory.CreateKernel();
        ChatCompletionAgent agent = new ChatCompletionAgent
        {
            Name = "PeoplePartnerCopilot",
            Instructions = BuildSystemContext(employees, kpis, signals, ragContext),
            Kernel = kernel
        };

        string conversationId = request.ConversationId ?? Guid.NewGuid().ToString();
        AgentGroupChat chat = new AgentGroupChat(agent);
        chat.AddChatMessage(new ChatMessageContent(AuthorRole.User, request.Message));

        string reply = string.Empty;
        await foreach (ChatMessageContent message in chat.InvokeAsync(cancellationToken))
            reply += message.Content;

        return new ChatResponse
        {
            ConversationId = conversationId,
            Reply = reply,
            Suggestions = ExtractSuggestions()
        };
    }

    private static string BuildSystemContext(
        IReadOnlyList<Employee> employees,
        TeamKpis? kpis,
        IReadOnlyList<Signal> signals,
        string ragContext)
    {
        List<Employee> atRisk = employees.Where(e => e.ChurnRisk is "At risk" or "Medium").ToList();
        string signalSummary = signals.Count > 0
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

    private static List<ChatSuggestion> ExtractSuggestions() =>
    [
        new() { Text = "Show me the full team wellbeing breakdown" },
        new() { Text = "Which employees are at highest churn risk?" },
        new() { Text = "Generate 1:1 prep for the next meeting" }
    ];
}
