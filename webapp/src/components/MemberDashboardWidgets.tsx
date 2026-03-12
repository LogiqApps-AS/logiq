import {
  Text,
  Card,
  Button,
  makeStyles,
  tokens,
  ProgressBar,
} from "@fluentui/react-components";
import {
  Sparkle20Filled,
  Warning20Regular,
  Checkmark20Regular,
  Info20Regular,
  Clock20Regular,
} from "@fluentui/react-icons";
import { PageHeader } from "./PageHeader";
import { useNavigate } from "react-router-dom";
import LearningCardList from "./LearningCardList";
import { useAICoach } from "../contexts/AICoachContext";
import { useMemberDashboard, useMemberSignals } from "../hooks/useApiData";

const DEFAULT_MEMBER_ID = "1";

const useStyles = makeStyles({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  aiCoachBtn: {
    backgroundColor: "#5b5fc7",
    color: "#fff",
    borderRadius: "20px",
    fontWeight: 600,
    ":hover": { backgroundColor: "#4f52b5" },
  },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "28px",
    "@media (max-width: 900px)": { gridTemplateColumns: "repeat(2, 1fr)" },
    "@media (max-width: 500px)": { gridTemplateColumns: "1fr" },
  },
  kpiCard: { padding: "16px 20px", position: "relative", overflow: "hidden" },
  kpiLabel: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  kpiScore: { fontSize: "36px", fontWeight: 700, lineHeight: "1" },
  kpiTrend: { display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, marginLeft: "8px" },
  statusBadge: { fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  signalCard: { padding: "16px", marginBottom: "12px" },
  signalIcon: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  signalRow: { display: "flex", gap: "12px", alignItems: "flex-start" },
  unreadDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#0f6cbd", display: "inline-block", marginLeft: "6px", verticalAlign: "middle" },
  goalCard: { padding: "16px", marginBottom: "12px" },
  goalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  learningCard: { padding: "12px 16px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap" as const, gap: "8px" },
  learningLeft: { display: "flex", alignItems: "center", gap: "12px" },
  learningIcon: { width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f6ff", color: "#5b5fc7" },
  weekCard: { padding: "16px", marginTop: "16px" },
  weekGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", textAlign: "center" },
  weekValue: { fontSize: "28px", fontWeight: 700, lineHeight: "1.2" },
});

const signalIcons: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  warning: { bg: "#fff4ce", color: "#f7630c", icon: <Warning20Regular /> },
  opportunity: { bg: "#dff6dd", color: "#107c41", icon: <Checkmark20Regular /> },
  recognition: { bg: "#dff6dd", color: "#107c41", icon: <Checkmark20Regular /> },
  wellbeing: { bg: "#e0f2fe", color: "#0f6cbd", icon: <Info20Regular /> },
  milestone: { bg: "#dff6dd", color: "#107c41", icon: <Checkmark20Regular /> },
};

const statusColors: Record<string, { bg: string; color: string }> = {
  "on-track": { bg: "#dff6dd", color: "#107c41" },
  behind: { bg: "#fde7e9", color: "#d13438" },
  completed: { bg: "#e8ebf9", color: "#5b5fc7" },
};

const kpiColors: Record<string, { score: string; badge: string; badgeBg: string; border: string }> = {
  red: { score: "#d13438", badge: "#d13438", badgeBg: "#fde7e9", border: "#fde7e9" },
  yellow: { score: "#f7630c", badge: "#f7630c", badgeBg: "#fff4ce", border: "#fff4ce" },
  green: { score: "#107c41", badge: "#107c41", badgeBg: "#dff6dd", border: "#dff6dd" },
};

const priorityColors: Record<string, { color: string; bg: string }> = {
  HIGH: { color: "#d13438", bg: "#fde7e9" },
  MEDIUM: { color: "#f7630c", bg: "#fff4ce" },
  LOW: { color: "#107c41", bg: "#dff6dd" },
};

