import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

const STALE_TIME = 5 * 60 * 1000;
const DEFAULT_TEAM_ID = "team1";

export function useEmployees(teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["employees", teamId],
    queryFn: () => apiClient.getEmployees(teamId),
    staleTime: STALE_TIME,
  });
}

export function useEmployee(id: string, teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["employee", teamId, id],
    queryFn: () => apiClient.getEmployee(teamId, id),
    staleTime: STALE_TIME,
    enabled: !!id,
  });
}

export function useSignals(teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["signals", teamId],
    queryFn: () => apiClient.getSignals(teamId),
    staleTime: STALE_TIME,
  });
}

export function useTeamKPIs(teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["teamKPIs", teamId],
    queryFn: () => apiClient.getTeamKPIs(teamId),
    staleTime: STALE_TIME,
  });
}

export function useTeamFinancials(teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["teamFinancials", teamId],
    queryFn: () => apiClient.getTeamFinancials(teamId),
    staleTime: STALE_TIME,
  });
}

export function useMeetings(teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["meetings", teamId],
    queryFn: () => apiClient.getMeetings(teamId),
    staleTime: STALE_TIME,
  });
}

export function usePastMeetings(teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["pastMeetings", teamId],
    queryFn: () => apiClient.getPastMeetings(teamId),
    staleTime: STALE_TIME,
  });
}

export function useDeferredTopics(teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["deferredTopics", teamId],
    queryFn: () => apiClient.getDeferredTopics(teamId),
    staleTime: STALE_TIME,
  });
}

export function useMemberDashboard(memberId: string, teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["memberDashboard", teamId, memberId],
    queryFn: () => apiClient.getMemberDashboard(memberId, teamId),
    staleTime: STALE_TIME,
    enabled: !!memberId,
  });
}

export function useMemberSignals(memberId: string, teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["memberSignals", teamId, memberId],
    queryFn: () => apiClient.getMemberSignals(memberId, teamId),
    staleTime: STALE_TIME,
    enabled: !!memberId,
  });
}

export function useMemberDetail(memberId: string, teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["memberDetail", teamId, memberId],
    queryFn: () => apiClient.getMemberDetail(teamId, memberId),
    staleTime: STALE_TIME,
    enabled: !!memberId,
  });
}

export function useSkillsMatrix(teamId = DEFAULT_TEAM_ID) {
  return useQuery({
    queryKey: ["skillsMatrix", teamId],
    queryFn: () => apiClient.getSkillsMatrix(teamId),
    staleTime: STALE_TIME,
  });
}
