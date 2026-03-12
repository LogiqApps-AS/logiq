# LogIQ — .NET 10 Backend + Multi-Agent Pipeline

AI Dev Days Hackathon · Best Multi-Agent System






## Running Locally

### Prerequisites
- .NET 10 SDK
- Azure Storage Emulator (Azurite) or Azure Storage connection string
- Azure OpenAI endpoint + key (or set `UseAzureOpenAI=false` for mocked responses)

### Backend

```bash
cd api/src/Logiq.Api
dotnet run
# API at http://localhost:5000
# Scalar (OpenAPI) at http://localhost:5000/scalar
# MCP at http://localhost:5000/mcp
```

The `SeedDataService` seeds 10 employees, signals, meetings, dashboards, and KPIs on first run if storage is empty.

### Frontend

```bash
cd webapp
npm install
npm run dev
# App at http://localhost:8080
```

Set `VITE_API_BASE_URL=http://localhost:5000` in `webapp/.env.local`.

## Configuration

All configuration lives in `appsettings.json` — no hardcoded strings:

```json
{
  "Azure": {
    "OpenAI": {
      "Endpoint": "https://your-resource.openai.azure.com/",
      "ApiKey": "...",
      "ChatDeploymentName": "gpt-4o",
      "EmbeddingDeploymentName": "text-embedding-3-small"
    },
    "Search": {
      "Endpoint": "https://your-search.search.windows.net",
      "ApiKey": "...",
      "IndexName": "logiq-knowledge"
    },
    "Storage": {
      "ConnectionString": "UseDevelopmentStorage=true"
    }
  }
}
```

## Key Design Decisions

1. **MCP in-process** — All four MCP tool classes run inside the same ASP.NET process and are served via `app.MapMcp("/mcp")`. This avoids network latency for the hackathon while still demonstrating full MCP protocol compliance.

2. **A2A via POCOs** — Analyzer outputs are strongly-typed C# records (`WellbeingAnalysis`, `SkillsAnalysis`, `DeliveryAnalysis`) passed directly to the Conversation Prep Agent. This is A2A without a message broker for minimal latency.

3. **Parallel analysis** — `AnalyzerOrchestrator.RunFullAnalysisAsync` runs all three analyzers via `Task.WhenAll`, halving the end-to-end latency compared to sequential execution.

4. **Azure Table Storage for everything** — Employees, signals, meetings, KPI snapshots, and agent-generated `MemberDetail`/`MemberDashboard` JSON blobs all live in Table Storage. No SQL, no separate blob store for the MVP.

5. **Role-separated copilots** — `PeoplePartnerCopilot` (lead-facing) and `DevelopmentCoach` (member-facing) have different system prompts, different RAG indexes, and different data access — enforcing privacy by design.
