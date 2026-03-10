namespace Logiq.Api.Contracts;

public sealed record Project
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string Period { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Status { get; init; } = "Active";
    public List<string> Skills { get; init; } = [];
}

public sealed record FeedbackEntry
{
    public string Id { get; init; } = string.Empty;
    public string ReviewerName { get; init; } = string.Empty;
    public string ReviewerRole { get; init; } = string.Empty;
    public string Type { get; init; } = "Peer";
    public string Date { get; init; } = string.Empty;
    public double Rating { get; init; }
    public string Comment { get; init; } = string.Empty;
    public List<string> Strengths { get; init; } = [];
    public List<string> GrowthAreas { get; init; } = [];
}

public sealed record Training
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Provider { get; init; } = string.Empty;
    public List<string> Tags { get; init; } = [];
    public int Hours { get; init; }
    public string StartDate { get; init; } = string.Empty;
    public string? CompletedDate { get; init; }
    public string Status { get; init; } = "Planned";
    public int? Score { get; init; }
}

public sealed record SignalEntry
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Severity { get; init; } = "info";
    public string TimeAgo { get; init; } = string.Empty;
}

public sealed record RoleHistory
{
    public string Title { get; init; } = string.Empty;
    public string Department { get; init; } = string.Empty;
    public string Period { get; init; } = string.Empty;
    public string Duration { get; init; } = string.Empty;
    public bool Current { get; init; }
}

public sealed record Certification
{
    public string Title { get; init; } = string.Empty;
    public string Provider { get; init; } = string.Empty;
    public string Status { get; init; } = "Planned";
}

public sealed record MemberDetail
{
    public string Department { get; init; } = string.Empty;
    public string? PreviousRole { get; init; }
    public string? PreviousRolePeriod { get; init; }
    public List<string> Skills { get; init; } = [];
    public List<Project> Projects { get; init; } = [];
    public List<FeedbackEntry> Feedback { get; init; } = [];
    public List<Training> Training { get; init; } = [];
    public List<SignalEntry> Signals { get; init; } = [];
    public List<RoleHistory> RoleHistory { get; init; } = [];
    public List<Certification> Certifications { get; init; } = [];
    public double FeedbackScoreAvg { get; init; }
    public int TrainingHoursTotal { get; init; }
    public int ActiveSignalsCount { get; init; }
    public int ProjectCount { get; init; }
}
