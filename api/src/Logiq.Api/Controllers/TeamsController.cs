using Logiq.Api.Models;
using Logiq.Api.Storage;
using Microsoft.AspNetCore.Mvc;

namespace Logiq.Api.Controllers;

[ApiController]
[Route("api/teams/{teamId}")]
public sealed class TeamsController(
    IEmployeeRepository employeeRepository,
    ISignalRepository signalRepository,
    ITeamKpiRepository kpiRepository,
    IMemberRepository memberRepository) : ControllerBase
{
    [HttpGet("employees")]
    [ProducesResponseType<IReadOnlyList<Employee>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEmployees(string teamId, CancellationToken cancellationToken)
    {
        var employees = await employeeRepository.ListByTeamAsync(teamId, cancellationToken);
        return Ok(employees);
    }

    [HttpGet("employees/{employeeId}")]
    [ProducesResponseType<Employee>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmployee(string teamId, string employeeId, CancellationToken cancellationToken)
    {
        var employee = await employeeRepository.GetByIdAsync(teamId, employeeId, cancellationToken);
        return employee is not null ? Ok(employee) : NotFound();
    }

    [HttpGet("signals")]
    [ProducesResponseType<IReadOnlyList<Signal>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSignals(string teamId, CancellationToken cancellationToken)
    {
        var signals = await signalRepository.ListTeamSignalsAsync(teamId, cancellationToken);
        return Ok(signals);
    }

    [HttpGet("kpis")]
    [ProducesResponseType<TeamKpis>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKpis(string teamId, CancellationToken cancellationToken)
    {
        var kpis = await kpiRepository.GetCurrentAsync(teamId, cancellationToken);
        return kpis is not null ? Ok(kpis) : Ok(new TeamKpis());
    }

    [HttpGet("financials")]
    [ProducesResponseType<TeamFinancials>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFinancials(string teamId, CancellationToken cancellationToken)
    {
        var financials = await kpiRepository.GetFinancialsAsync(teamId, cancellationToken);
        return financials is not null ? Ok(financials) : Ok(new TeamFinancials());
    }

    [HttpGet("skills")]
    [ProducesResponseType<SkillsMatrix>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSkills(string teamId, CancellationToken cancellationToken)
    {
        var matrix = await memberRepository.GetSkillsMatrixAsync(teamId, cancellationToken);
        return Ok(matrix);
    }

    [HttpGet("members/{memberId}/detail")]
    [ProducesResponseType<MemberDetail>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMemberDetail(string teamId, string memberId, CancellationToken cancellationToken)
    {
        var detail = await memberRepository.GetDetailAsync(teamId, memberId, cancellationToken);
        if (detail is not null)
            return Ok(detail);

        var employee = await employeeRepository.GetByIdAsync(teamId, memberId, cancellationToken);
        if (employee is null)
            return NotFound();

        var skillsMatrix = await memberRepository.GetSkillsMatrixAsync(teamId, cancellationToken);
        var skills = (skillsMatrix.EmployeeSkills ?? new Dictionary<string, List<string>>()).TryGetValue(memberId, out var list) ? list : new List<string>();
        var synthesized = new MemberDetail
        {
            Department = "Engineering",
            Skills = skills,
            RoleHistory = [new RoleHistory { Title = employee.Role, Department = "Engineering", Period = "Present", Duration = employee.Tenure ?? "", Current = true }],
            Projects = [],
            Feedback = [],
            Training = [],
            Signals = [],
            Certifications = [],
            FeedbackScoreAvg = 0,
            TrainingHoursTotal = 0,
            ActiveSignalsCount = 0,
            ProjectCount = 0
        };
        return Ok(synthesized);
    }
}
