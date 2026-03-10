# Logiq System Architecture

This document describes how the Logiq API, webapp, AI agents, and MCP (Model Context Protocol) tools work together: data flow, endpoints, entities, and design choices (e.g. when the API uses repositories directly vs when agents use MCP tool classes).

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              WEBAPP (React)                                  │
│  Pages: Dashboard (Index), My Team, Wellbeing Risks, 1:1 Planner, Prep,      │
│         Team Member Detail, Skills, Delivery, Dev Plan, Signals, Settings    │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTP (apiClient + useApiData hooks)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (ASP.NET Core)                           │
│  Controllers: Teams, Members, Meetings, Copilot, Coach, Search              │
│  ├── REST endpoints → inject Repositories (direct) → Azure Table Storage    │
│  └── Chat / Prep endpoints → inject Agents → Agents use MCP Tools → Repos   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────────┐         ┌──────────────┐
│ Repositories  │         │ AnalyzerOrchestrator │         │ Copilot /    │
│ (Storage)     │         │ → WellbeingAnalyzer  │         │ Coach Agents │
│               │         │ → SkillsAnalyzer     │         │ (use Repos   │
│ Used by:      │         │ → DeliveryAnalyzer   │         │  + RAG)      │
│ - Controllers │         │ → ConversationPrep   │         │              │
│ - MCP Tools   │         │   (each uses MCP      │         │              │
│               │         │    Tool classes)     │         │              │
└───────────────┘         └──────────┬──────────┘         └──────────────┘
                                     │
                                     ▼
                            ┌─────────────────────┐
                            │ MCP Tool Classes    │
                            │ (WellbeingSignals,  │
                            │  HrDataGateway,     │
                            │  LearningSkills,    │
                            │  DeliveryMetrics)   │
                            │ → use Repositories  │
                            │ → also exposed as   │
                            │   MCP server at     │
                            │   /mcp for external │
                            │   clients           │
                            └─────────────────────┘
