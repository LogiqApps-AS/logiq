import { PageHeader } from "../components/PageHeader";
import {
  makeStyles,
  Text,
  Button,
  Card,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Avatar,
} from "@fluentui/react-components";
import { Add20Regular, Dismiss20Regular } from "@fluentui/react-icons";
import { useState, useMemo, useCallback, useReducer } from "react";
import { AppShell } from "../components/AppShell";
import { PlannerKPICards } from "../components/planner/PlannerKPICards";
import { WeekCalendarStrip } from "../components/planner/WeekCalendarStrip";
import { MeetingList } from "../components/planner/MeetingList";
import { MeetingDetail } from "../components/planner/MeetingDetail";
import { useMeetings, usePastMeetings, useDeferredTopics, useEmployees } from "../hooks/useApiData";
import { ErrorState, SkeletonBlock } from "../components/LoadingState";
import type { Meeting, MeetingTopic, FollowUpAction } from "@/lib/api";
import { format } from "date-fns";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  body: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: "24px",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
});

const PlannerSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} style={{ padding: "16px" }}>
          <SkeletonBlock width="100%" height="14px" style={{ marginBottom: "8px" }} />
          <SkeletonBlock width="50px" height="28px" />
        </Card>
      ))}
    </div>
    <SkeletonBlock width="100%" height="60px" />
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <SkeletonBlock width="36px" height="36px" borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <SkeletonBlock width="100px" height="16px" style={{ marginBottom: "4px" }} />
                <SkeletonBlock width="140px" height="12px" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card style={{ padding: "24px" }}>
        <SkeletonBlock width="160px" height="20px" style={{ marginBottom: "16px" }} />
        <SkeletonBlock width="100%" height="14px" style={{ marginBottom: "8px" }} />
        <SkeletonBlock width="80%" height="14px" />
      </Card>
    </div>
  </div>
);

const avatarColors = ["#0f6cbd", "#7b2ff2", "#e3008c", "#107c41", "#f7630c", "#5b5fc7", "#d13438"];

type UIState = {
  selectedId: string | null;
  selectedDate: Date | null;
  showNewDialog: boolean;
  newMeetingEmployee: string;
  newMeetingDate: string;
};

type UIAction =
  | { type: 'SET_SELECTED_ID'; id: string | null }
  | { type: 'SET_SELECTED_DATE'; date: Date | null }
  | { type: 'SET_SHOW_NEW_DIALOG'; show: boolean }
  | { type: 'SET_NEW_MEETING_EMPLOYEE'; name: string }
  | { type: 'SET_NEW_MEETING_DATE'; date: string }
  | { type: 'RESET_NEW_MEETING' };

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'SET_SELECTED_ID':
      return { ...state, selectedId: action.id };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.date };
    case 'SET_SHOW_NEW_DIALOG':
      return { ...state, showNewDialog: action.show };
    case 'SET_NEW_MEETING_EMPLOYEE':
      return { ...state, newMeetingEmployee: action.name };
    case 'SET_NEW_MEETING_DATE':
      return { ...state, newMeetingDate: action.date };
    case 'RESET_NEW_MEETING':
      return { ...state, newMeetingEmployee: '', newMeetingDate: format(new Date(), 'yyyy-MM-dd'), showNewDialog: false };
    default:
      return state;
  }
};

