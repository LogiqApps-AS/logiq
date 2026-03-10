namespace Logiq.Api.Configuration;

public sealed class StorageOptions
{
    public string ConnectionString { get; set; } = string.Empty;
    public string EmployeesTable { get; set; } = "LogiqEmployees";
    public string SignalsTable { get; set; } = "LogiqSignals";
    public string MeetingsTable { get; set; } = "LogiqMeetings";
    public string DeferredTopicsTable { get; set; } = "LogiqDeferredTopics";
    public string TeamKpiSnapshotsTable { get; set; } = "LogiqTeamKpiSnapshots";
    public string AnalysisResultsTable { get; set; } = "LogiqAnalysisResults";
}