```

- **Webapp** talks only to the **REST API** (no direct MCP from the browser).
- **Controllers** that serve CRUD/data (teams, members, meetings, KPIs, etc.) use **repositories directly** for simplicity and low latency.
- **Controllers** that serve AI (Copilot chat, Coach chat, 1:1 Prep) use **agents**. Those agents get data either by:
  - **Injecting MCP tool classes** and calling them in process (analyzers + ConversationPrepAgent), or
  - **Injecting repositories + RAG** (PeoplePartnerCopilot, DevelopmentCoach).
- **MCP tool classes** are the same C# classes that are exposed as **MCP server tools** at `POST /mcp` for external MCP clients; inside the API, agents call these classes directly (no MCP protocol over the wire).

---

## 2. Why Controllers Use Repositories Directly (and When Agents Use MCP Tools)

- **REST API (Teams, Members, Meetings, etc.)**  
  Controllers need to return domain models (e.g. `Employee`, `MemberDashboard`) with stable shapes and status codes. They inject **repositories** and call them directly. This keeps the HTTP layer simple and avoids an extra hop through MCP.

- **Agents (analyzers, ConversationPrep, Copilot, Coach)**  
  Agents need **tool-shaped** data (e.g. “pulse results”, “sprint summary”) and often the same capabilities should be available to **external MCP clients**. So:
  - **MCP tool classes** (e.g. `WellbeingSignalsTools`, `HrDataGatewayTools`) are implemented once: they use **repositories** internally and return JSON strings.
  - **Agents** inject these tool classes and call them **in process** (e.g. `await wellbeingTools.GetPulseResults(teamId)`). So agents “use MCP” in the sense of using the **same tool implementations** that are exposed via the MCP server; they do not open an MCP client connection to themselves.
  - **External MCP clients** can call the same tools over the **MCP protocol** at `POST /mcp`.

So: **repositories** are the single source of storage access. **Controllers** use repos for REST. **MCP tools** wrap repos for agent- and MCP-client use.

---

## 3. Endpoints: Full List and Webapp Usage

### 3.1 Teams (`api/teams/{teamId}`)

| Method | Endpoint | Controller | Webapp usage |
|--------|----------|------------|--------------|
| GET | `api/teams/{teamId}/employees` | TeamsController.GetEmployees | ✅ `apiClient.getEmployees` → useEmployees (Index, MyTeam, WellbeingRisks, OneOnOnePlanner, AppShell, SkillsTab, DeliveryTab, MeetingDetail) |
| GET | `api/teams/{teamId}/employees/{employeeId}` | TeamsController.GetEmployee | ✅ `apiClient.getEmployee` → useEmployee (TeamMemberDetail) |
| GET | `api/teams/{teamId}/signals` | TeamsController.GetSignals | ✅ `apiClient.getSignals` → useSignals (Index, WellbeingRisks) |
| GET | `api/teams/{teamId}/kpis` | TeamsController.GetKpis | ✅ `apiClient.getTeamKPIs` → useTeamKPIs (Index, Landing) |
| GET | `api/teams/{teamId}/financials` | TeamsController.GetFinancials | ✅ `apiClient.getTeamFinancials` → useTeamFinancials (Index) |
| GET | `api/teams/{teamId}/skills` | TeamsController.GetSkills | ✅ `apiClient.getSkillsMatrix` → useSkillsMatrix (SkillsTab) |
| GET | `api/teams/{teamId}/members/{memberId}/detail` | TeamsController.GetMemberDetail | ✅ `apiClient.getMemberDetail` → useMemberDetail (TeamMemberDetail, AIOverviewDialog) |

### 3.2 Meetings (`api/teams/{teamId}/meetings`)

| Method | Endpoint | Controller | Webapp usage |
|--------|----------|------------|--------------|
| GET | `api/teams/{teamId}/meetings` | MeetingsController.GetUpcoming | ✅ `apiClient.getMeetings` → useMeetings (OneOnOnePlanner) |
| GET | `api/teams/{teamId}/meetings/past` | MeetingsController.GetPast | ✅ `apiClient.getPastMeetings` → usePastMeetings (OneOnOnePlanner) |
| GET | `api/teams/{teamId}/meetings/deferred-topics` | MeetingsController.GetDeferredTopics | ✅ `apiClient.getDeferredTopics` → useDeferredTopics (OneOnOnePlanner) |
| POST | `api/teams/{teamId}/meetings/{meetingId}/prep` | MeetingsController.TriggerPrep | ⚠️ `apiClient.triggerMeetingPrep` exists but **no UI currently calls it** (no “Generate prep” in 1:1 Planner) |

### 3.3 Members

| Method | Endpoint | Controller | Webapp usage |
|--------|----------|------------|--------------|
| GET | `api/members/{memberId}/dashboard?teamId=` | MembersController.GetDashboard | ✅ `apiClient.getMemberDashboard` → useMemberDashboard (MemberDashboardWidgets, MemberPrep, MemberDevPlan, MemberDelivery, AICoachPanel) |
| GET | `api/members/{memberId}/signals?teamId=` | MembersController.GetMemberSignals | ✅ `apiClient.getMemberSignals` → useMemberSignals (MemberDashboardWidgets, MemberSignals, AICoachPanel) |
| POST | `api/members/{memberId}/prep?teamId=` | MembersController.GetPrep | ❌ **Not in apiClient**; webapp does not call this (equivalent to prep by memberId without a meeting) |
| GET | `api/me/dashboard?memberId=1&teamId=` | MembersController.GetMyDashboard | ❌ **Not in apiClient**; webapp uses `getMemberDashboard("1")` instead |
| GET | `api/me/signals?memberId=1&teamId=` | MembersController.GetMySignals | ❌ **Not in apiClient**; webapp uses `getMemberSignals("1")` instead |

### 3.4 Copilot & Coach

| Method | Endpoint | Controller | Webapp usage |
|--------|----------|------------|--------------|
| POST | `api/copilot/chat` | CopilotController.Chat | ✅ `apiClient.copilotChat` (CopilotPanel) |
| POST | `api/coach/chat` | CoachController.Chat | ✅ `apiClient.coachChat` (AICoachPanel) |

### 3.5 Search (RAG / Azure AI Search)

| Method | Endpoint | Controller | Webapp usage |
|--------|----------|------------|--------------|
| GET | `api/search/status` | SearchController.GetStatus | ❌ **Not in apiClient**; for ops/debug (index name + document count) |

**RAG index and retrieval:** The search index is created and seeded by `SearchIndexProvisioningService` at startup. The index has fields `id`, `title`, `content`, and a vector field (`contentVector` by default). Seed HR documents are embedded at provisioning time via `IEmbeddingService` (Azure OpenAI embeddings); each document’s `title` and `content` are concatenated and embedded, and the resulting vector is stored in `contentVector`. **Retrieval** (`IRagService.RetrieveContextAsync`): the query is embedded with `IEmbeddingService.GetEmbeddingAsync`; if an embedding is returned, **vector search** is used (Azure AI Search vector query on `contentVector`); otherwise **keyword search** is used as fallback. This provides semantic search when embeddings are configured.

---

## 4. Summary: Endpoints Not Used by the Webapp

- **GET `api/me/dashboard`** – Webapp uses `GET api/members/1/dashboard` (or current member id) instead.
- **GET `api/me/signals`** – Webapp uses `GET api/members/1/signals` instead.
- **POST `api/members/{memberId}/prep`** – Not exposed in apiClient; could be used for “prep for this member” without picking a meeting.
- **POST `api/teams/{teamId}/meetings/{meetingId}/prep`** – Exposed as `triggerMeetingPrep` but no button or flow in the UI calls it yet.
- **GET `api/search/status`** – Intended for verification of RAG index; not needed by the app UI.

---

## 5. Entities (Domain Models)

| Entity | Description | Main storage / source |
|--------|-------------|------------------------|
| **Employee** | Team member: id, name, role, tenure, KPI scores (wellbeing, skills, motivation, delivery), churn risk, meeting hours, etc. | EmployeeRepository (Azure Table) |
| **Signal** | Team-level alert (e.g. wellbeing, delivery); id, type, title, message, employeeId, time, action | SignalRepository |
| **MemberSignal** | Member-level signal (warning, opportunity, recognition, wellbeing, milestone) | SignalRepository (member partition) |
| **Meeting** | 1:1 meeting: id, name, role, date, duration, topics, notes, followUps | MeetingRepository |
| **DeferredTopic** | Postponed topic from a 1:1 (id, text, person) | MeetingRepository |
| **TeamKpis** | Team KPIs: wellbeing, skills, motivation, churn, delivery (score, status, label, trend, description) | TeamKpiRepository |
| **TeamFinancials** | atRiskCount, totalEmployees, churnExposure, totalPeopleRisk | TeamKpiRepository |
| **SkillsMatrix** | allSkills[], employeeSkills{ [id]: skills[] } | MemberRepository (blob in AnalysisResults table) |
| **MemberDetail** | Rich profile: department, skills, roleHistory, projects, feedback, training, signals, certifications, counts | MemberRepository (blob) |
| **MemberDashboard** | employeeId, kpis, signals, devGoals, learningItems, skills, sprintContributions, deliveryStats, prepTopics, coachTips, wins, questionsToAsk | MemberRepository (blob) |
| **ConversationPrep** | 1:1 brief: teamId, memberId, memberName, suggestedTopics, followUpActions, coachTips, questionsToAsk, contextSummary | Produced by ConversationPrepAgent (orchestrator) |

---

## 6. Agents

| Agent | Purpose | Used by | Data access |
|-------|---------|---------|-------------|
| **WellbeingRiskAnalyzer** | Analyzes team wellbeing, churn risk, engagement; produces WellbeingAnalysis and persists high/critical signals | AnalyzerOrchestrator | WellbeingSignalsTools, HrDataGatewayTools (→ repos) |
| **SkillsGrowthAnalyzer** | Analyzes skills coverage, IDP progress, learning; produces SkillsAnalysis | AnalyzerOrchestrator | LearningSkillsTools (→ repos) |
| **DeliveryWorkloadAnalyzer** | Analyzes velocity, meeting load, overtime; produces DeliveryAnalysis and persists workload signals | AnalyzerOrchestrator | DeliveryMetricsTools (→ repos) |
| **ConversationPrepAgent** | Builds 1:1 brief (ConversationPrep) from wellbeing + skills + delivery + meetings/deferred | AnalyzerOrchestrator (PrepareConversationAsync) | HrDataGatewayTools, IEmployeeRepository, IMemberRepository |
| **PeoplePartnerCopilot** | Chat for leads: team health, 1:1 prep, signals, KPIs; uses RAG for knowledge | CopilotController | IEmployeeRepository, ITeamKpiRepository, ISignalRepository, IRagService |
| **DevelopmentCoach** | Chat for members: growth, 1:1 prep, goals; uses RAG | CoachController | IEmployeeRepository, IMemberRepository, IRagService |

**Orchestrator:** `AnalyzerOrchestrator` runs the three analyzers (in parallel when needed) and then calls `ConversationPrepAgent` with their results. It is used only for **conversation prep** from the API: `POST api/teams/{teamId}/meetings/{meetingId}/prep` and `POST api/members/{memberId}/prep`.

---

## 7. MCP Tools (Server Tool Classes)

These classes are registered as MCP server tools (exposed at `POST /mcp`) and are **also** injected into agents and called directly in process.

| Tool class | Methods | Used by agents |
|------------|---------|----------------|
| **WellbeingSignalsTools** | GetPulseResults, GetSafetyScores, GetTeamSignals, GetSentimentTrends, GetMemberSignals | WellbeingRiskAnalyzer |
| **HrDataGatewayTools** | GetEmployeeProfile, ListTeamEmployees, ListAbsences, GetOrgTree, ListMeetings, GetDeferredTopics | WellbeingRiskAnalyzer (ListAbsences), ConversationPrepAgent (ListMeetings, GetDeferredTopics) |
| **LearningSkillsTools** | GetTrainingRecords, GetIdpGoals, GetSkillAssessments, GetMemberSkillProfile | SkillsGrowthAnalyzer |
| **DeliveryMetricsTools** | GetSprintSummary, GetPrMetrics, GetMeetingLoad | DeliveryWorkloadAnalyzer |

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

| Repository | Table(s) | Used by |
|------------|----------|---------|
| **EmployeeRepository** | EmployeesTable | Controllers, MCP tools, Copilot, Coach, Orchestrator/agents |
| **SignalRepository** | SignalsTable (team signals: PartitionKey=teamId; member signals: PartitionKey=teamId:memberId, IsMemberSignal=true) | Controllers, WellbeingSignalsTools, WellbeingRiskAnalyzer, DeliveryWorkloadAnalyzer, Copilot |
| **MeetingRepository** | MeetingsTable, DeferredTopicsTable | Controllers, HrDataGatewayTools, ConversationPrepAgent |
| **TeamKpiRepository** | TeamKpiSnapshotsTable (KPIs + financials in same table) | Controllers, Copilot, Orchestrator (writes KPIs after full analysis) |
| **MemberRepository** | AnalysisResultsTable (blobs: detail, dashboard, skills by key) | Controllers, LearningSkillsTools, ConversationPrepAgent, Coach |

Unused config keys (MeetingTopicsTable, FollowUpsTable, MemberSkillsTable, etc.) have been removed; topics/follow-ups are stored as JSON on Meeting entities, and member detail/dashboard/skills are in AnalysisResultsTable.

---

## 10. Agent flows: from web page to API to agent

For each agent (and the conversation-prep pipeline), this section traces the full flow: **web page → user action → API call → controller → agent(s) → data sources → LLM → response back to UI**.

---

### 10.1 People Partner Copilot (lead/people partner chat)

| Step | Where | What happens |
|------|--------|----------------|
| **1. Entry** | Any page (lead view) | App shell shows **Copilot FAB** (floating button). User clicks it. |
| **2. UI** | `AppShell.tsx` / `App.tsx` | `CopilotPanel` opens (slide-out or modal). Rendered for **lead** role. |
| **3. User action** | `CopilotPanel.tsx` | User types a message and sends (e.g. “Which employees are at risk?”). |
| **4. API call** | `lib/api.ts` | `apiClient.copilotChat({ message, teamId, conversationId })` → **POST** `api/copilot/chat` with body `{ message, conversationId?, teamId? }`. |
| **5. Controller** | `CopilotController.Chat` | Receives request; `teamId = request.TeamId ?? "team1"`. Calls `copilot.ChatAsync(teamId, request, cancellationToken)`. |
| **6. Agent** | `PeoplePartnerCopilot.ChatAsync` | **Data load (repos, no MCP):** `employeeRepository.ListByTeamAsync(teamId)`, `kpiRepository.GetCurrentAsync(teamId)`, `signalRepository.ListTeamSignalsAsync(teamId)`, `ragService.RetrieveContextAsync(message, 5)`. Builds system prompt with team size, at-risk list, KPIs, signal summary, and RAG snippet. Creates **ChatCompletionAgent** (Semantic Kernel) with that prompt, adds user message, invokes LLM. |
| **7. Response** | Same agent | Returns `ChatResponse { conversationId, reply, suggestions }`. Controller returns 200 OK with that JSON. |
| **8. Back to UI** | `CopilotPanel.tsx` | Displays `reply` in chat thread; shows `suggestions` as quick-reply buttons. |

**Data sources (no MCP in this path):** `IEmployeeRepository`, `ITeamKpiRepository`, `ISignalRepository`, `IRagService` (Azure AI Search).

---

### 10.2 Development Coach (member chat)

| Step | Where | What happens |
|------|--------|----------------|
| **1. Entry** | Any page (member view) | Same **Copilot FAB**; when in **member** role, opening it can show **AI Coach** (or user switches to Coach). `AICoachPanel` is opened (e.g. from nav or FAB). |
| **2. UI** | `AppShell.tsx` / `AICoachPanel.tsx` | `AICoachPanel` opens with `memberId` (default `"1"`), `teamId` (default `"team1"`). Uses `useMemberDashboard(memberId, teamId)` for prep topics in context. |
| **3. User action** | `AICoachPanel.tsx` | User types a message (e.g. “Help me prepare for my 1:1”). |
| **4. API call** | `lib/api.ts` | `apiClient.coachChat({ message, memberId, teamId, conversationId })` → **POST** `api/coach/chat` with body `{ message, conversationId?, teamId?, memberId? }`. |
| **5. Controller** | `CoachController.Chat` | Receives request; `memberId = request.MemberId ?? "1"`. Calls `coach.ChatAsync(memberId, request, cancellationToken)`. |
| **6. Agent** | `DevelopmentCoach.ChatAsync` | **Data load (repos, no MCP):** `employeeRepository.GetByIdAsync(teamId, memberId)`, `memberRepository.GetDashboardAsync(teamId, memberId)`, `ragService.RetrieveContextAsync(message, 5)`. Builds member context (name, role, tenure, KPIs, IDP progress, prep topics, RAG). Creates **ChatCompletionAgent**, adds user message, invokes LLM. |
| **7. Response** | Same agent | Returns `ChatResponse { conversationId, reply, suggestions }`. Controller returns 200 OK. |
| **8. Back to UI** | `AICoachPanel.tsx` | Displays reply and suggestion chips. |

**Data sources (no MCP in this path):** `IEmployeeRepository`, `IMemberRepository`, `IRagService`.

---

### 10.3 Conversation prep (1:1 brief) — orchestrated pipeline

This flow is triggered only from the **API** (no webapp button currently). Two endpoints can start it:

- **POST** `api/teams/{teamId}/meetings/{meetingId}/prep` (MeetingsController) — derives `memberId` from the meeting.
- **POST** `api/members/{memberId}/prep?teamId=` (MembersController) — prep by member only.

| Step | Where | What happens |
|------|--------|----------------|
| **1. Entry** | (Future) 1:1 Planner or Prep page | Ideally: user selects a meeting and clicks “Generate prep”. Today: **no UI calls these endpoints**; `apiClient.triggerMeetingPrep(teamId, meetingId)` exists but is never invoked. |
| **2. API call** | (If wired) e.g. `OneOnOnePlanner.tsx` or `MemberPrep.tsx` | Would call **POST** `api/teams/team1/meetings/{meetingId}/prep` or a **POST** `api/members/{memberId}/prep` client method. |
| **3. Controller** | `MeetingsController.TriggerPrep` or `MembersController.GetPrep` | Meetings: loads meeting, gets `memberId` from meeting id; Members: uses route `memberId` + query `teamId`. Both call `orchestrator.PrepareConversationAsync(teamId, memberId, cancellationToken)`. |
| **4. Orchestrator** | `AnalyzerOrchestrator.PrepareConversationAsync` | Runs **in parallel:** `wellbeingAnalyzer.AnalyzeTeamAsync(teamId)`, `skillsAnalyzer.AnalyzeTeamAsync(teamId)`, `deliveryAnalyzer.AnalyzeTeamAsync(teamId)`. Awaits all three, then calls `conversationPrepAgent.PrepareAsync(teamId, memberId, wellbeingResult, skillsResult, deliveryResult, cancellationToken)`. |
| **5a. WellbeingRiskAnalyzer** | Called by orchestrator | **MCP tool calls:** `wellbeingTools.GetPulseResults(teamId)`, `GetSafetyScores(teamId)`, `GetSentimentTrends(teamId)`, `hrTools.ListAbsences(teamId)`. Builds prompt with that JSON; creates **ChatCompletionAgent**; invokes LLM; parses JSON to `WellbeingAnalysis`. Persists high/critical risk as team signals via `signalRepository.UpsertTeamSignalAsync`. Returns `WellbeingAnalysis`. |
| **5b. SkillsGrowthAnalyzer** | Called by orchestrator | **MCP tool calls:** `learningTools.GetTrainingRecords(teamId)`, `GetIdpGoals(teamId)`, `GetSkillAssessments(teamId)`. Prompt + LLM; parses to `SkillsAnalysis`. Returns it. |
| **5c. DeliveryWorkloadAnalyzer** | Called by orchestrator | **MCP tool calls:** `deliveryTools.GetSprintSummary(teamId)`, `GetPrMetrics(teamId)`, `GetMeetingLoad(teamId)`. Prompt + LLM; parses to `DeliveryAnalysis`. Persists overloaded/critical workload as team signals. Returns it. |
| **6. ConversationPrepAgent** | Called by orchestrator with the three results | **Repos:** `employeeRepository.GetByIdAsync(teamId, memberId)`, `memberRepository` not used for dashboard in this path. **MCP tool calls:** `hrTools.ListMeetings(teamId)`, `hrTools.GetDeferredTopics(teamId)`. Extracts member-specific slices from the three analyses (risk, skills insight, delivery insight). Builds prompt; **ChatCompletionAgent** → LLM; parses JSON to `ConversationPrep`. |
| **7. Response** | Controller | Returns 200 OK with `ConversationPrep` (suggestedTopics, followUpActions, coachTips, questionsToAsk, contextSummary, etc.). |
| **8. Back to UI** | (If wired) | Would show the brief in 1:1 Planner meeting detail or on Prep page. Today the **Member Prep** page shows `dashboard.prepTopics` from **GET** member dashboard (seeded or synthesized), not from this prep API. |

**Data sources:** Orchestrator uses **three analyzers** (each uses MCP tool classes → repos) and **ConversationPrepAgent** (repos + HrDataGatewayTools). No RAG in this pipeline.

---

### 10.4 Summary table: agent entry points and data

| Agent / pipeline | Web entry | API endpoint | Data sources |
|------------------|-----------|--------------|--------------|
| **PeoplePartnerCopilot** | Copilot FAB → CopilotPanel (lead) | POST `api/copilot/chat` | EmployeeRepository, TeamKpiRepository, SignalRepository, RagService |
| **DevelopmentCoach** | Copilot FAB / nav → AICoachPanel (member) | POST `api/coach/chat` | EmployeeRepository, MemberRepository, RagService |
| **Conversation prep** | (No UI yet) | POST `api/teams/.../meetings/.../prep` or POST `api/members/.../prep` | Orchestrator → WellbeingRiskAnalyzer (WellbeingSignalsTools, HrDataGatewayTools), SkillsGrowthAnalyzer (LearningSkillsTools), DeliveryWorkloadAnalyzer (DeliveryMetricsTools), then ConversationPrepAgent (HrDataGatewayTools, EmployeeRepository); all tools use repos |

---

This document can be kept in the repo and updated when new endpoints, agents, or MCP tools are added.
