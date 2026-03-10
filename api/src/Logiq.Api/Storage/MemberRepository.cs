using System.Text.Json;
using Azure.Data.Tables;
using Logiq.Api.Configuration;
using Logiq.Api.Models;
using Microsoft.Extensions.Options;

namespace Logiq.Api.Storage;

public sealed class MemberRepository(IOptions<StorageOptions> options) : IMemberRepository
{
    private readonly StorageOptions _opts = options.Value;

    private TableClient AnalysisTable => new(_opts.ConnectionString, _opts.AnalysisResultsTable);

    public async Task<MemberDetail?> GetDetailAsync(string teamId, string memberId, CancellationToken cancellationToken = default)
    {
        await AnalysisTable.CreateIfNotExistsAsync(cancellationToken);
        var key = $"detail:{teamId}:{memberId}";
        try
        {
            var response = await AnalysisTable.GetEntityAsync<TableEntity>(key, "v1", cancellationToken: cancellationToken);
            var json = response.Value.GetString("JsonPayload");
            return string.IsNullOrEmpty(json) ? null : JsonSerializer.Deserialize<MemberDetail>(json);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }

    public async Task<MemberDashboard?> GetDashboardAsync(string teamId, string memberId, CancellationToken cancellationToken = default)
    {
        await AnalysisTable.CreateIfNotExistsAsync(cancellationToken);
        var key = $"dashboard:{teamId}:{memberId}";
        try
        {
            var response = await AnalysisTable.GetEntityAsync<TableEntity>(key, "v1", cancellationToken: cancellationToken);
            var json = response.Value.GetString("JsonPayload");
            return string.IsNullOrEmpty(json) ? null : JsonSerializer.Deserialize<MemberDashboard>(json);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }

    public async Task<SkillsMatrix> GetSkillsMatrixAsync(string teamId, CancellationToken cancellationToken = default)
    {
        await AnalysisTable.CreateIfNotExistsAsync(cancellationToken);
        var key = $"skills:{teamId}";
        try
        {
            var response = await AnalysisTable.GetEntityAsync<TableEntity>(key, "v1", cancellationToken: cancellationToken);
            var json = response.Value.GetString("JsonPayload");
            return string.IsNullOrEmpty(json) ? new SkillsMatrix() : JsonSerializer.Deserialize<SkillsMatrix>(json) ?? new SkillsMatrix();
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return new SkillsMatrix();
        }
    }

    public async Task UpsertDetailAsync(string teamId, string memberId, MemberDetail detail, CancellationToken cancellationToken = default)
    {
        await AnalysisTable.CreateIfNotExistsAsync(cancellationToken);
        var entity = new TableEntity($"detail:{teamId}:{memberId}", "v1")
        {
            ["JsonPayload"] = JsonSerializer.Serialize(detail)
        };
        await AnalysisTable.UpsertEntityAsync(entity, TableUpdateMode.Replace, cancellationToken);
    }

    public async Task UpsertDashboardAsync(string teamId, string memberId, MemberDashboard dashboard, CancellationToken cancellationToken = default)
    {
        await AnalysisTable.CreateIfNotExistsAsync(cancellationToken);
        var entity = new TableEntity($"dashboard:{teamId}:{memberId}", "v1")
        {
            ["JsonPayload"] = JsonSerializer.Serialize(dashboard)
        };
        await AnalysisTable.UpsertEntityAsync(entity, TableUpdateMode.Replace, cancellationToken);
    }

    public async Task UpsertSkillsMatrixAsync(string teamId, SkillsMatrix matrix, CancellationToken cancellationToken = default)
    {
        await AnalysisTable.CreateIfNotExistsAsync(cancellationToken);
        var entity = new TableEntity($"skills:{teamId}", "v1")
        {
            ["JsonPayload"] = JsonSerializer.Serialize(matrix)
        };
        await AnalysisTable.UpsertEntityAsync(entity, TableUpdateMode.Replace, cancellationToken);
    }
}
