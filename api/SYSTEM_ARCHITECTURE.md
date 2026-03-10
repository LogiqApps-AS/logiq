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

| Repository | Main tables / keys | Used by |
|------------|--------------------|---------|
| **EmployeeRepository** | EmployeesTable (teamId, employee id) | Controllers, MCP tools, Copilot, Coach, Orchestrator/agents |
| **SignalRepository** | SignalsTable (team + member signals) | Controllers, WellbeingSignalsTools, WellbeingRiskAnalyzer, DeliveryWorkloadAnalyzer, Copilot |
| **MeetingRepository** | MeetingsTable, DeferredTopics, etc. | Controllers, HrDataGatewayTools, ConversationPrepAgent |
| **TeamKpiRepository** | TeamKpiSnapshotsTable, financials | Controllers, Copilot, Orchestrator (writes KPIs after full analysis) |
| **MemberRepository** | AnalysisResultsTable (detail, dashboard, skills blobs by key) | Controllers, LearningSkillsTools, ConversationPrepAgent, Coach |

---

This document can be kept in the repo and updated when new endpoints, agents, or MCP tools are added.
