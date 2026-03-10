using Logiq.Api.Contracts;

namespace Logiq.Api.Agents.Abstracts;

public interface IConversationPrepAgent
{
    Task<ConversationPrep> PrepareAsync(
        string teamId,
        string memberId,
        WellbeingAnalysis wellbeingAnalysis,
        SkillsAnalysis skillsAnalysis,
        DeliveryAnalysis deliveryAnalysis,
        CancellationToken cancellationToken = default);
}