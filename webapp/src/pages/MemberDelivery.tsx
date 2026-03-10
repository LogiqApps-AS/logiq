import { PageHeader } from "../components/PageHeader";
import { Text, Card, makeStyles, tokens } from "@fluentui/react-components";
import { Clock20Regular, BranchFork20Regular, TaskListSquareLtr20Regular, CalendarLtr20Regular } from "@fluentui/react-icons";
import { AppShell } from "../components/AppShell";
import { memberDeliveryStats, sprintContributions } from "../data/memberDashboardData";

const useStyles = makeStyles({
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px", "@media (max-width: 800px)": { gridTemplateColumns: "repeat(2, 1fr)" } },
  statCard: { padding: "24px 20px", textAlign: "center" },
  statValue: { fontSize: "32px", fontWeight: 700, lineHeight: "1", display: "block", marginBottom: "4px" },
  sprintCard: { padding: "24px" },
  sprintRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
});

const stats = [
  { icon: <Clock20Regular style={{ color: "#f7630c" }} />, value: `${memberDeliveryStats.hoursThisWeek}h`, label: "Hours This Week", color: "#f7630c" },
  { icon: <BranchFork20Regular style={{ color: "#5b5fc7" }} />, value: `${memberDeliveryStats.prsMerged}`, label: "PRs Merged", color: "#5b5fc7" },
  { icon: <TaskListSquareLtr20Regular style={{ color: "#107c41" }} />, value: `${memberDeliveryStats.tasksCompleted}`, label: "Tasks Completed", color: "#107c41" },
  { icon: <CalendarLtr20Regular style={{ color: "#d13438" }} />, value: `${memberDeliveryStats.meetingHours}h`, label: "Meetings", color: "#d13438" },
];

const MemberDelivery: React.FC = () => {
  const styles = useStyles();
  return (
    <AppShell>
      <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
        <PageHeader title="Your Delivery" subtitle="Contribution highlights and workload metrics" />
        <div className={styles.statsRow}>
          {stats.map((s) => (
            <Card key={s.label} className={styles.statCard}>
              <div style={{ marginBottom: "8px" }}>{s.icon}</div>
              <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{s.label}</Text>
            </Card>
          ))}
        </div>
        <Card className={styles.sprintCard}>
          <Text weight="bold" size={500} style={{ display: "block", marginBottom: "8px" }}>Sprint Contributions</Text>
          {sprintContributions.map((sprint, i) => (
            <div key={sprint.name} className={styles.sprintRow} style={i === sprintContributions.length - 1 ? { borderBottom: "none" } : undefined}>
              <Text weight="semibold" size={300}>{sprint.name}</Text>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{sprint.tasks} tasks</Text>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{sprint.points} pts</Text>
                <span style={{ fontSize: "12px", fontWeight: 600, color: sprint.status === "In Progress" ? "#5b5fc7" : "#107c41" }}>{sprint.status}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  );
};

export default MemberDelivery;
