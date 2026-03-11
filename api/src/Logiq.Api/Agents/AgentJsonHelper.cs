using System.Text.RegularExpressions;

namespace Logiq.Api.Agents;

public static class AgentJsonHelper
{
    public static string ExtractJsonFromResponse(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        string trimmed = raw.Trim();
        Match m = Regex.Match(trimmed, @"```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```", RegexOptions.Singleline);
        if (m.Success)
            return m.Groups[1].Value.Trim();
        int start = trimmed.IndexOf('{');
        if (start >= 0)
        {
            int end = trimmed.LastIndexOf('}');
            if (end > start)
                return trimmed[start..(end + 1)];
        }
        return trimmed;
    }
}
