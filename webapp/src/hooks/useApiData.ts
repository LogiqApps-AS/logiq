/**
 * Custom React Query hooks wrapping the fake API client.
 * Provides loading, error, and data states for all data domains.
 */
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/fakeApi";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => api.getEmployees(),
    staleTime: STALE_TIME,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => api.getEmployee(id),
    staleTime: STALE_TIME,
    enabled: !!id,
  });
}

export function useSignals() {
  return useQuery({
    queryKey: ["signals"],
    queryFn: () => api.getSignals(),
    staleTime: STALE_TIME,
  });
}

export function useTeamKPIs() {
  return useQuery({
    queryKey: ["teamKPIs"],
    queryFn: () => api.getTeamKPIs(),
    staleTime: STALE_TIME,
  });
}

export function useTeamFinancials() {
  return useQuery({
    queryKey: ["teamFinancials"],
    queryFn: () => api.getTeamFinancials(),
    staleTime: STALE_TIME,
  });
}

export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: () => api.getMeetings(),
    staleTime: STALE_TIME,
  });
}

export function usePastMeetings() {
  return useQuery({
    queryKey: ["pastMeetings"],
    queryFn: () => api.getPastMeetings(),
    staleTime: STALE_TIME,
  });
}

export function useDeferredTopics() {
  return useQuery({
    queryKey: ["deferredTopics"],
    queryFn: () => api.getDeferredTopics(),
    staleTime: STALE_TIME,
  });
}
