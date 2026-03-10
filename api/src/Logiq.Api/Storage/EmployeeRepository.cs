using Azure.Data.Tables;
using Logiq.Api.Configuration;
using Logiq.Api.Models;
using Logiq.Api.Storage.Entities;
using Microsoft.Extensions.Options;

namespace Logiq.Api.Storage;

public sealed class EmployeeRepository(IOptions<StorageOptions> options) : IEmployeeRepository
{
    private readonly TableClient _table = new(options.Value.ConnectionString, options.Value.EmployeesTable);

    public async Task<IReadOnlyList<Employee>> ListByTeamAsync(string teamId, CancellationToken cancellationToken = default)
    {
        await _table.CreateIfNotExistsAsync(cancellationToken);
        var results = new List<Employee>();
        await foreach (var entity in _table.QueryAsync<EmployeeEntity>(e => e.PartitionKey == teamId, cancellationToken: cancellationToken))
            results.Add(MapToModel(entity));
        return results;
    }

    public async Task<Employee?> GetByIdAsync(string teamId, string employeeId, CancellationToken cancellationToken = default)
    {
        await _table.CreateIfNotExistsAsync(cancellationToken);
        try
        {
            var response = await _table.GetEntityAsync<EmployeeEntity>(teamId, employeeId, cancellationToken: cancellationToken);
            return MapToModel(response.Value);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }

    public async Task UpsertAsync(string teamId, Employee employee, CancellationToken cancellationToken = default)
    {
        await _table.CreateIfNotExistsAsync(cancellationToken);
        var entity = MapToEntity(teamId, employee);
        await _table.UpsertEntityAsync(entity, TableUpdateMode.Replace, cancellationToken);
    }

    private static Employee MapToModel(EmployeeEntity e) => new()
    {
        Id = e.RowKey,
        Name = e.Name,
        Role = e.Role,
        Tenure = e.Tenure,
        Avatar = e.Avatar,
        Wellbeing = new KpiMetric(e.WellbeingScore, e.WellbeingStatus),
        Skills = new KpiMetric(e.SkillsScore, e.SkillsStatus),
        Motivation = new KpiMetric(e.MotivationScore, e.MotivationStatus),
        Delivery = new KpiMetric(e.DeliveryScore, e.DeliveryStatus),
        ChurnRisk = e.ChurnRisk,
        ChurnPercent = e.ChurnPercent,
        Narrative = e.Narrative,
        SickDays = e.SickDays,
        SickLeaveRate = e.SickLeaveRate,
        MeetingHours = e.MeetingHours,
        MeetingLoad = e.MeetingLoad,
        OvertimeHours = e.OvertimeHours,
        ReplacementCost = e.ReplacementCost,
        SprintCompletion = e.SprintCompletion,
        PrVelocity = e.PrVelocity,
        LearningHours = e.LearningHours,
        PsychSafety = e.PsychSafety,
        WorkLifeBalance = e.WorkLifeBalance,
        SkillsCoverage = e.SkillsCoverage,
        IdpGoalProgress = e.IdpGoalProgress,
        FeedbackScore360 = e.FeedbackScore360,
        EngagementPulse = e.EngagementPulse,
        GoalAchievement = e.GoalAchievement,
        RetentionRate = e.RetentionRate,
        PreventabilityScore = e.PreventabilityScore
    };

    private static EmployeeEntity MapToEntity(string teamId, Employee m) => new()
    {
        PartitionKey = teamId,
        RowKey = m.Id,
        Name = m.Name,
        Role = m.Role,
        Tenure = m.Tenure,
        Avatar = m.Avatar,
        WellbeingScore = m.Wellbeing.Score,
        WellbeingStatus = m.Wellbeing.Status,
        SkillsScore = m.Skills.Score,
        SkillsStatus = m.Skills.Status,
        MotivationScore = m.Motivation.Score,
        MotivationStatus = m.Motivation.Status,
        DeliveryScore = m.Delivery.Score,
        DeliveryStatus = m.Delivery.Status,
        ChurnRisk = m.ChurnRisk,
        ChurnPercent = m.ChurnPercent,
        Narrative = m.Narrative,
        SickDays = m.SickDays,
        SickLeaveRate = m.SickLeaveRate,
        MeetingHours = m.MeetingHours,
        MeetingLoad = m.MeetingLoad,
        OvertimeHours = m.OvertimeHours,
        ReplacementCost = m.ReplacementCost,
        SprintCompletion = m.SprintCompletion,
        PrVelocity = m.PrVelocity,
        LearningHours = m.LearningHours,
        PsychSafety = m.PsychSafety,
        WorkLifeBalance = m.WorkLifeBalance,
        SkillsCoverage = m.SkillsCoverage,
        IdpGoalProgress = m.IdpGoalProgress,
        FeedbackScore360 = m.FeedbackScore360,
        EngagementPulse = m.EngagementPulse,
        GoalAchievement = m.GoalAchievement,
        RetentionRate = m.RetentionRate,
        PreventabilityScore = m.PreventabilityScore
    };
}
