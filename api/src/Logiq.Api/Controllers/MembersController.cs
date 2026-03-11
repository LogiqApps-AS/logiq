using Logiq.Api.Agents.Abstracts;
using Logiq.Api.Contracts;
using Logiq.Api.Storage.Repositories.Abstracts;
using Microsoft.AspNetCore.Mvc;

namespace Logiq.Api.Controllers;

[ApiController]
public sealed class MembersController(
    IMemberRepository memberRepository,
    IEmployeeRepository employeeRepository,
    ISignalRepository signalRepository,
    IAnalyzerOrchestrator orchestrator) : ControllerBase
{
    [HttpGet("api/members/{memberId}/dashboard")]
    [ProducesResponseType<MemberDashboard>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDashboard(string memberId, [FromQuery] string teamId = "team1",
        CancellationToken cancellationToken = default)
    {
        MemberDashboard? dashboard = await memberRepository.GetDashboardAsync(teamId, memberId, cancellationToken);
        if (dashboard is not null) return Ok(dashboard);

        Employee? employee = await employeeRepository.GetByIdAsync(teamId, memberId, cancellationToken);
        if (employee is null) return NotFound();

        SkillsMatrix matrix = await memberRepository.GetSkillsMatrixAsync(teamId, cancellationToken);
        List<string> skills = matrix.EmployeeSkills.TryGetValue(memberId, out List<string>? list) ? list : [];
        MemberDashboard synthesized = new()
        {
            EmployeeId = memberId,
            Kpis = new MemberKpis
            {
                Wellbeing = employee.Wellbeing,
                Skills = employee.Skills,
                Motivation = employee.Motivation,
                Delivery = employee.Delivery
            },
            Signals = [],
            DevGoals =
            [
                new DevGoal
                {
                    Id = "g0", Title = "Continue growth in role", Category = "Career",
                    Progress = (int) (employee.IdpGoalProgress * 100), Status = "on-track", TargetDate = "2026-12-31"
                }
            ],
            LearningItems = [],
            Skills = skills.Take(8)
                .Select((s, idx) => new MemberSkill {Name = s, Level = 60 + idx % 3 * 15, Trend = "stable"}).ToList(),
            SprintContributions =
                [new SprintContribution {Name = "Current Sprint", Tasks = 5, Points = 10, Status = "In Progress"}],
            DeliveryStats = new MemberDeliveryStats
            {
                HoursThisWeek = (int) employee.MeetingHours + 25, PrsMerged = employee.PrVelocity, TasksCompleted = 5,
                MeetingHours = (int) employee.MeetingHours
            },
            PrepTopics = ["Discuss current priorities", "Align on goals"],
            CoachTips = ["Prepare 2-3 talking points before your 1:1", "Ask for feedback on one specific area"],
            Wins = [],
            QuestionsToAsk = ["What are the team priorities?", "How can I contribute more?"]
        };
        return Ok(synthesized);
    }

    [HttpGet("api/members/{memberId}/signals")]
    [ProducesResponseType<IReadOnlyList<MemberSignal>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMemberSignals(string memberId, [FromQuery] string teamId = "team1",
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<MemberSignal> signals =
            await signalRepository.ListMemberSignalsAsync(teamId, memberId, cancellationToken);
        return Ok(signals);
    }

    [HttpPost("api/members/{memberId}/prep")]
    [ProducesResponseType<ConversationPrep>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPrep(string memberId, [FromQuery] string teamId = "team1",
        CancellationToken cancellationToken = default)
    {
        ConversationPrep prep = await orchestrator.PrepareConversationAsync(teamId, memberId, cancellationToken);

        return Ok(prep);
    }
}