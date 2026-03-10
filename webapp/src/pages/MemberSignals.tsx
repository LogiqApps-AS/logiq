import { PageHeader } from "../components/PageHeader";
import {
  Text,
  Card,
  makeStyles,
  tokens,
  Spinner,
} from "@fluentui/react-components";
import {
  Warning20Regular,
  Checkmark20Regular,
  Info20Regular,
} from "@fluentui/react-icons";
import { useState } from "react";
import { PageContainer } from "../components/PageContainer";
import { useMemberSignals } from "../hooks/useApiData";

const useStyles = makeStyles({
  signalCard: { padding: "20px", marginBottom: "12px", borderLeft: "3px solid transparent" },
  signalRow: { display: "flex", gap: "14px", alignItems: "flex-start" },
  signalIcon: { width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  unreadDot: { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#0f6cbd", display: "inline-block", marginLeft: "6px", verticalAlign: "middle" },
  filterRow: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  chip: { padding: "5px 14px", borderRadius: "16px", border: "1px solid #e0e0e0", backgroundColor: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" },
  chipActive: { backgroundColor: "#e8ebf9", border: "1px solid #5b5fc7", color: "#5b5fc7", fontWeight: 600 },
});

const signalIcons: Record<string, { bg: string; color: string; border: string; icon: React.ReactNode }> = {
  warning: { bg: "#fff4ce", color: "#f7630c", border: "#f7630c", icon: <Warning20Regular /> },
  opportunity: { bg: "#dff6dd", color: "#107c41", border: "#107c41", icon: <Checkmark20Regular /> },
  recognition: { bg: "#dff6dd", color: "#107c41", border: "#107c41", icon: <Checkmark20Regular /> },
  wellbeing: { bg: "#e0f2fe", color: "#0f6cbd", border: "#0f6cbd", icon: <Info20Regular /> },
  milestone: { bg: "#dff6dd", color: "#107c41", border: "#107c41", icon: <Checkmark20Regular /> },
};

const filters = ["All", "Warning", "Opportunity", "Recognition", "Wellbeing", "Milestone"];

const MemberSignals: React.FC = () => {
  const styles = useStyles();
  const [filter, setFilter] = useState("All");
  const { data: memberSignals = [], isLoading } = useMemberSignals("1");

  const filtered = filter === "All" ? memberSignals : memberSignals.filter((s) => s.type === filter.toLowerCase());
  const unreadCount = memberSignals.filter((s) => s.unread).length;

  if (isLoading) {
    return (
      <PageContainer>
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Spinner label="Loading signals..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="800px">
        <PageHeader title="Your Signals" subtitle={`${unreadCount} unread signal${unreadCount !== 1 ? "s" : ""} · Personalized insights and alerts`} />
        <div className={styles.filterRow}>
          {filters.map((f) => (
            <button key={f} className={`${styles.chip} ${filter === f ? styles.chipActive : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        {filtered.map((signal) => {
          const si = signalIcons[signal.type] ?? signalIcons.wellbeing;
          return (
            <Card key={signal.id} className={styles.signalCard} style={{ borderLeftColor: si.border }}>
              <div className={styles.signalRow}>
                <span className={styles.signalIcon} style={{ backgroundColor: si.bg, color: si.color }}>{si.icon}</span>
                <div style={{ flex: 1 }}>
                  <Text weight="semibold" size={400}>{signal.title}{signal.unread && <span className={styles.unreadDot} />}</Text>
                  <Text size={300} style={{ display: "block", color: tokens.colorNeutralForeground2, marginTop: "6px", lineHeight: "1.6" }}>{signal.description}</Text>
                  <Text size={200} style={{ display: "block", color: tokens.colorNeutralForeground3, marginTop: "8px" }}>{signal.time}</Text>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: tokens.colorNeutralForeground3 }}>
            <Text size={300}>No signals in this category</Text>
          </div>
        )}
    </PageContainer>
  );
};

export default MemberSignals;
