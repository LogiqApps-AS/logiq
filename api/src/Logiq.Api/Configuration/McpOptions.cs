namespace Logiq.Api.Configuration;

public sealed class McpOptions
{
    public string BaseUrl { get; set; } = "http://localhost:5000";

    public string HrGatewayPath => $"{BaseUrl}/mcp/hr";
    public string DeliveryMetricsPath => $"{BaseUrl}/mcp/delivery";
    public string LearningSkillsPath => $"{BaseUrl}/mcp/learning";
    public string WellbeingSignalsPath => $"{BaseUrl}/mcp/wellbeing";
}
