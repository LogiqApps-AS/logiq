using System.Text.Json;
using Logiq.Api.Mcp;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Logiq.Api.Agents;

public interface ISkillsGrowthAnalyzer
{
    Task<SkillsAnalysis> AnalyzeTeamAsync(string teamId, CancellationToken cancellationToken = default);
}

public sealed class SkillsGrowthAnalyzer(
    IAgentKernelFactory kernelFactory,
    LearningSkillsTools learningTools,
    ILogger<SkillsGrowthAnalyzer> logger) : ISkillsGrowthAnalyzer
{
    private const string AgentInstructions = """
        You are the Skills & Growth Analyzer for Logiq.

        Your role:
        - Assess team skills coverage and identify critical gaps
        - Evaluate IDP progress and learning engagement
        - Recommend specific learning paths for employees

        When given training and skill data, you will:
        1. Calculate average skills coverage across the team
        2. Identify the top 3-5 critical skill gaps (skills with <50% coverage or missing from the team)
        3. For each employee, recommend 1-2 specific learning items based on their skill gaps and IDP progress
        4. Surface employees with stalled IDP progress (<20% progress) as concerns
        5. Produce a brief summary with top insights

        Return a JSON object matching SkillsAnalysis schema with: teamId, teamSkillsCoverageAvg, criticalSkillGaps (string array), employeeInsights (array), summary.
        Each employeeInsight has: employeeId, name, skillsCoverage, idpProgress, recommendedLearning (string array).

        Return ONLY valid JSON. No markdown, no explanation.
        """;

    public async Task<SkillsAnalysis> AnalyzeTeamAsync(string teamId, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Running Skills & Growth analysis for team {TeamId}", teamId);

        string trainingJson = await learningTools.GetTrainingRecords(teamId, cancellationToken);
        string idpJson = await learningTools.GetIdpGoals(teamId, cancellationToken);
        string skillsJson = await learningTools.GetSkillAssessments(teamId, cancellationToken);

        Kernel kernel = kernelFactory.CreateKernel();
        ChatCompletionAgent agent = new()
        {
            Name = "SkillsGrowthAnalyzer",
            Instructions = AgentInstructions,
            Kernel = kernel
        };

        string prompt = $"""
                         Analyze this team's skills and growth data. Return a JSON SkillsAnalysis object.
                         Team ID: {teamId}

                         Training records:
                         {trainingJson}

                         IDP goals:
                         {idpJson}

                         Skills matrix:
                         {skillsJson}

                         Return ONLY valid JSON matching the SkillsAnalysis schema. No markdown, no explanation.
                         """;

        AgentGroupChat chat = new AgentGroupChat(agent);
        chat.AddChatMessage(new ChatMessageContent(AuthorRole.User, prompt));

        string responseText = string.Empty;
        await foreach (ChatMessageContent message in chat.InvokeAsync(cancellationToken))
            responseText += message.Content;

        return TryParseAnalysis(responseText, teamId);
    }

    private static SkillsAnalysis TryParseAnalysis(string json, string teamId)
    {
        try
        {
            SkillsAnalysis? result = JsonSerializer.Deserialize<SkillsAnalysis>(json,
#pragma warning disable CA1869
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
#pragma warning restore CA1869
            return result ?? FallbackAnalysis(teamId);
        }
        catch
        {
            return FallbackAnalysis(teamId);
        }
    }

    private static SkillsAnalysis FallbackAnalysis(string teamId) => new()
    {
        TeamId = teamId,
        TeamSkillsCoverageAvg = 71,
        CriticalSkillGaps = ["Cloud Architecture", "ML/AI", "Data Engineering"],
        Summary = "Skills analysis unavailable — using baseline metrics."
    };
}
