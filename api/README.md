# LogIQ — .NET 10 Backend + Multi-Agent Pipeline

AI Dev Days Hackathon · Best Multi-Agent System

## Architecture Overview

```
Azure Table Storage
       │
       ▼
┌──────────────────────────────────────────────┐
│              MCP Servers (in-process)         │
│  HrDataGateway · DeliveryMetrics             │
│  LearningSkills · WellbeingSignals           │
└──────────────────┬───────────────────────────┘
                   │  MCP tool calls
       ┌───────────┼───────────┐
       ▼           ▼           ▼
 Wellbeing    Skills &    Delivery &
  & Risk      Growth      Workload
 Analyzer    Analyzer     Analyzer
       └───────────┬───────────┘
                   │  A2A: analysis results
                   ▼
          Conversation Prep Agent
          (synthesizes all signals)
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
  People Partner         Development
    Copilot               Coach
  (Team Lead)          (Team Member)
         │                    │
         └─────────┬──────────┘
                   ▼
             REST API
         ASP.NET Core 10
                   │
                   ▼
           React Webapp
       (Fluent UI v9 + Vite)
```

## Agent Pipeline

### Layer 1 — MCP Servers (C# SDK)
Four `[McpServerToolType]` classes expose Azure Table Storage data as MCP tools:

| Server | Key Tools |
|--------|-----------|
| `HrDataGatewayTools` | `GetEmployeeProfile`, `ListTeamEmployees`, `ListMeetings`, `GetDeferredTopics` |
| `DeliveryMetricsTools` | `GetSprintSummary`, `GetPrMetrics`, `GetMeetingLoad` |
| `LearningSkillsTools` | `GetTrainingRecords`, `GetIdpGoals`, `GetSkillAssessments`, `GetMemberSkillProfile` |
| `WellbeingSignalsTools` | `GetPulseResults`, `GetSafetyScores`, `GetTeamSignals`, `GetSentimentTrends` |

### Layer 2 — Analyzer Agents (Semantic Kernel)
Three `ChatCompletionAgent` instances run in parallel via `Task.WhenAll`:

- **WellbeingRiskAnalyzer** — detects burnout, sick-leave spikes, psych-safety drops → `WellbeingAnalysis`
- **SkillsGrowthAnalyzer** — maps skill gaps, IDP progress, learning debt → `SkillsAnalysis`
- **DeliveryWorkloadAnalyzer** — flags sprint anomalies, PR velocity drops, overload → `DeliveryAnalysis`

### Layer 3 — Conversation Prep Agent (A2A)
Receives all three `*Analysis` records via Agent-to-Agent pattern, combines with HR context, and generates `ConversationPrep` with:
- Suggested 1:1 topics ranked by urgency
- Follow-up actions from previous meetings
- Coach tips and empathetic questions
- Context summary for the lead

### Layer 4 — Role-Specific Copilots
- **PeoplePartnerCopilot** (Team Lead) — RAG via Azure AI Search, team-wide context, proactive recommendations
- **DevelopmentCoach** (Team Member) — private coaching with individual employee context, career guidance

## Technology Stack

| Component | Technology |
|-----------|------------|
| Backend framework | ASP.NET Core 10, .NET 10 |
| Agent orchestration | Microsoft Semantic Kernel 1.29 |
| Agent communication | A2A via shared POCO contracts |
| MCP servers | ModelContextProtocol C# SDK 0.1.0-preview.11 |
| LLM | Azure OpenAI (GPT-4o) |
| RAG | Azure AI Search |
| Storage | Azure Table Storage |
| API docs | Scalar (OpenAPI) |
| Frontend | React 18, Vite, Fluent UI v9, TanStack Query |

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
