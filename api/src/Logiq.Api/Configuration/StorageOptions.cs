namespace Logiq.Api.Configuration;

public sealed class StorageOptions
{
    public string ConnectionString { get; set; } = string.Empty;
    public string TablesPrefix { get; set; } = "Logiq";
    public string EmployeesTable { get; set; } = "LogiqEmployees";
    public string SignalsTable { get; set; } = "LogiqSignals";
    public string MeetingsTable { get; set; } = "LogiqMeetings";
    public string MeetingTopicsTable { get; set; } = "LogiqMeetingTopics";
    public string FollowUpsTable { get; set; } = "LogiqFollowUps";
    public string DeferredTopicsTable { get; set; } = "LogiqDeferredTopics";
    public string TeamKpiSnapshotsTable { get; set; } = "LogiqTeamKpiSnapshots";
    public string MemberSkillsTable { get; set; } = "LogiqMemberSkills";
    public string SkillsCatalogTable { get; set; } = "LogiqSkillsCatalog";
    public string ProjectsTable { get; set; } = "LogiqProjects";
    public string FeedbackTable { get; set; } = "LogiqFeedback";
    public string TrainingTable { get; set; } = "LogiqTraining";
    public string MemberSignalsTable { get; set; } = "LogiqMemberSignals";
    public string DevGoalsTable { get; set; } = "LogiqDevGoals";
    public string LearningItemsTable { get; set; } = "LogiqLearningItems";
    public string SprintsTable { get; set; } = "LogiqSprints";
    public string PulseResultsTable { get; set; } = "LogiqPulseResults";
    public string AnalysisResultsTable { get; set; } = "LogiqAnalysisResults";
}
