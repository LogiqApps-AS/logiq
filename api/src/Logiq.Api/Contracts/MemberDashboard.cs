namespace Logiq.Api.Contracts;

public sealed record DevGoal
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public int Progress { get; init; }
    public string Status { get; init; } = "on-track";
    public string? Description { get; init; }
    public string? TargetDate { get; init; }
}

public sealed record LearningItem
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Duration { get; init; } = string.Empty;
    public string Priority { get; init; } = "MEDIUM";
}

public sealed record MemberSkill
{
    public string Name { get; init; } = string.Empty;
    public int Level { get; init; }
    public string Trend { get; init; } = "stable";
}

public sealed record SprintContribution
{
    public string Name { get; init; } = string.Empty;
    public int Tasks { get; init; }
    public int Points { get; init; }
    public string Status { get; init; } = "Completed";
}

public sealed record MemberDeliveryStats
{
    public int HoursThisWeek { get; init; }
    public int PrsMerged { get; init; }
    public int TasksCompleted { get; init; }
    public int MeetingHours { get; init; }
}

public sealed record MemberKpis
{
    public KpiMetric Wellbeing { get; init; } = new(0, "green");
    public KpiMetric Skills { get; init; } = new(0, "green");
    public KpiMetric Motivation { get; init; } = new(0, "green");
    public KpiMetric Delivery { get; init; } = new(0, "green");
}

public sealed record MemberDashboard
{
    public string EmployeeId { get; init; } = string.Empty;
    public MemberKpis Kpis { get; init; } = new();
    public List<MemberSignal> Signals { get; init; } = [];
    public List<DevGoal> DevGoals { get; init; } = [];
    public List<LearningItem> LearningItems { get; init; } = [];
    public List<MemberSkill> Skills { get; init; } = [];
    public List<SprintContribution> SprintContributions { get; init; } = [];
    public MemberDeliveryStats DeliveryStats { get; init; } = new();
    public List<string> PrepTopics { get; init; } = [];
    public List<string> CoachTips { get; init; } = [];
    public List<string> Wins { get; init; } = [];
    public List<string> QuestionsToAsk { get; init; } = [];
}