const OneOnOnePlanner = () => {
  const styles = useStyles();
  const { data: meetingsData, isLoading: meetLoading, isError: meetError, refetch: refetchMeet } = useMeetings();
  const { data: pastMeetingsData, isLoading: pastLoading } = usePastMeetings();
  const { data: deferredTopicsData } = useDeferredTopics();
  const { data: employeesData = [] } = useEmployees();

  const [localUpcoming, setLocalUpcoming] = useState<Meeting[] | null>(null);
  const [localPast, setLocalPast] = useState<Meeting[] | null>(null);
  const [localDeferred, setLocalDeferred] = useState<{ id: string; text: string; person: string }[] | null>(null);

  const [uiState, dispatchUI] = useReducer(uiReducer, {
    selectedId: null,
    selectedDate: null,
    showNewDialog: false,
    newMeetingEmployee: '',
    newMeetingDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const upcoming = localUpcoming ?? meetingsData ?? [];
  const past = localPast ?? pastMeetingsData ?? [];
  const deferred = localDeferred ?? deferredTopicsData ?? [];

  if (meetingsData && !localUpcoming) setLocalUpcoming([...meetingsData]);
  if (pastMeetingsData && !localPast) setLocalPast([...pastMeetingsData]);
  if (deferredTopicsData && !localDeferred) setLocalDeferred([...deferredTopicsData]);

  const allMeetings = useMemo(() => [...upcoming, ...past], [upcoming, past]);
  const effectiveSelectedId = uiState.selectedId ?? upcoming[0]?.id ?? null;
  const selectedMeeting = allMeetings.find((m) => m.id === effectiveSelectedId) || null;
  const isLoading = meetLoading || pastLoading;

  const updateMeeting = useCallback((id: string, updater: (m: Meeting) => Meeting) => {
    setLocalUpcoming((prev) => prev?.map((m) => m.id === id ? updater(m) : m) ?? null);
    setLocalPast((prev) => prev?.map((m) => m.id === id ? updater(m) : m) ?? null);
  }, []);

  const handleToggleTopic = useCallback((meetingId: string, topicId: string) => {
    updateMeeting(meetingId, (m) => ({
      ...m,
      topics: m.topics.map((t) =>
        t.id === topicId
          ? { ...t, status: t.status === "discussed" ? "pending" as const : "discussed" as const }
          : t
      ),
    }));
  }, [updateMeeting]);

  const handleDeleteTopic = useCallback((meetingId: string, topicId: string) => {
    updateMeeting(meetingId, (m) => ({
      ...m,
      topics: m.topics.filter((t) => t.id !== topicId),
      topicCount: m.topicCount - 1,
    }));
  }, [updateMeeting]);

  const handleAddTopic = useCallback((meetingId: string, text: string) => {
    const newTopic: MeetingTopic = {
      id: `t-${Date.now()}`,
      icon: "target",
      text,
      status: "pending",
    };
    updateMeeting(meetingId, (m) => ({
      ...m,
      topics: [...m.topics, newTopic],
      topicCount: m.topicCount + 1,
    }));
  }, [updateMeeting]);

  const handleToggleFollowUp = useCallback((meetingId: string, followUpId: string) => {
    updateMeeting(meetingId, (m) => ({
      ...m,
      followUps: m.followUps.map((f) =>
        f.id === followUpId ? { ...f, done: !f.done } : f
      ),
    }));
  }, [updateMeeting]);

  const handleAddFollowUp = useCallback((meetingId: string, text: string) => {
    const newFollowUp: FollowUpAction = {
      id: `fu-${Date.now()}`,
      text,
      done: false,
    };
    updateMeeting(meetingId, (m) => ({
      ...m,
      followUps: [...m.followUps, newFollowUp],
    }));
  }, [updateMeeting]);

  const handleDeleteFollowUp = useCallback((meetingId: string, followUpId: string) => {
    updateMeeting(meetingId, (m) => ({
      ...m,
      followUps: m.followUps.filter((f) => f.id !== followUpId),
    }));
  }, [updateMeeting]);

  const handleUpdateNotes = useCallback((meetingId: string, notes: string) => {
    updateMeeting(meetingId, (m) => ({ ...m, notes }));
  }, [updateMeeting]);

  const handleCompleteMeeting = useCallback((meetingId: string) => {
    const meeting = upcoming.find((m) => m.id === meetingId);
    if (!meeting) return;
    setLocalUpcoming((prev) => prev?.filter((m) => m.id !== meetingId) ?? null);
    setLocalPast((prev) => [
      { ...meeting, topics: meeting.topics.map((t) => ({ ...t, status: "discussed" as const })) },
      ...(prev ?? []),
    ]);
    dispatchUI({ type: 'SET_SELECTED_ID', id: null });
  }, [upcoming]);

  const handleCancelMeeting = useCallback((meetingId: string) => {
    setLocalUpcoming((prev) => prev?.filter((m) => m.id !== meetingId) ?? null);
    if (uiState.selectedId === meetingId) dispatchUI({ type: 'SET_SELECTED_ID', id: null });
  }, [uiState.selectedId]);

  const handleRemoveDeferred = useCallback((id: string) => {
    setLocalDeferred((prev) => prev?.filter((d) => d.id !== id) ?? null);
  }, []);

  const handleSchedule = () => {
    const emp = employeesData.find(
      (e) => e.name.toLowerCase().includes(uiState.newMeetingEmployee.toLowerCase())
    );
    if (!emp || !uiState.newMeetingDate) return;

    const newMeeting: Meeting = {
      id: `new-${Date.now()}`,
      name: emp.name,
      role: emp.role,
      avatarColor: avatarColors[parseInt(emp.id) % avatarColors.length],
      date: uiState.newMeetingDate,
      duration: "30m",
      topicCount: 0,
      topics: [],
      notes: "",
      followUps: [],
      riskLevel: emp.churnRisk === "At risk" ? "high" : emp.churnRisk === "Medium" ? "medium" : undefined,
    };
    setLocalUpcoming((prev) => [...(prev ?? []), newMeeting]);
    dispatchUI({ type: 'SET_SHOW_NEW_DIALOG', show: false });
    dispatchUI({ type: 'SET_NEW_MEETING_EMPLOYEE', name: "" });
    dispatchUI({ type: 'SET_SELECTED_ID', id: newMeeting.id });
  };

  return (
    <AppShell>
      <div style={{ maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        <PageHeader
          title="1:1 Meeting Planner"
          subtitle="Plan, prepare, and track your 1:1 conversations"
          actions={
            <Button appearance="primary" icon={<Add20Regular />} onClick={() => dispatchUI({ type: 'SET_SHOW_NEW_DIALOG', show: true })}>
              Schedule 1:1
            </Button>
          }
        />

        {isLoading ? <PlannerSkeleton /> :
         meetError ? <ErrorState message="Failed to load meetings." onRetry={() => refetchMeet()} /> :
         <>
          <PlannerKPICards
            upcoming={upcoming.length}
            thisWeek={upcoming.filter((m) => {
              const d = new Date(m.date);
              const now = new Date();
              const weekEnd = new Date(now);
              weekEnd.setDate(now.getDate() + 7);
              return d >= now && d <= weekEnd;
            }).length}
            deferred={deferred.length}
            completed={past.length}
          />

          <WeekCalendarStrip meetings={upcoming} selectedDate={uiState.selectedDate} onDateSelect={(date) => dispatchUI({ type: 'SET_SELECTED_DATE', date })} />

          <div className={styles.body}>
            <MeetingList
              upcoming={upcoming}
              past={past}
              deferred={deferred}
              selectedId={effectiveSelectedId}
              onSelect={(id) => dispatchUI({ type: 'SET_SELECTED_ID', id })}
              onRemoveDeferred={handleRemoveDeferred}
            />
            <MeetingDetail
              meeting={selectedMeeting}
              onClose={() => dispatchUI({ type: 'SET_SELECTED_ID', id: null })}
              onToggleTopic={handleToggleTopic}
              onDeleteTopic={handleDeleteTopic}
              onAddTopic={handleAddTopic}
              onToggleFollowUp={handleToggleFollowUp}
              onAddFollowUp={handleAddFollowUp}
              onDeleteFollowUp={handleDeleteFollowUp}
              onUpdateNotes={handleUpdateNotes}
              onComplete={handleCompleteMeeting}
              onCancel={handleCancelMeeting}
            />
          </div>
         </>
        }
      </div>

      <Dialog open={uiState.showNewDialog} onOpenChange={(_, d) => { if (!d.open) dispatchUI({ type: 'SET_SHOW_NEW_DIALOG', show: false }); }}>
        <DialogSurface style={{ maxWidth: "440px", borderRadius: "12px" }}>
          <DialogBody>
            <DialogTitle
              action={<Button appearance="subtle" icon={<Dismiss20Regular />} onClick={() => dispatchUI({ type: 'SET_SHOW_NEW_DIALOG', show: false })} aria-label="Close" />}
            >
              Schedule 1:1
            </DialogTitle>
            <DialogContent style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "12px" }}>
              <div>
                <Text size={200} weight="semibold" style={{ display: "block", marginBottom: "6px" }}>Team Member</Text>
                <Input
                  placeholder="Search by name..."
                  value={uiState.newMeetingEmployee}
                  onChange={(_, d) => dispatchUI({ type: 'SET_NEW_MEETING_EMPLOYEE', name: d.value })}
                  style={{ width: "100%" }}
                />
                {uiState.newMeetingEmployee.length > 1 && (
                  <div style={{ border: "1px solid #e0e0e0", borderRadius: "6px", marginTop: "4px", maxHeight: "160px", overflow: "auto" }}>
                    {employeesData
                      .filter((e) => e.name.toLowerCase().includes(uiState.newMeetingEmployee.toLowerCase()))
                      .map((e) => (
                        <div
                          key={e.id}
                          role="button"
                          tabIndex={0}
                          style={{ padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                          onClick={() => dispatchUI({ type: 'SET_NEW_MEETING_EMPLOYEE', name: e.name })}
                          onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); dispatchUI({ type: 'SET_NEW_MEETING_EMPLOYEE', name: e.name }); } }}
                          onMouseEnter={(ev) => (ev.currentTarget.style.backgroundColor = "#f5f5f5")}
                          onMouseLeave={(ev) => (ev.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Avatar name={e.name} size={24} color="colorful" />
                          <div>
                            <Text size={300} weight="semibold">{e.name}</Text>
                            <Text size={200} style={{ color: "#888", display: "block" }}>{e.role}</Text>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div>
                <Text size={200} weight="semibold" style={{ display: "block", marginBottom: "6px" }}>Date</Text>
                <Input
                  type="date"
                  value={uiState.newMeetingDate}
                  onChange={(_, d) => dispatchUI({ type: 'SET_NEW_MEETING_DATE', date: d.value })}
                  style={{ width: "100%" }}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => dispatchUI({ type: 'SET_SHOW_NEW_DIALOG', show: false })}>Cancel</Button>
              <Button
                appearance="primary"
                disabled={!employeesData.some((e) => e.name.toLowerCase() === uiState.newMeetingEmployee.toLowerCase()) || !uiState.newMeetingDate}
                onClick={handleSchedule}
              >
                Schedule
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </AppShell>
  );
};

export default OneOnOnePlanner;