const MemberDashboardWidgets: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { openAICoach } = useAICoach();
  const { data: dashboard, isLoading: dashboardLoading, isError: dashboardError } = useMemberDashboard(DEFAULT_MEMBER_ID);
  const { data: signals = [] } = useMemberSignals(DEFAULT_MEMBER_ID);

  const kpis = dashboard?.kpis
    ? [
        { label: "Well-being", score: dashboard.kpis.wellbeing?.score ?? 0, status: dashboard.kpis.wellbeing?.status ?? "green" },
        { label: "Skills", score: dashboard.kpis.skills?.score ?? 0, status: dashboard.kpis.skills?.status ?? "green" },
        { label: "Motivation", score: dashboard.kpis.motivation?.score ?? 0, status: dashboard.kpis.motivation?.status ?? "green" },
        { label: "Delivery", score: dashboard.kpis.delivery?.score ?? 0, status: dashboard.kpis.delivery?.status ?? "green" },
      ]
    : [];

  if (dashboardLoading) {
    return (
      <>
        <PageHeader title="Your Dashboard" subtitle="Personal intelligence and growth insights" />
        <Text>Loading...</Text>
      </>
    );
  }
  if (dashboardError || !dashboard) {
    return (
      <>
        <PageHeader title="Your Dashboard" subtitle="Personal intelligence and growth insights" />
        <Text>Unable to load dashboard.</Text>
      </>
    );
  }

  const devGoals = dashboard.devGoals ?? [];
  const learningItems = dashboard.learningItems ?? [];
  const deliveryStats = dashboard.deliveryStats;
  const sprintContributions = dashboard.sprintContributions ?? [];
  const memberSignalsList = signals.length > 0 ? signals : (dashboard.signals ?? []);

  return (
    <>
      <PageHeader
        title="Your Dashboard"
        subtitle="Personal intelligence and growth insights"
        actions={
          <Button className={styles.aiCoachBtn} icon={<Sparkle20Filled />} appearance="primary" onClick={openAICoach}>
            AI Coach
          </Button>
        }
      />

      <div className={styles.kpiRow}>
        {kpis.map((kpi) => {
          const c = kpiColors[kpi.status] ?? kpiColors.green;
          return (
            <Card key={kpi.label} className={styles.kpiCard} style={{ borderLeft: `4px solid ${c.border}` }}>
              <div className={styles.kpiLabel}>
                <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>{kpi.label}</Text>
                <span className={styles.statusBadge} style={{ backgroundColor: c.badgeBg, color: c.badge }}>
                  {(kpi.status ?? "green").toUpperCase()}
                </span>
              </div>
              <div>
                <span className={styles.kpiScore} style={{ color: c.score }}>{kpi.score}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className={styles.twoCol}>
        <div>
          <div className={styles.sectionHeader}>
            <Text size={500} weight="bold">Your Signals</Text>
            <Button appearance="transparent" size="small" style={{ color: "#5b5fc7" }} onClick={() => navigate("/signals")}>View All</Button>
          </div>
          {memberSignalsList.map((signal) => {
            const si = signalIcons[signal.type ?? "wellbeing"] ?? signalIcons.wellbeing;
            return (
              <Card key={signal.id} className={styles.signalCard}>
                <div className={styles.signalRow}>
                  <span className={styles.signalIcon} style={{ backgroundColor: si.bg, color: si.color }}>{si.icon}</span>
                  <div style={{ flex: 1 }}>
                    <Text weight="semibold" size={300}>
                      {signal.title}
                      {signal.unread && <span className={styles.unreadDot} />}
                    </Text>
                    <Text size={200} style={{ display: "block", color: tokens.colorNeutralForeground3, marginTop: "4px", lineHeight: "1.5" }}>{signal.description}</Text>
                    <Text size={100} style={{ display: "block", color: tokens.colorNeutralForeground3, marginTop: "6px" }}>{signal.time}</Text>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div>
          <div className={styles.sectionHeader}>
            <Text size={500} weight="bold">Development Plan</Text>
            <Button appearance="transparent" size="small" style={{ color: "#5b5fc7" }} onClick={() => navigate("/devplan")}>View Full IDP</Button>
          </div>
          {devGoals.map((goal) => {
            const sc = statusColors[goal.status ?? "on-track"] ?? statusColors["on-track"];
            return (
              <Card key={goal.id} className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <Text weight="semibold" size={300}>{goal.title}</Text>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", backgroundColor: sc.bg, color: sc.color }}>{goal.status ?? "on-track"}</span>
                </div>
                <ProgressBar value={(goal.progress ?? 0) / 100} thickness="large" color="brand" style={{ marginBottom: "6px" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{goal.category}</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{goal.progress ?? 0}%</Text>
                </div>
              </Card>
            );
          })}

          <div className={styles.sectionHeader} style={{ marginTop: "20px" }}>
            <Text size={500} weight="bold">Recommended Learning</Text>
            <Button appearance="transparent" size="small" style={{ color: "#5b5fc7" }}>View All</Button>
          </div>
          <LearningCardList items={learningItems} />

          <Card className={styles.weekCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <Clock20Regular style={{ color: tokens.colorNeutralForeground3 }} />
              <Text weight="semibold" size={300}>This Week</Text>
            </div>
            <div className={styles.weekGrid}>
              <div>
                <div className={styles.weekValue} style={{ color: "#f7630c" }}>{(deliveryStats?.hoursThisWeek ?? 0)}h</div>
                <Text size={100} style={{ color: tokens.colorNeutralForeground3, textTransform: "uppercase", letterSpacing: "0.5px" }}>HOURS WORKED</Text>
              </div>
              <div>
                <div className={styles.weekValue} style={{ color: "#5b5fc7" }}>{deliveryStats?.meetingHours ?? 0}h</div>
                <Text size={100} style={{ color: tokens.colorNeutralForeground3, textTransform: "uppercase", letterSpacing: "0.5px" }}>IN MEETINGS</Text>
              </div>
              <div>
                <div className={styles.weekValue} style={{ color: "#107c41" }}>{deliveryStats?.prsMerged ?? 0}</div>
                <Text size={100} style={{ color: tokens.colorNeutralForeground3, textTransform: "uppercase", letterSpacing: "0.5px" }}>PRS MERGED</Text>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <div className={styles.sectionHeader}>
          <Text size={500} weight="bold">Delivery Overview</Text>
        </div>
        <div className={styles.kpiRow}>
          {[
            { label: "Hours This Week", value: `${deliveryStats?.hoursThisWeek ?? 0}h`, color: "#f7630c" },
            { label: "PRs Merged", value: String(deliveryStats?.prsMerged ?? 0), color: "#5b5fc7" },
            { label: "Tasks Completed", value: String(deliveryStats?.tasksCompleted ?? 0), color: "#107c41" },
            { label: "Meeting Hours", value: `${deliveryStats?.meetingHours ?? 0}h`, color: "#d13438" },
          ].map((stat) => (
            <Card key={stat.label} style={{ padding: "16px 20px", textAlign: "center" }}>
              <div className={styles.kpiScore} style={{ color: stat.color, fontSize: "28px" }}>{stat.value}</div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</Text>
            </Card>
          ))}
        </div>
        <Card style={{ padding: "16px" }}>
          <Text weight="semibold" size={300} style={{ display: "block", marginBottom: "12px" }}>Sprint Contributions</Text>
          {sprintContributions.map((sprint) => (
            <div key={sprint.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
              <Text size={300}>{sprint.name}</Text>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{sprint.tasks} tasks</Text>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{sprint.points} pts</Text>
                <span style={{ fontSize: "11px", fontWeight: 600, color: sprint.status === "Completed" ? "#107c41" : "#f7630c" }}>{sprint.status}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
};

export default MemberDashboardWidgets;
