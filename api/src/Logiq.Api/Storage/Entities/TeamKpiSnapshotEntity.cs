using Azure;
using Azure.Data.Tables;

namespace Logiq.Api.Storage.Entities;

public sealed class TeamKpiSnapshotEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public int WellbeingScore { get; set; }
    public string WellbeingStatus { get; set; } = "green";
    public string WellbeingLabel { get; set; } = string.Empty;
    public double WellbeingTrend { get; set; }
    public string WellbeingDescription { get; set; } = string.Empty;

    public int SkillsScore { get; set; }
    public string SkillsStatus { get; set; } = "green";
    public string SkillsLabel { get; set; } = string.Empty;
    public double SkillsTrend { get; set; }
    public string SkillsDescription { get; set; } = string.Empty;

    public int MotivationScore { get; set; }
    public string MotivationStatus { get; set; } = "green";
    public string MotivationLabel { get; set; } = string.Empty;
    public double MotivationTrend { get; set; }
    public string MotivationDescription { get; set; } = string.Empty;

    public int ChurnScore { get; set; }
    public string ChurnStatus { get; set; } = "green";
    public string ChurnLabel { get; set; } = string.Empty;
    public double ChurnTrend { get; set; }
    public string ChurnDescription { get; set; } = string.Empty;

    public int DeliveryScore { get; set; }
    public string DeliveryStatus { get; set; } = "green";
    public string DeliveryLabel { get; set; } = string.Empty;
    public double DeliveryTrend { get; set; }
    public string DeliveryDescription { get; set; } = string.Empty;

    public int AtRiskCount { get; set; }
    public int TotalEmployees { get; set; }
    public int ChurnExposure { get; set; }
    public int TotalPeopleRisk { get; set; }
}
