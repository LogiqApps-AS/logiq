using Azure;
using Azure.Data.Tables;
using Logiq.Api.Configuration;
using Logiq.Api.Contracts;
using Logiq.Api.Storage.Entities;
using Logiq.Api.Storage.Repositories.Abstracts;
using Microsoft.Extensions.Options;

namespace Logiq.Api.Storage.Repositories;

public sealed class TeamKpiRepository(IOptions<StorageOptions> options) : ITeamKpiRepository
{
    private const string CurrentRowKey = "current";
    private readonly TableClient _table = new(options.Value.ConnectionString, options.Value.TeamKpiSnapshotsTable);

    public async Task<TeamKpis?> GetCurrentAsync(string teamId, CancellationToken cancellationToken = default)
    {
        await _table.CreateIfNotExistsAsync(cancellationToken);
        try
        {
            Response<TeamKpiSnapshotEntity>? response =
                await _table.GetEntityAsync<TeamKpiSnapshotEntity>(teamId, CurrentRowKey,
                    cancellationToken: cancellationToken);
            return MapToKpis(response.Value);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }

    public async Task<TeamFinancials?> GetFinancialsAsync(string teamId, CancellationToken cancellationToken = default)
    {
        await _table.CreateIfNotExistsAsync(cancellationToken);
        try
        {
            Response<TeamKpiSnapshotEntity>? response =
                await _table.GetEntityAsync<TeamKpiSnapshotEntity>(teamId, CurrentRowKey,
                    cancellationToken: cancellationToken);
            return MapToFinancials(response.Value);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }

    public async Task UpsertAsync(string teamId, TeamKpis kpis, TeamFinancials financials,
        CancellationToken cancellationToken = default)
    {
        await _table.CreateIfNotExistsAsync(cancellationToken);
        TeamKpiSnapshotEntity entity = new()
        {
            PartitionKey = teamId,
            RowKey = CurrentRowKey,
            WellbeingScore = kpis.Wellbeing.Score,
            WellbeingStatus = kpis.Wellbeing.Status,
            WellbeingLabel = kpis.Wellbeing.Label,
            WellbeingTrend = kpis.Wellbeing.Trend,
            WellbeingDescription = kpis.Wellbeing.Description,
            SkillsScore = kpis.Skills.Score,
            SkillsStatus = kpis.Skills.Status,
            SkillsLabel = kpis.Skills.Label,
            SkillsTrend = kpis.Skills.Trend,
            SkillsDescription = kpis.Skills.Description,
            MotivationScore = kpis.Motivation.Score,
            MotivationStatus = kpis.Motivation.Status,
            MotivationLabel = kpis.Motivation.Label,
            MotivationTrend = kpis.Motivation.Trend,
            MotivationDescription = kpis.Motivation.Description,
            ChurnScore = kpis.Churn.Score,
            ChurnStatus = kpis.Churn.Status,
            ChurnLabel = kpis.Churn.Label,
            ChurnTrend = kpis.Churn.Trend,
            ChurnDescription = kpis.Churn.Description,
            DeliveryScore = kpis.Delivery.Score,
            DeliveryStatus = kpis.Delivery.Status,
            DeliveryLabel = kpis.Delivery.Label,
            DeliveryTrend = kpis.Delivery.Trend,
            DeliveryDescription = kpis.Delivery.Description,
            AtRiskCount = financials.AtRiskCount,
            TotalEmployees = financials.TotalEmployees,
            ChurnExposure = financials.ChurnExposure,
            TotalPeopleRisk = financials.TotalPeopleRisk
        };
        await _table.UpsertEntityAsync(entity, TableUpdateMode.Replace, cancellationToken);
    }

    private static TeamKpis MapToKpis(TeamKpiSnapshotEntity e) => new()
    {
        Wellbeing = new TeamKpiMetric
        {
            Score = e.WellbeingScore, Status = e.WellbeingStatus, Label = e.WellbeingLabel, Trend = e.WellbeingTrend,
            Description = e.WellbeingDescription
        },
        Skills = new TeamKpiMetric
        {
            Score = e.SkillsScore, Status = e.SkillsStatus, Label = e.SkillsLabel, Trend = e.SkillsTrend,
            Description = e.SkillsDescription
        },
        Motivation = new TeamKpiMetric
        {
            Score = e.MotivationScore, Status = e.MotivationStatus, Label = e.MotivationLabel,
            Trend = e.MotivationTrend, Description = e.MotivationDescription
        },
        Churn = new TeamKpiMetric
        {
            Score = e.ChurnScore, Status = e.ChurnStatus, Label = e.ChurnLabel, Trend = e.ChurnTrend,
            Description = e.ChurnDescription
        },
        Delivery = new TeamKpiMetric
        {
            Score = e.DeliveryScore, Status = e.DeliveryStatus, Label = e.DeliveryLabel, Trend = e.DeliveryTrend,
            Description = e.DeliveryDescription
        }
    };

    private static TeamFinancials MapToFinancials(TeamKpiSnapshotEntity e) => new()
    {
        AtRiskCount = e.AtRiskCount,
        TotalEmployees = e.TotalEmployees,
        ChurnExposure = e.ChurnExposure,
        TotalPeopleRisk = e.TotalPeopleRisk
    };
}