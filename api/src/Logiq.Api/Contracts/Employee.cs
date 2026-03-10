namespace Logiq.Api.Contracts;

public sealed record KpiMetric(int Score, string Status);

public sealed record Employee
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string Tenure { get; init; } = string.Empty;
    public string Avatar { get; init; } = string.Empty;
    public KpiMetric Wellbeing { get; init; } = new(0, "green");
    public KpiMetric Skills { get; init; } = new(0, "green");
    public KpiMetric Motivation { get; init; } = new(0, "green");
    public KpiMetric Delivery { get; init; } = new(0, "green");
    public string ChurnRisk { get; init; } = "Low";
    public int ChurnPercent { get; init; }
    public string Narrative { get; init; } = string.Empty;
    public int SickDays { get; init; }
    public double SickLeaveRate { get; init; }
    public double MeetingHours { get; init; }
    public double MeetingLoad { get; init; }
    public double OvertimeHours { get; init; }
    public int ReplacementCost { get; init; }
    public int SprintCompletion { get; init; }
    public int PrVelocity { get; init; }
    public double LearningHours { get; init; }
    public double PsychSafety { get; init; }
    public double WorkLifeBalance { get; init; }
    public double SkillsCoverage { get; init; }
    public double IdpGoalProgress { get; init; }
    public double FeedbackScore360 { get; init; }
    public double EngagementPulse { get; init; }
    public double GoalAchievement { get; init; }
    public double RetentionRate { get; init; }
    public double PreventabilityScore { get; init; }
}
