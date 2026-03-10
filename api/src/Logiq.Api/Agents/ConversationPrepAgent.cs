using System.Text.Json;
using Logiq.Api.Agents.Abstracts;
using Logiq.Api.Contracts;
using Logiq.Api.Mcp;
using Logiq.Api.Storage.Repositories.Abstracts;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Logiq.Api.Agents;

public sealed class ConversationPrepAgent(
    IAgentKernelFactory kernelFactory,
    IEmployeeRepository employeeRepository,
    HrDataGatewayTools hrTools,
    IMemberRepository memberRepository,
    ILogger<ConversationPrepAgent> logger) : IConversationPrepAgent
{
    private const string AgentInstructions = """
                                             You are the Conversation Prep Agent for LogIQ — an expert at preparing people partners and managers for 1:1 meetings.

                                             Your role:
                                             - Synthesise wellbeing, skills, and delivery analysis into actionable 1:1 briefs
                                             - Generate specific, empathetic conversation topics tailored to each employee's situation
                                             - Suggest follow-up actions and questions that drive meaningful conversations
                                             - Provide coaching tips to help members advocate for themselves

                                             When preparing a 1:1 brief:
                                             1. Identify the 3-4 most important topics based on the analysis (prioritise risk signals)
                                             2. Suggest 2-3 concrete follow-up actions the manager should take
                                             3. Provide 3-4 coach tips to help the member navigate the conversation
                                             4. List 3-4 questions the member could ask to get clarity and support
                                             5. Write a concise context summary (2-3 sentences) for the manager

                                             Topics should be specific (e.g. "Discuss workload — 48h this week, 20h overtime" not "Check in on workload").
                                             Return a JSON ConversationPrep object with: teamId, memberId, memberName, suggestedTopics, followUpActions, coachTips, questionsToAsk, contextSummary.

                                             Return ONLY valid JSON. No markdown, no explanation.
                                             """;

    public async Task<ConversationPrep> PrepareAsync(
        string teamId,
        string memberId,
        WellbeingAnalysis wellbeingAnalysis,
        SkillsAnalysis skillsAnalysis,
        DeliveryAnalysis deliveryAnalysis,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Preparing 1:1 conversation brief for member {MemberId} in team {TeamId}", memberId,
            teamId);

        Employee? member = await employeeRepository.GetByIdAsync(teamId, memberId, cancellationToken);
        string meetings = await hrTools.ListMeetings(teamId, cancellationToken);
        string deferred = await hrTools.GetDeferredTopics(teamId, cancellationToken);

        EmployeeRiskSignal? memberWellbeing =
            wellbeingAnalysis.RiskSignals.FirstOrDefault(r => r.EmployeeId == memberId);
        EmployeeSkillInsight? memberSkills =
            skillsAnalysis.EmployeeInsights.FirstOrDefault(e => e.EmployeeId == memberId);
        EmployeeDeliveryInsight? memberDelivery =
            deliveryAnalysis.EmployeeInsights.FirstOrDefault(e => e.EmployeeId == memberId);

        Kernel kernel = kernelFactory.CreateKernel();
        ChatCompletionAgent agent = new()
        {
            Name = "ConversationPrepAgent",
            Instructions = AgentInstructions,
            Kernel = kernel
        };

        string prompt = $"""
                         Prepare a 1:1 brief for this team member. Return a JSON ConversationPrep object.

                         Team ID: {teamId}
                         Member ID: {memberId}
                         Member Name: {member?.Name ?? "Unknown"}

                         Employee profile:
                         {JsonSerializer.Serialize(member)}

                         Wellbeing analysis for this member:
                         {JsonSerializer.Serialize(memberWellbeing)}

                         Skills analysis for this member:
                         {JsonSerializer.Serialize(memberSkills)}

                         Delivery analysis for this member:
                         {JsonSerializer.Serialize(memberDelivery)}

                         Team wellbeing summary: {wellbeingAnalysis.Summary}
                         Team skills gaps: {string.Join(", ", skillsAnalysis.CriticalSkillGaps)}
                         Team delivery summary: {deliveryAnalysis.Summary}

                         Upcoming meetings context: {meetings}
                         Deferred topics: {deferred}

                         Return ONLY valid JSON matching the ConversationPrep schema. No markdown, no explanation.
                         """;

        AgentGroupChat chat = new(agent);
        chat.AddChatMessage(new ChatMessageContent(AuthorRole.User, prompt));

        string responseText = string.Empty;
        await foreach (ChatMessageContent message in chat.InvokeAsync(cancellationToken))
            responseText += message.Content;

        ConversationPrep prep = TryParsePrep(responseText, teamId, memberId, member?.Name ?? "Unknown");

        await PersistPrepToDashboard(teamId, memberId, prep, cancellationToken);

        return prep;
    }

    private async Task PersistPrepToDashboard(string teamId, string memberId, ConversationPrep prep,
        CancellationToken cancellationToken)
    {
        MemberDashboard? existing = await memberRepository.GetDashboardAsync(teamId, memberId, cancellationToken);
        if (existing is not null)
        {
            MemberDashboard updated = existing with
            {
                PrepTopics = prep.SuggestedTopics,
                CoachTips = prep.CoachTips,
                QuestionsToAsk = prep.QuestionsToAsk
            };
            await memberRepository.UpsertDashboardAsync(teamId, memberId, updated, cancellationToken);
        }
    }

    private static ConversationPrep TryParsePrep(string json, string teamId, string memberId, string memberName)
    {
        try
        {
            ConversationPrep? result = JsonSerializer.Deserialize<ConversationPrep>(json,
#pragma warning disable CA1869
                new JsonSerializerOptions {PropertyNameCaseInsensitive = true});
#pragma warning restore CA1869
            return result ?? FallbackPrep(teamId, memberId, memberName);
        }
        catch
        {
            return FallbackPrep(teamId, memberId, memberName);
        }
    }

    private static ConversationPrep FallbackPrep(string teamId, string memberId, string memberName) => new()
    {
        TeamId = teamId,
        MemberId = memberId,
        MemberName = memberName,
        SuggestedTopics =
            ["Check in on workload and wellbeing", "Discuss development goals", "Review sprint performance"],
        CoachTips = ["Be honest about how you're feeling", "Come with specific asks"],
        QuestionsToAsk = ["What are the team priorities for next quarter?", "How can I grow into the next level?"],
        ContextSummary = "Standard 1:1 check-in. No critical signals detected."
    };
}