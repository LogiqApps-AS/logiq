import type {
  Employee,
  Signal,
  Meeting,
  DeferredTopic,
  MeetingTopic,
  FollowUpAction,
  MemberDetail,
  MemberDashboard,
  MemberSignal,
  DevGoal,
  LearningItem,
  MemberSkill,
  SprintContribution,
  MemberDeliveryStats,
  MemberKpis,
  SkillsMatrix,
  TeamKpis,
  TeamFinancials,
} from "@/types";

export type { Employee, Signal, Meeting, DeferredTopic, MeetingTopic, FollowUpAction };
export type { MemberDashboard, MemberSignal, DevGoal, LearningItem, MemberSkill, SprintContribution, MemberDeliveryStats, MemberKpis, MemberDetail, SkillsMatrix, TeamKpis, TeamFinancials, TeamKpiMetric };

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";
const DEFAULT_TEAM_ID = "team1";

export interface ChatRequest {
  message: string;
  conversationId?: string;
  teamId?: string;
  memberId?: string;
  context?: Record<string, string>;
}

export interface ChatSuggestion {
  text: string;
  action?: string;
}

export interface ChatResponse {
  conversationId: string;
  reply: string;
  suggestions: ChatSuggestion[];
}

export interface ConversationPrep {
  teamId: string;
  memberId: string;
  memberName: string;
  generatedAt: string;
  suggestedTopics: string[];
  followUpActions: string[];
  coachTips: string[];
  questionsToAsk: string[];
  contextSummary: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!response.ok) {
    throw new ApiError(`API error: ${response.statusText}`, response.status);
  }
  return response.json() as Promise<T>;
}

export const apiClient = {
  getEmployees: (teamId = DEFAULT_TEAM_ID): Promise<Employee[]> =>
    fetchJson<Employee[]>(`/api/teams/${teamId}/employees`),

  getEmployee: (teamId = DEFAULT_TEAM_ID, id: string): Promise<Employee | undefined> =>
    fetchJson<Employee>(`/api/teams/${teamId}/employees/${id}`).catch(() => undefined),

  getSignals: (teamId = DEFAULT_TEAM_ID): Promise<Signal[]> =>
    fetchJson<Signal[]>(`/api/teams/${teamId}/signals`),

  getTeamKPIs: (teamId = DEFAULT_TEAM_ID): Promise<TeamKpis> =>
    fetchJson<TeamKpis>(`/api/teams/${teamId}/kpis`),

  getTeamFinancials: (teamId = DEFAULT_TEAM_ID): Promise<TeamFinancials> =>
    fetchJson<TeamFinancials>(`/api/teams/${teamId}/financials`),

  getMeetings: (teamId = DEFAULT_TEAM_ID): Promise<Meeting[]> =>
    fetchJson<Meeting[]>(`/api/teams/${teamId}/meetings`),

  getPastMeetings: (teamId = DEFAULT_TEAM_ID): Promise<Meeting[]> =>
    fetchJson<Meeting[]>(`/api/teams/${teamId}/meetings/past`),

  getDeferredTopics: (teamId = DEFAULT_TEAM_ID): Promise<DeferredTopic[]> =>
    fetchJson<DeferredTopic[]>(`/api/teams/${teamId}/meetings/deferred-topics`),

  getMemberDetail: (teamId = DEFAULT_TEAM_ID, memberId: string): Promise<MemberDetail> =>
    fetchJson<MemberDetail>(`/api/teams/${teamId}/members/${memberId}/detail`),

  getMemberDashboard: (memberId: string, teamId = DEFAULT_TEAM_ID): Promise<MemberDashboard> =>
    fetchJson<MemberDashboard>(`/api/members/${memberId}/dashboard?teamId=${teamId}`),

  getMemberSignals: (memberId: string, teamId = DEFAULT_TEAM_ID): Promise<MemberSignal[]> =>
    fetchJson<MemberSignal[]>(`/api/members/${memberId}/signals?teamId=${teamId}`),

  getSkillsMatrix: (teamId = DEFAULT_TEAM_ID): Promise<SkillsMatrix> =>
    fetchJson<SkillsMatrix>(`/api/teams/${teamId}/skills`),

  copilotChat: (request: ChatRequest): Promise<ChatResponse> =>
    fetchJson<ChatResponse>("/api/copilot/chat", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  coachChat: (request: ChatRequest): Promise<ChatResponse> =>
    fetchJson<ChatResponse>("/api/coach/chat", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  triggerMeetingPrep: (teamId = DEFAULT_TEAM_ID, meetingId: string): Promise<ConversationPrep> =>
    fetchJson<ConversationPrep>(`/api/teams/${teamId}/meetings/${meetingId}/prep`, {
      method: "POST",
    }),

  getMemberPrep: (memberId: string, teamId = DEFAULT_TEAM_ID): Promise<ConversationPrep> =>
    fetchJson<ConversationPrep>(`/api/members/${memberId}/prep?teamId=${teamId}`, {
      method: "POST",
    }),
};
