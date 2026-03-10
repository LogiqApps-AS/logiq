namespace Logiq.Api.Contracts;

public sealed record WellbeingAnalysis
{
    public string TeamId { get; init; } = string.Empty;
    public DateTimeOffset AnalyzedAt { get; init; } = DateTimeOffset.UtcNow;
    public List<EmployeeRiskSignal> RiskSignals { get; init; } = [];
    public double TeamWellbeingIndex { get; init; }
    public List<string> KeyInsights { get; init; } = [];
    public string Summary { get; init; } = string.Empty;
}

public sealed record EmployeeRiskSignal
{
    public string EmployeeId { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string RiskLevel { get; init; } = "Low";
    public List<string> Signals { get; init; } = [];
    public string RecommendedAction { get; init; } = string.Empty;
}

public sealed record SkillsAnalysis
{
    public string TeamId { get; init; } = string.Empty;
    public DateTimeOffset AnalyzedAt { get; init; } = DateTimeOffset.UtcNow;
    public double TeamSkillsCoverageAvg { get; init; }
    public List<string> CriticalSkillGaps { get; init; } = [];
    public List<EmployeeSkillInsight> EmployeeInsights { get; init; } = [];
    public string Summary { get; init; } = string.Empty;
}

public sealed record EmployeeSkillInsight
{
    public string EmployeeId { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public double SkillsCoverage { get; init; }
    public double IdpProgress { get; init; }
    public List<string> RecommendedLearning { get; init; } = [];
}

public sealed record DeliveryAnalysis
{
    public string TeamId { get; init; } = string.Empty;
    public DateTimeOffset AnalyzedAt { get; init; } = DateTimeOffset.UtcNow;
    public double TeamVelocityAvg { get; init; }
    public List<string> WorkloadAlerts { get; init; } = [];
    public List<EmployeeDeliveryInsight> EmployeeInsights { get; init; } = [];
    public string Summary { get; init; } = string.Empty;
}

public sealed record EmployeeDeliveryInsight
{
    public string EmployeeId { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int SprintCompletion { get; init; }
    public double MeetingLoad { get; init; }
    public double OvertimeHours { get; init; }
    public string WorkloadStatus { get; init; } = "normal";
}

public sealed record ConversationPrep
{
    public string TeamId { get; init; } = string.Empty;
    public string MemberId { get; init; } = string.Empty;
    public string MemberName { get; init; } = string.Empty;
    public DateTimeOffset GeneratedAt { get; init; } = DateTimeOffset.UtcNow;
    public List<string> SuggestedTopics { get; init; } = [];
    public List<string> FollowUpActions { get; init; } = [];
    public List<string> CoachTips { get; init; } = [];
    public List<string> QuestionsToAsk { get; init; } = [];
    public string ContextSummary { get; init; } = string.Empty;
}
