using System.ClientModel;
using Logiq.Api.Agents.Abstracts;
using Logiq.Api.Contracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;

namespace Logiq.Api.Controllers;

[ApiController]
[Route("api/copilot")]
public sealed class CopilotController(IPeoplePartnerCopilot copilot) : ControllerBase
{
    [HttpPost("chat")]
    [ProducesResponseType<ChatResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new {error = "Message cannot be empty."});

        string teamId = request.TeamId ?? "team1";
        try
        {
            ChatResponse response = await copilot.ChatAsync(teamId, request, cancellationToken);
            return Ok(response);
        }
        catch (HttpOperationException ex)
        {
            return StatusCode(502,
                new
                {
                    error =
                        "Azure OpenAI request failed. Check appsettings: Azure:OpenAI Endpoint and ChatDeploymentName (deployment must exist in your Azure OpenAI resource).",
                    detail = ex.Message
                });
        }
        catch (ClientResultException ex) when (ex.Status == 404)
        {
            return StatusCode(502,
                new
                {
                    error =
                        "Azure OpenAI deployment not found (404). Ensure ChatDeploymentName in appsettings matches your Azure OpenAI chat deployment.",
                    detail = ex.Message
                });
        }
    }
}