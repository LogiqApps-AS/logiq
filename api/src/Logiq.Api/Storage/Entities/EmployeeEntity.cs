using Azure;
using Azure.Data.Tables;

namespace Logiq.Api.Storage.Entities;

public sealed class EmployeeEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Tenure { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public int WellbeingScore { get; set; }
    public string WellbeingStatus { get; set; } = "green";
    public int SkillsScore { get; set; }
    public string SkillsStatus { get; set; } = "green";
    public int MotivationScore { get; set; }
    public string MotivationStatus { get; set; } = "green";
    public int DeliveryScore { get; set; }
    public string DeliveryStatus { get; set; } = "green";
    public string ChurnRisk { get; set; } = "Low";
    public int ChurnPercent { get; set; }
    public string Narrative { get; set; } = string.Empty;
    public int SickDays { get; set; }
    public double SickLeaveRate { get; set; }
    public double MeetingHours { get; set; }
    public double MeetingLoad { get; set; }
    public double OvertimeHours { get; set; }
    public int ReplacementCost { get; set; }
    public int SprintCompletion { get; set; }
    public int PrVelocity { get; set; }
    public double LearningHours { get; set; }
    public double PsychSafety { get; set; }
    public double WorkLifeBalance { get; set; }
    public double SkillsCoverage { get; set; }
    public double IdpGoalProgress { get; set; }
    public double FeedbackScore360 { get; set; }
    public double EngagementPulse { get; set; }
    public double GoalAchievement { get; set; }
    public double RetentionRate { get; set; }
    public double PreventabilityScore { get; set; }
}
