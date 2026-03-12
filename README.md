# LogIQ

[![AI Dev Days Hackathon](https://img.shields.io/badge/AI_Dev_Days-Hackathon-blue)](https://aka.ms/aidevdayshackathon)

LogIQ is an AI-powered people and team intelligence platform built for the [AI Dev Days Hackathon](https://github.com/Azure/AI-Dev-Days-Hackathon). It helps team leads and people partners understand team health, wellbeing risk, skills gaps, and delivery load, and it helps individual contributors prepare for 1:1s and growth conversations. The system uses a multi-agent pipeline backed by MCP (Model Context Protocol) tools, Azure OpenAI (chat and embedding models), and Azure AI Search for RAG.

---

## Solution Overview

**Problem:** Team leads and people partners need a single place to see team health, risks, and readiness for 1:1s. Team members need support preparing for conversations and growth without switching tools.

**What LogIQ does:**

- **Team view:** Dashboard with employees, wellbeing/skills/delivery KPIs, signals, and financials. Wellbeing risks and 1:1 planner with meetings and deferred topics.
- **Member view:** Per-member detail (profile, skills, signals), dashboard (KPIs, dev goals, prep topics, coach tips), and delivery/skills tabs.
- **AI Copilot (lead):** Chat over team context plus RAG over HR/people knowledge. Uses employees, KPIs, signals, and retrieved snippets to answer questions and suggest actions.
- **AI Coach (member):** Chat over individual context and RAG for career and 1:1 prep. Uses employee profile and member dashboard plus retrieved knowledge.
- **Conversation prep pipeline:** Orchestrator runs three analyzers in parallel (wellbeing, skills, delivery), then a conversation prep agent that consumes their outputs and produces a 1:1 brief (suggested topics, follow-ups, coach tips). Prep is triggered from the 1:1 Planner (AI Prep button on meeting detail) and from the 1:1 Prep page (Generate prep button).

## Technology Stack

| Component           | Technology                                       |
| ------------------- | ------------------------------------------------ |
| Backend             | C#, .NET 10 SDK, ASP.NET Core 10                 |
| Frontend            | React, Vite, Fluent UI, TanStack Query           |
| Storage             | Azure Table Storage                              |
| LLM                 | Azure Foundry, Azure OpenAI                      |
| Models              | gpt-4o + text-embedding-3-small                  |
| RAG                 | Azure AI Search                                  |
| MCP                 | ModelContextProtocol C# SDK                      |
| Agent Orchestration | Microsoft Semantic Kernel                        |
| Agent Communication | A2A via shared POCO contracts                    |
| API Documentaion    | Scalar (OpenAPI)                                 |
| DevOps              | GitHub Actions, Docker, Azure Container Registry |
| Deployment          | Azure Container App (CORS, Custom Domain)        |

## Architecture Overview (C4)

### C4 Level 1 — System Context

**Actors**, the **LogIQ system**, and **external systems**.

```
     ┌─────────────────┐              ┌─────────────────┐
     │   Team Lead     │              │  Team Member    │
     │ (People Partner)│              │ (IC / Employee) │
     └────────┬────────┘              └────────┬────────┘
              │                                │
              └──────────────┬─────────────────┘
                             ▼
              ┌──────────────────────────────────────────┐
              │              LogIQ                        │
              │  AI-powered people & team intelligence   │
              │  Dashboard, 1:1 planner, prep, copilot, │
              │  coach, wellbeing/skills/delivery       │
              └──────────────┬───────────────────────────┘
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Azure OpenAI    │ │ Azure AI Search  │ │ Azure Table      │
│ (chat + embed)  │ │ (RAG: vector +   │ │ Storage          │
│                 │ │  keyword)        │ │ (6 tables)       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         ▲
         │
┌─────────────────┐
│ External MCP    │
│ Client (POST    │
│ /mcp)           │
└─────────────────┘
```

### C4 Level 2 — Container Diagram (Backend in Detail)

Containers **inside** LogIQ and how the backend is structured.

```
     ┌─────────────────┐              ┌─────────────────┐
     │   Team Lead     │              │  Team Member    │
     └────────┬────────┘              └────────┬────────┘
              └──────────────┬─────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LogIQ System                                    │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │  Web Application                     │  │  Backend API                  │  │
│  │  (React, Fluent UI, Vite)           │  │  (ASP.NET Core 10)          │  │
│  │  Dashboard, My Team, Wellbeing,      │──│  REST: teams, members,       │  │
│  │  1:1 Planner, Member Detail,       │  │  meetings, prep, copilot,    │  │
│  │  Skills, Delivery, Prep, Dev Plan,  │  │  coach; MCP server at /mcp   │  │
│  │  Signals, Copilot, AI Coach         │  │                              │  │
│  └─────────────────────────────────────┘  └──────────────┬──────────────┘  │
│           HTTP (REST API)                                 │                  │
└───────────────────────────────────────────────────────────│──────────────────┘
                                                            │
                    Backend API — internal containers        │
                    ─────────────────────────────────────────
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│ REST API      │   │ Analyzer Orchestrator│   │ Copilot & Coach     │
│ (Controllers) │   │ (Semantic Kernel)    │   │ (PeoplePartner +    │
│ Teams,        │   │ WellbeingRisk,       │   │  DevelopmentCoach)  │
│ Members,      │   │ SkillsGrowth,        │   │ RAG + repos,        │
│ Meetings,     │   │ DeliveryWorkload,    │   │ Azure OpenAI chat   │
│ Prep, Chat    │   │ ConversationPrep     │   └──────────┬──────────┘
└───────┬───────┘   └──────────┬──────────┘              │
        │                      │                         │
        │                      ▼                         │
        │              ┌─────────────────────┐           │
        │              │ MCP Tool Server     │           │
        │              │ (in-process; /mcp)  │           │
        │              │ WellbeingSignals,   │           │
        │              │ HrDataGateway,     │           │
        │              │ LearningSkills,    │           │
        │              │ DeliveryMetrics     │           │
        │              └──────────┬──────────┘           │
        │                         │                      │
        └─────────────────────────┼──────────────────────┘
                                  ▼
                       ┌─────────────────────┐
                       │ Repositories        │
                       │ (Storage layer)     │
                       │ Employee, Signal,   │
                       │ Meeting, TeamKpi,   │
                       │ Member (6 tables)   │
                       └──────────┬──────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Azure Table     │      │ Azure AI Search │      │ Azure OpenAI    │
│ Storage         │      │ (RAG, vector)   │      │ (chat + embed)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

- **Web Application** talks only to the REST API. **Controllers** use repositories for CRUD and invoke agents for chat and prep. **Agents** use MCP tool classes (same code as at `/mcp`) and/or repositories + RAG.
- Details: [api/SYSTEM_ARCHITECTURE.md](api/SYSTEM_ARCHITECTURE.md), [api/README.md](api/README.md).

> All data comes from the backend. Repositories read from Azure Table Storage; agents use the same MCP tool implementations exposed at `/mcp` for external clients.

---

## Flow sequence diagrams (Mermaid)

Mermaid **sequence diagrams** for the main flows: Copilot/Coach (chat), and Conversation prep.

### Copilot (lead) & Coach (member) — chat with RAG

One flow: **lead** uses team context (PeoplePartnerCopilot); **member** uses individual context (DevelopmentCoach). Both use repos + RAG + Azure OpenAI.

```mermaid
sequenceDiagram
  participant U as User (Lead or Member)
  participant W as Web App
  participant API as REST API
  participant Agent as Copilot or Coach
  participant Repos as Repositories
  participant RAG as RAG Service
  participant Search as Azure AI Search
  participant OpenAI as Azure OpenAI

  U->>W: Open Copilot (lead) or AI Coach (member), send message
  alt Lead — Copilot
    W->>API: POST api/copilot/chat { message, teamId }
    API->>Agent: PeoplePartnerCopilot.ChatAsync(teamId, request)
    Agent->>Repos: ListByTeamAsync, GetCurrentAsync (KPIs), ListTeamSignalsAsync
    Repos-->>Agent: employees, KPIs, signals
  else Member — Coach
    W->>API: POST api/coach/chat { message, memberId, teamId }
    API->>Agent: DevelopmentCoach.ChatAsync(memberId, request)
    Agent->>Repos: GetByIdAsync (employee), GetDashboardAsync (member)
    Repos-->>Agent: employee, dashboard
  end

  Agent->>RAG: RetrieveContextAsync(message, 5)
  RAG->>Search: vector + keyword search
  Search-->>RAG: snippets
  RAG-->>Agent: context

  Agent->>Agent: Build system prompt (team or member + RAG)
  Agent->>OpenAI: ChatCompletionAgent.InvokeAsync
  OpenAI-->>Agent: reply

  Agent-->>API: ChatResponse { reply, suggestions }
  API-->>W: 200 OK
  W-->>U: Show reply and suggestion chips
```

### Conversation prep — orchestrated analyzers + MCP

```mermaid
sequenceDiagram
  participant U as User
  participant W as Web App
  participant API as REST API
  participant Orch as AnalyzerOrchestrator
  participant WBA as WellbeingRiskAnalyzer
  participant SA as SkillsGrowthAnalyzer
  participant DA as DeliveryWorkloadAnalyzer
  participant Prep as ConversationPrepAgent
  participant MCP as MCP Tool Server
  participant Repos as Repositories
  participant OpenAI as Azure OpenAI

  U->>W: AI Prep (meeting) or Generate prep (member)
  W->>API: POST .../meetings/{id}/prep or POST .../members/{id}/prep
  API->>Orch: PrepareConversationAsync(teamId, memberId)

  par Parallel analyzers
    Orch->>WBA: AnalyzeTeamAsync(teamId)
    WBA->>MCP: GetPulseResults, GetSafetyScores, GetSentimentTrends, ListAbsences
    MCP->>Repos: read
    Repos-->>MCP: data
    MCP-->>WBA: JSON
    WBA->>OpenAI: ChatCompletionAgent
    OpenAI-->>WBA: WellbeingAnalysis
    WBA-->>Orch: WellbeingAnalysis
  and
    Orch->>SA: AnalyzeTeamAsync(teamId)
    SA->>MCP: GetTrainingRecords, GetIdpGoals, GetSkillAssessments
    MCP->>Repos: read
    Repos-->>MCP: data
    MCP-->>SA: JSON
    SA->>OpenAI: ChatCompletionAgent
    OpenAI-->>SA: SkillsAnalysis
    SA-->>Orch: SkillsAnalysis
  and
    Orch->>DA: AnalyzeTeamAsync(teamId)
    DA->>MCP: GetSprintSummary, GetPrMetrics, GetMeetingLoad
    MCP->>Repos: read
    Repos-->>MCP: data
    MCP-->>DA: JSON
    DA->>OpenAI: ChatCompletionAgent
    OpenAI-->>DA: DeliveryAnalysis
    DA-->>Orch: DeliveryAnalysis
  end

  Orch->>Prep: PrepareAsync(teamId, memberId, wellbeing, skills, delivery)
  Prep->>Repos: GetByIdAsync (employee)
  Prep->>MCP: ListMeetings, GetDeferredTopics
  MCP->>Repos: read
  Repos-->>Prep: employee; MCP-->>Prep: meetings, topics
  Prep->>OpenAI: ChatCompletionAgent (context + 3 analyses)
  OpenAI-->>Prep: ConversationPrep

  Prep-->>Orch: ConversationPrep
  Orch-->>API: ConversationPrep
  API-->>W: 200 OK
  W-->>U: Show brief (topics, coach tips, follow-ups, questions)
```

---

## Agent Pipeline

### Layer 1 — MCP Servers (C# SDK)

Four `[McpServerToolType]` classes expose Azure Table Storage data as MCP tools:

| Server                  | Key Tools                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `HrDataGatewayTools`    | `GetEmployeeProfile`, `ListTeamEmployees`, `ListMeetings`, `GetDeferredTopics`      |
| `DeliveryMetricsTools`  | `GetSprintSummary`, `GetPrMetrics`, `GetMeetingLoad`                                |
| `LearningSkillsTools`   | `GetTrainingRecords`, `GetIdpGoals`, `GetSkillAssessments`, `GetMemberSkillProfile` |
| `WellbeingSignalsTools` | `GetPulseResults`, `GetSafetyScores`, `GetTeamSignals`, `GetSentimentTrends`        |

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

---

## Data and storage

**Azure Table Storage** (six tables, see `StorageOptions` / appsettings):

| Repository         | Tables                             | Purpose                                                      |
| ------------------ | ---------------------------------- | ------------------------------------------------------------ |
| EmployeeRepository | EmployeesTable                     | Team members, KPIs, churn risk, meeting load, etc.           |
| SignalRepository   | SignalsTable                       | Team and member signals (wellbeing, delivery, recognition).  |
| MeetingRepository  | MeetingsTable, DeferredTopicsTable | 1:1 meetings and deferred topics.                            |
| TeamKpiRepository  | TeamKpiSnapshotsTable              | Team KPIs and financials (at-risk count, churn exposure).    |
| MemberRepository   | AnalysisResultsTable               | Member detail, dashboard, and skills matrix as stored blobs. |

Seed data: on first run, if storage is empty, `SeedDataService` seeds employees (e.g. 2–10), signals, meetings, KPIs, skills matrix, and member detail/dashboard. MembersController can synthesize a dashboard when none is stored.

**Entities** (domain models): Employee, Signal, MemberSignal, Meeting, DeferredTopic, TeamKpis, TeamFinancials, SkillsMatrix, MemberDetail, MemberDashboard, ConversationPrep. See SYSTEM_ARCHITECTURE.md for field-level descriptions.

---

## Agents and orchestration

### Analyzer layer (MCP-driven)

Three analyzer agents run in parallel via `AnalyzerOrchestrator`:

| Agent                        | Role                                          | Data (MCP tools)                                              | Output                                            |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------- |
| **WellbeingRiskAnalyzer**    | Burnout, psych-safety, sick leave, engagement | WellbeingSignalsTools, HrDataGatewayTools (e.g. ListAbsences) | WellbeingAnalysis; persists high/critical signals |
| **SkillsGrowthAnalyzer**     | Skill gaps, IDP progress, learning            | LearningSkillsTools                                           | SkillsAnalysis                                    |
| **DeliveryWorkloadAnalyzer** | Sprint/PR/meeting load, overload              | DeliveryMetricsTools                                          | DeliveryAnalysis; persists workload signals       |

Each uses Semantic Kernel `ChatCompletionAgent` and calls MCP tool classes in process; tools read from repositories and return JSON.

### Conversation prep (A2A-style)

**ConversationPrepAgent** receives the three analysis results from the orchestrator, plus meetings and deferred topics from HrDataGatewayTools and employee/dashboard from repositories. It produces **ConversationPrep**: suggested 1:1 topics, follow-up actions, coach tips, questions to ask, and context summary. This pipeline is triggered by `POST api/teams/{teamId}/meetings/{meetingId}/prep` or `POST api/members/{memberId}/prep` (Triggered from AI Prep in 1:1 Planner; Generate prep on 1:1 Prep page).

### Role-specific copilots

| Agent                    | Audience                   | Data                                                         | AI                              |
| ------------------------ | -------------------------- | ------------------------------------------------------------ | ------------------------------- |
| **PeoplePartnerCopilot** | Team lead / people partner | EmployeeRepository, TeamKpiRepository, SignalRepository, RAG | Azure OpenAI chat + RAG context |
| **DevelopmentCoach**     | Team member                | EmployeeRepository, MemberRepository, RAG                    | Azure OpenAI chat + RAG context |

Both use repositories and `IRagService` directly (no MCP in the chat path). They build a system prompt from loaded context and RAG snippets, then call the same Azure OpenAI chat deployment.

---

## MCP (Model Context Protocol)

Four tool classes implement the data surface used by the analyzer and prep agents and are exposed as an MCP server for external clients:

| Tool class                | Example methods                                                                        | Consumed by                                  |
| ------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------- |
| **WellbeingSignalsTools** | GetPulseResults, GetSafetyScores, GetTeamSignals, GetSentimentTrends, GetMemberSignals | WellbeingRiskAnalyzer                        |
| **HrDataGatewayTools**    | GetEmployeeProfile, ListTeamEmployees, ListAbsences, ListMeetings, GetDeferredTopics   | WellbeingRiskAnalyzer, ConversationPrepAgent |
| **LearningSkillsTools**   | GetTrainingRecords, GetIdpGoals, GetSkillAssessments, GetMemberSkillProfile            | SkillsGrowthAnalyzer                         |
| **DeliveryMetricsTools**  | GetSprintSummary, GetPrMetrics, GetMeetingLoad                                         | DeliveryWorkloadAnalyzer                     |

- **In-process:** Agents inject these classes and call them directly (no MCP wire hop inside the API).
- **MCP server:** Same tools are exposed at **POST /mcp** so external MCP clients can call them over the protocol.

Configuration: `Mcp:BaseUrl` (e.g. `http://localhost:5000`). See SYSTEM_ARCHITECTURE.md for full endpoint and flow tables.

---

## RAG (retrieval-augmented generation)

**Index:** Azure AI Search index (e.g. `logiq-knowledge`) with fields `id`, `title`, `content`, and a vector field `contentVector`. Created and seeded at startup by `SearchIndexProvisioningService`.

**Ingest:** Seed HR documents (e.g. 1:1 best practices, churn mitigation, psychological safety, IDP, burnout, career conversations, feedback, difficult conversations) are embedded with **Azure OpenAI embeddings** (e.g. text-embedding-3-small). Embeddings are produced by `IEmbeddingService`; each document’s title and content are concatenated, embedded, and stored in `contentVector`. Provisioning uploads keyword-only documents first so the index is always populated; then, if the index has a vector profile, a second merge adds vectors.

**Retrieval:** `IRagService.RetrieveContextAsync(query, maxResults)`:

1. Gets query embedding via `IEmbeddingService.GetEmbeddingAsync(query)`.
2. If an embedding is returned, runs **vector search** on `contentVector` (Azure AI Search vector query).
3. If no embedding (e.g. Azure OpenAI not configured) or vector search returns no hits, falls back to **keyword search**.

Copilot and Coach pass the retrieved context into the LLM system prompt so answers are grounded in HR/people knowledge. Configuration: `Azure:Search` (Endpoint, ApiKey, IndexName, VectorFieldName, VectorSearchDimensions) and `Azure:OpenAI:EmbeddingDeploymentName`.

---

## AI stack (Azure OpenAI and Azure AI Search)

**Azure OpenAI** is used with two deployments (two “models” in the stack):

| Deployment                                  | Use                                             | Config key                             |
| ------------------------------------------- | ----------------------------------------------- | -------------------------------------- |
| **Chat** (e.g. gpt-4o)                      | Copilot, Coach, all analyzers, ConversationPrep | `Azure:OpenAI:ChatDeploymentName`      |
| **Embedding** (e.g. text-embedding-3-small) | RAG indexing and query embedding                | `Azure:OpenAI:EmbeddingDeploymentName` |

Configuration also includes `Azure:OpenAI:Endpoint` and `Azure:OpenAI:ApiKey`. The backend uses Microsoft Semantic Kernel for chat completion and the Azure OpenAI SDK for embeddings. The solution is built to run on Azure and fits into an enterprise AI setup (e.g. Microsoft Foundry) where Azure OpenAI and Azure AI Search are the core services.

**Azure AI Search** provides the RAG index: keyword and vector search, HNSW vector profile, and optional semantic behavior as above.

---

## Flows (web to API to agent)

**Copilot (lead):** User opens Copilot from the FAB, sends a message. Frontend calls `POST api/copilot/chat` with message and teamId. CopilotController calls PeoplePartnerCopilot, which loads employees, KPIs, signals and RAG context, builds the system prompt, invokes the chat agent, and returns reply and suggestions.

**Coach (member):** User opens AI Coach, sends a message. Frontend calls `POST api/coach/chat` with message, memberId, teamId. CoachController calls DevelopmentCoach, which loads employee and member dashboard plus RAG context, builds the prompt, invokes the chat agent, and returns reply and suggestions.

**Conversation prep:** User clicks **AI Prep** on a meeting (1:1 Planner) or **Generate prep** (1:1 Prep page). Client calls `POST api/teams/{teamId}/meetings/{meetingId}/prep` or `POST api/members/{memberId}/prep`. Controller calls AnalyzerOrchestrator.PrepareConversationAsync. Orchestrator runs the three analyzers in parallel (each uses MCP tools), then calls ConversationPrepAgent with the three results; prep agent uses HrDataGatewayTools and repos and returns ConversationPrep. No RAG in this pipeline.

End-to-end tables for each agent and the prep pipeline are in SYSTEM_ARCHITECTURE.md (Section 10).

---

## Technology stack

| Layer           | Technology                                                          |
| --------------- | ------------------------------------------------------------------- |
| Frontend        | React 18, Vite, Fluent UI v9, TanStack Query                        |
| Backend         | ASP.NET Core 10, .NET 10                                            |
| Agent framework | Microsoft Semantic Kernel                                           |
| MCP             | ModelContextProtocol.AspNetCore (MCP server at /mcp)                |
| LLM             | Azure OpenAI (chat + embedding deployments)                         |
| RAG             | Azure AI Search (vector + keyword), IEmbeddingService + IRagService |
| Storage         | Azure Table Storage (Azure.Data.Tables)                             |
| API docs        | Scalar (OpenAPI)                                                    |
| Containers      | Docker (API + webapp); multistage builds, non-root, health checks   |

---

## CI/CD: GitHub Actions and Azure Container Registry

**Pipeline:** GitHub Actions builds and pushes Docker images to **Azure Container Registry (ACR)**. Images are suitable for deployment to **Azure Container Instances (ACI)**, Azure Container Apps, or other orchestrators.

**Workflow:** `.github/workflows/docker-build-push.yml`

- **Triggers:** Push to `main`, pull requests to `main`, and tags `v*.*.*`.
- **Jobs:** Two parallel jobs: build-and-push-api, build-and-push-webapp.
- **Steps:** Checkout, Docker Buildx, login to ACR (`secrets.REGISTRY`, `ACR_USERNAME`, `ACR_PASSWORD`), metadata (tags/labels), build-push. Push is skipped on pull requests (build-only for validation).
- **Images:** `logiq-api`, `logiq-webapp` (contexts `./api`, `./webapp`; Dockerfiles in those directories). Multi-platform: `linux/amd64`, `linux/arm64`. Caching: GitHub Actions cache.
- **Tags:** From docker/metadata-action: branch, pr, semver (e.g. 1.0.0, 1.0, 1), sha, and `latest` on default branch.

**Secrets (repository or environment):** `REGISTRY` (ACR login server, e.g. `logiqacr.azurecr.io`), `ACR_USERNAME`, `ACR_PASSWORD` (e.g. from an Azure service principal with AcrPush).

**Deploying from ACR:** After images are in ACR, deploy to Azure Container Instances (or Container Apps) by referencing the image (e.g. `logiqacr.azurecr.io/logiq-api:latest`). Use Azure CLI, portal, or a separate CD workflow to create/update ACI/ACA from the registry. Setup instructions for ACR and secrets are in [.github/SETUP.md](.github/SETUP.md) and [.github/workflows/README.md](.github/workflows/README.md).

---

## Configuration

Backend configuration is in `api/src/Logiq.Api/appsettings.json` (and environment or User Secrets). Key sections:

- **Azure:OpenAI** – Endpoint, ApiKey, ChatDeploymentName, EmbeddingDeploymentName.
- **Azure:Search** – Endpoint, ApiKey, IndexName, VectorFieldName, VectorSearchDimensions (RAG index and vector field).
- **Azure:Storage** – ConnectionString, table names (EmployeesTable, SignalsTable, MeetingsTable, DeferredTopicsTable, TeamKpiSnapshotsTable, AnalysisResultsTable).
- **Mcp** – BaseUrl (e.g. for MCP server URL).
- **Cors:AllowedOrigins** – e.g. `http://localhost:8080` for the webapp.

For RAG document ingest, Azure:Search Endpoint and ApiKey must be set; otherwise provisioning skips and the index stays empty. See api/README.md for a full example and local run instructions.

---

## Running locally

**Prerequisites:** .NET 10 SDK, Node.js (for webapp), Azure Storage (Azurite or real connection string), optional Azure OpenAI and Azure AI Search for full AI and RAG.

**Backend:**

```bash
cd api/src/Logiq.Api
dotnet run
```

API: http://localhost:5000. Scalar (OpenAPI): http://localhost:5000/scalar. MCP: http://localhost:5000/mcp. Seed data and RAG index are provisioned on first run when configured.

**Frontend:**

```bash
cd webapp
npm install
npm run dev
```

App: http://localhost:8080. Set `VITE_API_BASE_URL=http://localhost:5000` (e.g. in `.env.local`) to point to the API.

**Docker:** See [docker/README.md](docker/README.md) for Docker Compose (API, webapp, Azurite), env vars, and production notes.

---

## Project structure

```
logiq/
├── api/                          # Backend
│   ├── src/Logiq.Api/            # ASP.NET Core app
│   │   ├── Agents/               # Orchestrator, analyzers, prep, copilot, coach
│   │   ├── Configuration/        # Options (Azure, Storage, Mcp)
│   │   ├── Controllers/          # Teams, Members, Meetings, Copilot, Coach, Search
│   │   ├── Mcp/                  # MCP tool classes
│   │   ├── Services/              # RAG, embedding, search provisioning, seed
│   │   ├── Storage/              # Repositories
│   │   └── Program.cs
│   ├── Dockerfile
│   ├── README.md                 # Backend and agent overview
│   └── SYSTEM_ARCHITECTURE.md    # Endpoints, entities, agents, MCP, flows, storage
├── webapp/                       # React frontend (Vite, Fluent UI v9)
├── docker/                       # Compose, .env.example
├── .github/
│   ├── workflows/                # docker-build-push.yml (ACR)
│   ├── SETUP.md                  # ACR and secrets setup
│   └── workflows/README.md       # Workflow and tagging details
└── README.md                     # This file
```

---

## Resources

- [AI Dev Days Hackathon](https://aka.ms/aidevdayshackathon)
- [Microsoft Agent Framework](https://aka.ms/agent-framework)
- [Azure MCP](https://aka.ms/azure-mcp)
- [Azure AI Search](https://learn.microsoft.com/azure/search/)
- [Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/)
- [Semantic Kernel](https://learn.microsoft.com/semantic-kernel/)

---

## 5. Entities (Domain Models)

| Entity               | Description                                                                                                                                 | Main storage / source                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Employee**         | Team member: id, name, role, tenure, KPI scores (wellbeing, skills, motivation, delivery), churn risk, meeting hours, etc.                  | EmployeeRepository (Azure Table)                 |
| **Signal**           | Team-level alert (e.g. wellbeing, delivery); id, type, title, message, employeeId, time, action                                             | SignalRepository                                 |
| **MemberSignal**     | Member-level signal (warning, opportunity, recognition, wellbeing, milestone)                                                               | SignalRepository (member partition)              |
| **Meeting**          | 1:1 meeting: id, name, role, date, duration, topics, notes, followUps                                                                       | MeetingRepository                                |
| **DeferredTopic**    | Postponed topic from a 1:1 (id, text, person)                                                                                               | MeetingRepository                                |
| **TeamKpis**         | Team KPIs: wellbeing, skills, motivation, churn, delivery (score, status, label, trend, description)                                        | TeamKpiRepository                                |
| **TeamFinancials**   | atRiskCount, totalEmployees, churnExposure, totalPeopleRisk                                                                                 | TeamKpiRepository                                |
| **SkillsMatrix**     | allSkills[], employeeSkills{ [id]: skills[] }                                                                                               | MemberRepository (blob in AnalysisResults table) |
| **MemberDetail**     | Rich profile: department, skills, roleHistory, projects, feedback, training, signals, certifications, counts                                | MemberRepository (blob)                          |
| **MemberDashboard**  | employeeId, kpis, signals, devGoals, learningItems, skills, sprintContributions, deliveryStats, prepTopics, coachTips, wins, questionsToAsk | MemberRepository (blob)                          |
| **ConversationPrep** | 1:1 brief: teamId, memberId, memberName, suggestedTopics, followUpActions, coachTips, questionsToAsk, contextSummary                        | Produced by ConversationPrepAgent (orchestrator) |

---

## 6. Agents

| Agent                        | Purpose                                                                                                        | Used by                                         | Data access                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| **WellbeingRiskAnalyzer**    | Analyzes team wellbeing, churn risk, engagement; produces WellbeingAnalysis and persists high/critical signals | AnalyzerOrchestrator                            | WellbeingSignalsTools, HrDataGatewayTools (→ repos)                     |
| **SkillsGrowthAnalyzer**     | Analyzes skills coverage, IDP progress, learning; produces SkillsAnalysis                                      | AnalyzerOrchestrator                            | LearningSkillsTools (→ repos)                                           |
| **DeliveryWorkloadAnalyzer** | Analyzes velocity, meeting load, overtime; produces DeliveryAnalysis and persists workload signals             | AnalyzerOrchestrator                            | DeliveryMetricsTools (→ repos)                                          |
| **ConversationPrepAgent**    | Builds 1:1 brief (ConversationPrep) from wellbeing + skills + delivery + meetings/deferred                     | AnalyzerOrchestrator (PrepareConversationAsync) | HrDataGatewayTools, IEmployeeRepository, IMemberRepository              |
| **PeoplePartnerCopilot**     | Chat for leads: team health, 1:1 prep, signals, KPIs; uses RAG for knowledge                                   | CopilotController                               | IEmployeeRepository, ITeamKpiRepository, ISignalRepository, IRagService |
| **DevelopmentCoach**         | Chat for members: growth, 1:1 prep, goals; uses RAG                                                            | CoachController                                 | IEmployeeRepository, IMemberRepository, IRagService                     |

**Orchestrator:** `AnalyzerOrchestrator` runs the three analyzers (in parallel when needed) and then calls `ConversationPrepAgent` with their results. It is used only for **conversation prep** from the API: `POST api/teams/{teamId}/meetings/{meetingId}/prep` and `POST api/members/{memberId}/prep`.

---

## 7. MCP Tools (Server Tool Classes)

These classes are registered as MCP server tools (exposed at `POST /mcp`) and are **also** injected into agents and called directly in process.

| Tool class                | Methods                                                                                          | Used by agents                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| **WellbeingSignalsTools** | GetPulseResults, GetSafetyScores, GetTeamSignals, GetSentimentTrends, GetMemberSignals           | WellbeingRiskAnalyzer                                                                         |
| **HrDataGatewayTools**    | GetEmployeeProfile, ListTeamEmployees, ListAbsences, GetOrgTree, ListMeetings, GetDeferredTopics | WellbeingRiskAnalyzer (ListAbsences), ConversationPrepAgent (ListMeetings, GetDeferredTopics) |
| **LearningSkillsTools**   | GetTrainingRecords, GetIdpGoals, GetSkillAssessments, GetMemberSkillProfile                      | SkillsGrowthAnalyzer                                                                          |
| **DeliveryMetricsTools**  | GetSprintSummary, GetPrMetrics, GetMeetingLoad                                                   | DeliveryWorkloadAnalyzer                                                                      |

All of these tools use **repositories** (EmployeeRepository, SignalRepository, MeetingRepository, MemberRepository) to read data and return JSON strings.

---

## 8. Communication Flows

### 8.1 Webapp → API (REST)

- **Lead dashboard (Index):** employees, signals, team KPIs, team financials.
- **My Team:** employees.
- **Wellbeing Risks:** employees, signals.
- **1:1 Planner:** meetings, past meetings, deferred topics, employees (MeetingDetail uses employees for “View profile”).
- **Prep / Dev Plan / Delivery / Signals (member):** member dashboard and/or member signals (memberId often `"1"`).
- **Team Member Detail:** employee + member detail.
- **Skills tab:** employees + skills matrix.
- **Copilot / Coach:** POST chat with message, optional conversationId, teamId, memberId.

### 8.2 API → Agents (Prep)

1. **MeetingsController** or **MembersController** receives prep request.
2. Controller calls **AnalyzerOrchestrator.PrepareConversationAsync(teamId, memberId)**.
3. Orchestrator runs **WellbeingRiskAnalyzer**, **SkillsGrowthAnalyzer**, **DeliveryWorkloadAnalyzer** in parallel (each calls MCP tool classes, which use repos).
4. Orchestrator passes the three analysis results to **ConversationPrepAgent.PrepareAsync**.
5. ConversationPrepAgent uses **HrDataGatewayTools** (ListMeetings, GetDeferredTopics) and repos (employee, dashboard), then calls the LLM and returns **ConversationPrep**.

### 8.3 API → Agents (Chat)

- **Copilot:** Controller → **PeoplePartnerCopilot.ChatAsync** → loads employees, KPIs, signals, RAG context → LLM → **ChatResponse**.
- **Coach:** Controller → **DevelopmentCoach.ChatAsync** → loads employee, member dashboard, RAG context → LLM → **ChatResponse**.

### 8.4 MCP Server (External)

- **POST /mcp** exposes the same MCP tool classes (WellbeingSignalsTools, HrDataGatewayTools, LearningSkillsTools, DeliveryMetricsTools) so external MCP clients can call the same capabilities (e.g. GetPulseResults, ListMeetings) over the MCP protocol.

---

## 9. Storage (Repositories)

Only **six** Azure Table Storage tables are used (see `StorageOptions` and appsettings):

| Repository             | Table(s)                                                                                                            | Used by                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **EmployeeRepository** | EmployeesTable                                                                                                      | Controllers, MCP tools, Copilot, Coach, Orchestrator/agents                                  |
| **SignalRepository**   | SignalsTable (team signals: PartitionKey=teamId; member signals: PartitionKey=teamId:memberId, IsMemberSignal=true) | Controllers, WellbeingSignalsTools, WellbeingRiskAnalyzer, DeliveryWorkloadAnalyzer, Copilot |
| **MeetingRepository**  | MeetingsTable, DeferredTopicsTable                                                                                  | Controllers, HrDataGatewayTools, ConversationPrepAgent                                       |
| **TeamKpiRepository**  | TeamKpiSnapshotsTable (KPIs + financials in same table)                                                             | Controllers, Copilot, Orchestrator (writes KPIs after full analysis)                         |
| **MemberRepository**   | AnalysisResultsTable (blobs: detail, dashboard, skills by key)                                                      | Controllers, LearningSkillsTools, ConversationPrepAgent, Coach                               |

Unused config keys (MeetingTopicsTable, FollowUpsTable, MemberSkillsTable, etc.) have been removed; topics/follow-ups are stored as JSON on Meeting entities, and member detail/dashboard/skills are in AnalysisResultsTable.

---

## 10. Agent flows: from web page to API to agent

For each agent (and the conversation-prep pipeline), this section traces the full flow: **web page → user action → API call → controller → agent(s) → data sources → LLM → response back to UI**.

---

### 10.1 People Partner Copilot (lead/people partner chat)

| Step               | Where                            | What happens                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Entry**       | Any page (lead view)             | App shell shows **Copilot FAB** (floating button). User clicks it.                                                                                                                                                                                                                                                                                                                                                  |
| **2. UI**          | `AppShell.tsx` / `App.tsx`       | `CopilotPanel` opens (slide-out or modal). Rendered for **lead** role.                                                                                                                                                                                                                                                                                                                                              |
| **3. User action** | `CopilotPanel.tsx`               | User types a message and sends (e.g. “Which employees are at risk?”).                                                                                                                                                                                                                                                                                                                                               |
| **4. API call**    | `lib/api.ts`                     | `apiClient.copilotChat({ message, teamId, conversationId })` → **POST** `api/copilot/chat` with body `{ message, conversationId?, teamId? }`.                                                                                                                                                                                                                                                                       |
| **5. Controller**  | `CopilotController.Chat`         | Receives request; `teamId = request.TeamId ?? "team1"`. Calls `copilot.ChatAsync(teamId, request, cancellationToken)`.                                                                                                                                                                                                                                                                                              |
| **6. Agent**       | `PeoplePartnerCopilot.ChatAsync` | **Data load (repos, no MCP):** `employeeRepository.ListByTeamAsync(teamId)`, `kpiRepository.GetCurrentAsync(teamId)`, `signalRepository.ListTeamSignalsAsync(teamId)`, `ragService.RetrieveContextAsync(message, 5)`. Builds system prompt with team size, at-risk list, KPIs, signal summary, and RAG snippet. Creates **ChatCompletionAgent** (Semantic Kernel) with that prompt, adds user message, invokes LLM. |
| **7. Response**    | Same agent                       | Returns `ChatResponse { conversationId, reply, suggestions }`. Controller returns 200 OK with that JSON.                                                                                                                                                                                                                                                                                                            |
| **8. Back to UI**  | `CopilotPanel.tsx`               | Displays `reply` in chat thread; shows `suggestions` as quick-reply buttons.                                                                                                                                                                                                                                                                                                                                        |

**Data sources (no MCP in this path):** `IEmployeeRepository`, `ITeamKpiRepository`, `ISignalRepository`, `IRagService` (Azure AI Search).

---

### 10.2 Development Coach (member chat)

| Step               | Where                               | What happens                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Entry**       | Any page (member view)              | Same **Copilot FAB**; when in **member** role, opening it can show **AI Coach** (or user switches to Coach). `AICoachPanel` is opened (e.g. from nav or FAB).                                                                                                                                                                                 |
| **2. UI**          | `AppShell.tsx` / `AICoachPanel.tsx` | `AICoachPanel` opens with `memberId` (default `"1"`), `teamId` (default `"team1"`). Uses `useMemberDashboard(memberId, teamId)` for prep topics in context.                                                                                                                                                                                   |
| **3. User action** | `AICoachPanel.tsx`                  | User types a message (e.g. “Help me prepare for my 1:1”).                                                                                                                                                                                                                                                                                     |
| **4. API call**    | `lib/api.ts`                        | `apiClient.coachChat({ message, memberId, teamId, conversationId })` → **POST** `api/coach/chat` with body `{ message, conversationId?, teamId?, memberId? }`.                                                                                                                                                                                |
| **5. Controller**  | `CoachController.Chat`              | Receives request; `memberId = request.MemberId ?? "1"`. Calls `coach.ChatAsync(memberId, request, cancellationToken)`.                                                                                                                                                                                                                        |
| **6. Agent**       | `DevelopmentCoach.ChatAsync`        | **Data load (repos, no MCP):** `employeeRepository.GetByIdAsync(teamId, memberId)`, `memberRepository.GetDashboardAsync(teamId, memberId)`, `ragService.RetrieveContextAsync(message, 5)`. Builds member context (name, role, tenure, KPIs, IDP progress, prep topics, RAG). Creates **ChatCompletionAgent**, adds user message, invokes LLM. |
| **7. Response**    | Same agent                          | Returns `ChatResponse { conversationId, reply, suggestions }`. Controller returns 200 OK.                                                                                                                                                                                                                                                     |
| **8. Back to UI**  | `AICoachPanel.tsx`                  | Displays reply and suggestion chips.                                                                                                                                                                                                                                                                                                          |

**Data sources (no MCP in this path):** `IEmployeeRepository`, `IMemberRepository`, `IRagService`.

---

### 10.3 Conversation prep (1:1 brief) — orchestrated pipeline

This flow is triggered only from the **API** (no webapp button currently). Two endpoints can start it:

- **POST** `api/teams/{teamId}/meetings/{meetingId}/prep` (MeetingsController) — derives `memberId` from the meeting.
- **POST** `api/members/{memberId}/prep?teamId=` (MembersController) — prep by member only.

| Step                             | Where                                                           | What happens                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Entry**                     | 1:1 Planner or Prep page                                        | Ideally: user selects a meeting and clicks “Generate prep”. Today: **no UI calls these endpoints**; `apiClient.triggerMeetingPrep(teamId, meetingId)` exists but is never invoked.                                                                                                                                                                                                                  |
| **2. API call**                  | `MeetingDetail.tsx` or `MemberPrep.tsx`                         | **POST** `api/teams/team1/meetings/{meetingId}/prep` via `triggerMeetingPrep`, or **POST** `api/members/{memberId}/prep` via `getMemberPrep`.                                                                                                                                                                                                                                                       |
| **3. Controller**                | `MeetingsController.TriggerPrep` or `MembersController.GetPrep` | Meetings: loads meeting, gets `memberId` from meeting id; Members: uses route `memberId` + query `teamId`. Both call `orchestrator.PrepareConversationAsync(teamId, memberId, cancellationToken)`.                                                                                                                                                                                                  |
| **4. Orchestrator**              | `AnalyzerOrchestrator.PrepareConversationAsync`                 | Runs **in parallel:** `wellbeingAnalyzer.AnalyzeTeamAsync(teamId)`, `skillsAnalyzer.AnalyzeTeamAsync(teamId)`, `deliveryAnalyzer.AnalyzeTeamAsync(teamId)`. Awaits all three, then calls `conversationPrepAgent.PrepareAsync(teamId, memberId, wellbeingResult, skillsResult, deliveryResult, cancellationToken)`.                                                                                  |
| **5a. WellbeingRiskAnalyzer**    | Called by orchestrator                                          | **MCP tool calls:** `wellbeingTools.GetPulseResults(teamId)`, `GetSafetyScores(teamId)`, `GetSentimentTrends(teamId)`, `hrTools.ListAbsences(teamId)`. Builds prompt with that JSON; creates **ChatCompletionAgent**; invokes LLM; parses JSON to `WellbeingAnalysis`. Persists high/critical risk as team signals via `signalRepository.UpsertTeamSignalAsync`. Returns `WellbeingAnalysis`.       |
| **5b. SkillsGrowthAnalyzer**     | Called by orchestrator                                          | **MCP tool calls:** `learningTools.GetTrainingRecords(teamId)`, `GetIdpGoals(teamId)`, `GetSkillAssessments(teamId)`. Prompt + LLM; parses to `SkillsAnalysis`. Returns it.                                                                                                                                                                                                                         |
| **5c. DeliveryWorkloadAnalyzer** | Called by orchestrator                                          | **MCP tool calls:** `deliveryTools.GetSprintSummary(teamId)`, `GetPrMetrics(teamId)`, `GetMeetingLoad(teamId)`. Prompt + LLM; parses to `DeliveryAnalysis`. Persists overloaded/critical workload as team signals. Returns it.                                                                                                                                                                      |
| **6. ConversationPrepAgent**     | Called by orchestrator with the three results                   | **Repos:** `employeeRepository.GetByIdAsync(teamId, memberId)`, `memberRepository` not used for dashboard in this path. **MCP tool calls:** `hrTools.ListMeetings(teamId)`, `hrTools.GetDeferredTopics(teamId)`. Extracts member-specific slices from the three analyses (risk, skills insight, delivery insight). Builds prompt; **ChatCompletionAgent** → LLM; parses JSON to `ConversationPrep`. |
| **7. Response**                  | Controller                                                      | Returns 200 OK with `ConversationPrep` (suggestedTopics, followUpActions, coachTips, questionsToAsk, contextSummary, etc.).                                                                                                                                                                                                                                                                         |
| **8. Back to UI**                | MeetingDetail dialog or MemberPrep page                         | MeetingDetail shows the brief in a dialog with "Add topics to agenda". MemberPrep shows the generated brief (context, topics, coach tips, follow-ups, questions) and replaces the default dashboard-based sections until the user generates again.                                                                                                                                                  |

**Data sources:** Orchestrator uses **three analyzers** (each uses MCP tool classes → repos) and **ConversationPrepAgent** (repos + HrDataGatewayTools). No RAG in this pipeline.

---

### 10.4 Summary table: agent entry points and data

| Agent / pipeline         | Web entry                                 | API endpoint                                                          | Data sources                                                                                                                                                                                                                                                            |
| ------------------------ | ----------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PeoplePartnerCopilot** | Copilot FAB → CopilotPanel (lead)         | POST `api/copilot/chat`                                               | EmployeeRepository, TeamKpiRepository, SignalRepository, RagService                                                                                                                                                                                                     |
| **DevelopmentCoach**     | Copilot FAB / nav → AICoachPanel (member) | POST `api/coach/chat`                                                 | EmployeeRepository, MemberRepository, RagService                                                                                                                                                                                                                        |
| **Conversation prep**    | (No UI yet)                               | POST `api/teams/.../meetings/.../prep` or POST `api/members/.../prep` | Orchestrator → WellbeingRiskAnalyzer (WellbeingSignalsTools, HrDataGatewayTools), SkillsGrowthAnalyzer (LearningSkillsTools), DeliveryWorkloadAnalyzer (DeliveryMetricsTools), then ConversationPrepAgent (HrDataGatewayTools, EmployeeRepository); all tools use repos |

---

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

## Endpoints

### Teams (`api/teams/{teamId}`)

| Method | Endpoint                                       | Description                                          | Controller                      | Webapp usage                                                                                                                              |
| ------ | ---------------------------------------------- | ---------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `api/teams/{teamId}/employees`                 | List all employees in the team.                      | TeamsController.GetEmployees    | `apiClient.getEmployees` → useEmployees (Index, MyTeam, WellbeingRisks, OneOnOnePlanner, AppShell, SkillsTab, DeliveryTab, MeetingDetail) |
| GET    | `api/teams/{teamId}/employees/{employeeId}`    | Get a single employee by ID.                         | TeamsController.GetEmployee     | `apiClient.getEmployee` → useEmployee (TeamMemberDetail)                                                                                  |
| GET    | `api/teams/{teamId}/signals`                   | List team-level signals (wellbeing, delivery, etc.). | TeamsController.GetSignals      | `apiClient.getSignals` → useSignals (Index, WellbeingRisks)                                                                               |
| GET    | `api/teams/{teamId}/kpis`                      | Get current team KPIs snapshot.                      | TeamsController.GetKpis         | `apiClient.getTeamKPIs` → useTeamKPIs (Index, Landing)                                                                                    |
| GET    | `api/teams/{teamId}/financials`                | Get team financials (e.g. at-risk count, churn).     | TeamsController.GetFinancials   | `apiClient.getTeamFinancials` → useTeamFinancials (Index)                                                                                 |
| GET    | `api/teams/{teamId}/skills`                    | Get team skills matrix.                              | TeamsController.GetSkills       | `apiClient.getSkillsMatrix` → useSkillsMatrix (SkillsTab)                                                                                 |
| GET    | `api/teams/{teamId}/members/{memberId}/detail` | Get member detail (profile, stored analysis blob).   | TeamsController.GetMemberDetail | `apiClient.getMemberDetail` → useMemberDetail (TeamMemberDetail, AIOverviewDialog)                                                        |

### Meetings (`api/teams/{teamId}/meetings`)

| Method | Endpoint                                       | Description                                                               | Controller                           | Webapp usage                                                                                                                                                         |
| ------ | ---------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `api/teams/{teamId}/meetings`                  | List upcoming 1:1 meetings for the team.                                  | MeetingsController.GetUpcoming       | `apiClient.getMeetings` → useMeetings (OneOnOnePlanner)                                                                                                              |
| GET    | `api/teams/{teamId}/meetings/past`             | List past 1:1 meetings.                                                   | MeetingsController.GetPast           | `apiClient.getPastMeetings` → usePastMeetings (OneOnOnePlanner)                                                                                                      |
| GET    | `api/teams/{teamId}/meetings/deferred-topics`  | List deferred topics across meetings.                                     | MeetingsController.GetDeferredTopics | `apiClient.getDeferredTopics` → useDeferredTopics (OneOnOnePlanner)                                                                                                  |
| POST   | `api/teams/{teamId}/meetings/{meetingId}/prep` | Trigger AI-generated 1:1 brief for a meeting (orchestrator + prep agent). | MeetingsController.TriggerPrep       | `apiClient.triggerMeetingPrep` → **AI Prep** button in MeetingDetail (1:1 Planner); dialog with brief and "Add topics to agenda" (no “Generate prep” in 1:1 Planner) |

### Members

| Method | Endpoint                                   | Description                                                                | Controller                         | Webapp usage                                                                                                                                  |
| ------ | ------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `api/members/{memberId}/dashboard?teamId=` | Get member dashboard (KPIs, dev goals, prep topics, etc.).                 | MembersController.GetDashboard     | `apiClient.getMemberDashboard` → useMemberDashboard (MemberDashboardWidgets, MemberPrep, MemberDevPlan, MemberDelivery, AICoachPanel)         |
| GET    | `api/members/{memberId}/signals?teamId=`   | List signals for a specific member.                                        | MembersController.GetMemberSignals | `apiClient.getMemberSignals` → useMemberSignals (MemberDashboardWidgets, MemberSignals, AICoachPanel)                                         |
| POST   | `api/members/{memberId}/prep?teamId=`      | Trigger AI-generated 1:1 brief for the member (orchestrator + prep agent). | MembersController.GetPrep          | `apiClient.getMemberPrep` → **Generate prep** button on MemberPrep page; shows AI-generated brief (topics, coach tips, follow-ups, questions) |

### Copilot & Coach

| Method | Endpoint           | Description                                                                  | Controller             | Webapp usage                           |
| ------ | ------------------ | ---------------------------------------------------------------------------- | ---------------------- | -------------------------------------- |
| POST   | `api/copilot/chat` | Lead/people partner chat: team context + RAG, returns reply and suggestions. | CopilotController.Chat | `apiClient.copilotChat` (CopilotPanel) |
| POST   | `api/coach/chat`   | Member chat: individual context + RAG, returns reply and suggestions.        | CoachController.Chat   | `apiClient.coachChat` (AICoachPanel)   |

---

## Search (RAG / Azure AI Search)

Search is used for **RAG (retrieval-augmented generation)** only. Copilot and Coach call it to fetch relevant HR/people knowledge snippets; those snippets are added to the LLM prompt so answers are grounded in documentation (e.g. 1:1 best practices, psychological safety, feedback).

- **Backend:** Azure AI Search (one index).
- **Service:** `IRagService.RetrieveContextAsync(query, maxResults)` — used by PeoplePartnerCopilot and DevelopmentCoach. Conversation prep does **not** use Search.

---

### Index

| Field           | Type    | Purpose                       |
| --------------- | ------- | ----------------------------- |
| `id`            | string  | Document id                   |
| `title`         | string  | Document title                |
| `content`       | string  | Full text (keyword search)    |
| `contentVector` | float[] | Embedding for semantic search |

Index name is from config (e.g. `logiq-knowledge`). Created and seeded at startup by `SearchIndexProvisioningService` if Azure Search is configured.

---

### Indexing (startup)

1. Index is created with the fields above; vector profile uses the dimensions from config.
2. Seed HR documents (e.g. 1:1 best practices, churn mitigation, psychological safety, IDP, burnout, career conversations, feedback) are uploaded.
3. Each document's `title` + `content` is sent to **Azure OpenAI** (embedding deployment, e.g. `text-embedding-3-small`) via `IEmbeddingService`.
4. The returned vector is stored in `contentVector`. If embedding is not configured, documents are still stored for keyword-only search.

---

### Retrieval (when Copilot or Coach gets RAG context)

1. **Embed query:** `IEmbeddingService.GetEmbeddingAsync(query)` (same Azure OpenAI embedding model).
2. **Search:** If embedding is available → **vector search** on `contentVector` (semantic similarity). If not, or no vector hits → **keyword search** on `content` (fallback).
3. **Return:** Top `maxResults` snippets (e.g. 5) as a single context string for the LLM prompt.

---

### Configuration

| Config key (under `Azure:Search`) | Meaning                   |
| --------------------------------- | ------------------------- |
| `Endpoint`, `ApiKey`              | Azure AI Search client    |
| `IndexName`                       | Index name                |
| `VectorFieldName`                 | e.g. `contentVector`      |
| `VectorSearchDimensions`          | Must match embedding size |

Embedding model: `Azure:OpenAI:EmbeddingDeploymentName`. If Search or embedding is missing, provisioning or retrieval is skipped (no RAG).
