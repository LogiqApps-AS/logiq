using Azure;
using Azure.Data.Tables;

namespace Logiq.Api.Storage.Entities;

public sealed class SignalEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Type { get; set; } = "info";
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? EmployeeId { get; set; }
    public string Icon { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string? Action { get; set; }
    public string? ActionLabel { get; set; }
    public bool IsMemberSignal { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool Unread { get; set; }
}
