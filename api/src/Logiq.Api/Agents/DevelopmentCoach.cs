using Logiq.Api.Models;
using Logiq.Api.Services;
using Logiq.Api.Storage;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Logiq.Api.Agents;

public interface IDevelopmentCoach
{
    Task<ChatResponse> ChatAsync(string memberId, ChatRequest request, CancellationToken cancellationToken = default);
}

public sealed class DevelopmentCoach(
    IAgentKernelFactory kernelFactory,
    IRagService ragService,
    IEmployeeRepository employeeRepository,
    IMemberRepository memberRepository,
    ILogger<DevelopmentCoach> logger) : IDevelopmentCoach
{
    private const string AgentInstructions = """
        You are the Development Coach for Logiq — a supportive, expert AI coach for individual contributors and team members.

        Your role:
        - Help members understand their growth trajectory and development opportunities
        - Provide personalised guidance for 1:1 preparation and self-advocacy
        - Suggest learning resources and career development actions
        - Help members articulate their goals and concerns constructively

        You have access to:
        - The member's KPIs, signals, development goals, and skill profile
        - Their upcoming 1:1 preparation brief with suggested topics
        - Career development best practices via knowledge base

        Coaching principles:
        - Be encouraging but honest — growth requires honest feedback
        - Focus on what the member can control and influence
        - Help them frame concerns as opportunities rather than complaints
        - Be specific — generic advice is not helpful

        Always end with 2-3 actionable next steps the member can take this week.
        """;

    public async Task<ChatResponse> ChatAsync(string memberId, ChatRequest request, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Development Coach processing message for member {MemberId}", memberId);

        string teamId = request.TeamId ?? "team1";
        Employee? employee = await employeeRepository.GetByIdAsync(teamId, memberId, cancellationToken);
        MemberDashboard? dashboard = await memberRepository.GetDashboardAsync(teamId, memberId, cancellationToken);
        string ragContext = await ragService.RetrieveContextAsync(request.Message, 5, cancellationToken);

        Kernel kernel = kernelFactory.CreateKernel();
        ChatCompletionAgent agent = new ChatCompletionAgent
        {
            Name = "DevelopmentCoach",
            Instructions = BuildMemberContext(employee, dashboard, ragContext),
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
            Suggestions = ExtractSuggestions(dashboard)
        };
    }

    private static string BuildMemberContext(Employee? employee, MemberDashboard? dashboard, string ragContext)
    {
        if (employee is null) return AgentInstructions;

        var goalsInProgress = dashboard?.DevGoals.Where(g => g.Status != "completed").ToList() ?? [];
        var topGoal = goalsInProgress.FirstOrDefault();

        return $"""
            {AgentInstructions}

            MEMBER PROFILE:
            Name: {employee.Name}
            Role: {employee.Role}
            Tenure: {employee.Tenure}

            CURRENT KPIs:
            Wellbeing: {employee.Wellbeing.Score}% ({employee.Wellbeing.Status})
            Skills: {employee.Skills.Score}% ({employee.Skills.Status})
            Motivation: {employee.Motivation.Score}% ({employee.Motivation.Status})
            Delivery: {employee.Delivery.Score}% ({employee.Delivery.Status})

            DEVELOPMENT CONTEXT:
            IDP Progress: {employee.IdpGoalProgress:P0}
            Skills Coverage: {employee.SkillsCoverage:P0}
            Top Goal: {topGoal?.Title ?? "None set"} ({topGoal?.Progress ?? 0}% progress)

            UPCOMING 1:1 PREP TOPICS:
            {string.Join("\n", dashboard?.PrepTopics ?? ["No topics prepared"])}

            RELEVANT KNOWLEDGE:
            {ragContext}
            """;
    }

    private static List<ChatSuggestion> ExtractSuggestions(MemberDashboard? dashboard) =>
    [
        new() { Text = "Help me prepare talking points for my 1:1" },
        new() { Text = "What should I prioritise for my development this month?" },
        new()
        { Text = dashboard?.DevGoals.FirstOrDefault()?.Title is { } goalTitle
            ? $"How do I make progress on '{goalTitle}'?"
            : "How do I set effective development goals?" }
    ];
}
