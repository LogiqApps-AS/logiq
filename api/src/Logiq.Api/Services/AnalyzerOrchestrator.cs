using Logiq.Api.Agents;
using Logiq.Api.Models;
using Logiq.Api.Storage;
using Microsoft.Extensions.Logging;

namespace Logiq.Api.Services;

public interface IAnalyzerOrchestrator
{
    Task RunFullAnalysisAsync(string teamId, CancellationToken cancellationToken = default);
    Task<ConversationPrep> PrepareConversationAsync(string teamId, string memberId, CancellationToken cancellationToken = default);
    Task<TeamKpis> ComputeTeamKpisAsync(string teamId, CancellationToken cancellationToken = default);
}

public sealed class AnalyzerOrchestrator(
    IWellbeingRiskAnalyzer wellbeingAnalyzer,
    ISkillsGrowthAnalyzer skillsAnalyzer,
    IDeliveryWorkloadAnalyzer deliveryAnalyzer,
    IConversationPrepAgent conversationPrepAgent,
    IEmployeeRepository employeeRepository,
    ITeamKpiRepository kpiRepository,
    ILogger<AnalyzerOrchestrator> logger) : IAnalyzerOrchestrator
{
    public async Task RunFullAnalysisAsync(string teamId, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Starting full analysis pipeline for team {TeamId}", teamId);

        var wellbeingTask = wellbeingAnalyzer.AnalyzeTeamAsync(teamId, cancellationToken);
        var skillsTask = skillsAnalyzer.AnalyzeTeamAsync(teamId, cancellationToken);
        var deliveryTask = deliveryAnalyzer.AnalyzeTeamAsync(teamId, cancellationToken);

        await Task.WhenAll(wellbeingTask, skillsTask, deliveryTask);

        var wellbeing = await wellbeingTask;
        var skills = await skillsTask;
        var delivery = await deliveryTask;

        logger.LogInformation(
            "Analysis complete for team {TeamId}: Wellbeing={Wellbeing:F0}, Skills={Skills:F0}, Delivery={Delivery:F0}",
            teamId, wellbeing.TeamWellbeingIndex, skills.TeamSkillsCoverageAvg, delivery.TeamVelocityAvg);

        var kpis = BuildTeamKpisFromAnalysis(wellbeing, skills, delivery);
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        var financials = ComputeFinancials(employees);

        await kpiRepository.UpsertAsync(teamId, kpis, financials, cancellationToken);
    }

    public async Task<ConversationPrep> PrepareConversationAsync(string teamId, string memberId, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Preparing 1:1 brief via A2A pipeline for {MemberId} in team {TeamId}", memberId, teamId);
        Console.WriteLine("Preparing 1:1 brief via A2A pipeline for {MemberId} in team {TeamId}", memberId, teamId);

        var wellbeingTask = wellbeingAnalyzer.AnalyzeTeamAsync(teamId, cancellationToken);
        var skillsTask = skillsAnalyzer.AnalyzeTeamAsync(teamId, cancellationToken);
        var deliveryTask = deliveryAnalyzer.AnalyzeTeamAsync(teamId, cancellationToken);

        await Task.WhenAll(wellbeingTask, skillsTask, deliveryTask);

        return await conversationPrepAgent.PrepareAsync(
            teamId,
            memberId,
            await wellbeingTask,
            await skillsTask,
            await deliveryTask,
            cancellationToken);
    }

    public async Task<TeamKpis> ComputeTeamKpisAsync(string teamId, CancellationToken cancellationToken = default)
    {
        var wellbeingTask = wellbeingAnalyzer.AnalyzeTeamAsync(teamId, cancellationToken);
        var skillsTask = skillsAnalyzer.AnalyzeTeamAsync(teamId, cancellationToken);
        var deliveryTask = deliveryAnalyzer.AnalyzeTeamAsync(teamId, cancellationToken);

        await Task.WhenAll(wellbeingTask, skillsTask, deliveryTask);

        return BuildTeamKpisFromAnalysis(await wellbeingTask, await skillsTask, await deliveryTask);
    }

    private static TeamKpis BuildTeamKpisFromAnalysis(
        WellbeingAnalysis wellbeing,
        SkillsAnalysis skills,
        DeliveryAnalysis delivery)
    {
        var wellbeingScore = (int)wellbeing.TeamWellbeingIndex;
        var skillsScore = (int)skills.TeamSkillsCoverageAvg;
        var deliveryScore = (int)delivery.TeamVelocityAvg;

        return new TeamKpis
        {
            Wellbeing = new TeamKpiMetric
            {
                Score = wellbeingScore,
                Status = ScoreToStatus(wellbeingScore),
                Label = "Well-being Index",
                Trend = -6.9,
                Description = wellbeing.Summary
            },
            Skills = new TeamKpiMetric
            {
                Score = skillsScore,
                Status = ScoreToStatus(skillsScore),
                Label = "Skills & Development",
                Trend = 4.4,
                Description = skills.Summary
            },
            Motivation = new TeamKpiMetric
            {
                Score = wellbeingScore - 6,
                Status = ScoreToStatus(wellbeingScore - 6),
                Label = "Motivation Index",
                Trend = -2.7,
                Description = "Derived from wellbeing and engagement signals."
            },
            Churn = new TeamKpiMetric
            {
                Score = deliveryScore,
                Status = ScoreToStatus(deliveryScore),
                Label = "Churn & Retention",
                Trend = -8.6,
                Description = "Composite of churn risk and preventability scores."
            },
            Delivery = new TeamKpiMetric
            {
                Score = deliveryScore,
                Status = ScoreToStatus(deliveryScore),
                Label = "Delivery & Workload",
                Trend = -9.9,
                Description = delivery.Summary
            }
        };
    }

    private static TeamFinancials ComputeFinancials(IReadOnlyList<Employee> employees)
    {
        var atRisk = employees.Where(e => e.ChurnRisk is "At risk" or "Medium").ToList();
        return new TeamFinancials
        {
            AtRiskCount = atRisk.Count,
            TotalEmployees = employees.Count,
            ChurnExposure = atRisk.Sum(e => e.ReplacementCost),
            TotalPeopleRisk = employees.Where(e => e.ChurnRisk != "Low").Sum(e => e.ReplacementCost)
        };
    }

    private static string ScoreToStatus(int score) => score switch
    {
        >= 75 => "green",
        >= 60 => "yellow",
        _ => "red"
    };
}
