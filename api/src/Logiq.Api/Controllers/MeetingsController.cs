using Logiq.Api.Agents;
using Logiq.Api.Models;
using Logiq.Api.Services;
using Logiq.Api.Storage;
using Microsoft.AspNetCore.Mvc;

namespace Logiq.Api.Controllers;

[ApiController]
[Route("api/teams/{teamId}/meetings")]
public sealed class MeetingsController(
    IMeetingRepository meetingRepository,
    IAnalyzerOrchestrator orchestrator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<Meeting>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUpcoming(string teamId, CancellationToken cancellationToken)
    {
        var meetings = await meetingRepository.ListUpcomingAsync(teamId, cancellationToken);
        return Ok(meetings);
    }

    [HttpGet("past")]
    [ProducesResponseType<IReadOnlyList<Meeting>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPast(string teamId, CancellationToken cancellationToken)
    {
        var meetings = await meetingRepository.ListPastAsync(teamId, cancellationToken);
        return Ok(meetings);
    }

    [HttpGet("deferred-topics")]
    [ProducesResponseType<IReadOnlyList<DeferredTopic>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDeferredTopics(string teamId, CancellationToken cancellationToken)
    {
        var topics = await meetingRepository.ListDeferredTopicsAsync(teamId, cancellationToken);
        return Ok(topics);
    }

    [HttpPost("{meetingId}/prep")]
    [ProducesResponseType<ConversationPrep>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TriggerPrep(string teamId, string meetingId, CancellationToken cancellationToken)
    {
        var meeting = await meetingRepository.GetByIdAsync(teamId, meetingId, cancellationToken);
        if (meeting is null) return NotFound();

        var memberId = meeting.Id.Replace("m", string.Empty);
        var prep = await orchestrator.PrepareConversationAsync(teamId, memberId, cancellationToken);
        return Ok(prep);
    }
}
