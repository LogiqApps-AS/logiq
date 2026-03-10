import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Avatar,
  Button,
  Tab,
  TabList,
} from "@fluentui/react-components";
import {
  CalendarLtr16Regular,
  Clock16Regular,
  Chat16Regular,
  ChevronRight16Regular,
  Warning16Filled,
  Dismiss16Regular,
} from "@fluentui/react-icons";
import { useState } from "react";
import { format } from "date-fns";
import type { Meeting } from "@/types";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "0px",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    borderRadius: "8px",
    cursor: "pointer",
    transition: "box-shadow 0.15s ease, border-color 0.15s ease",
    marginBottom: "8px",
    ":hover": {
      ...shorthands.borderColor(tokens.colorNeutralStroke1),
      boxShadow: tokens.shadow4,
    },
  },
  cardSelected: {
    ...shorthands.borderColor("#5b5fc7"),
    boxShadow: "0 0 0 2px #5b5fc720",
    backgroundColor: "#faf9ff",
  },
  cardBody: {
    flexGrow: 1,
    minWidth: "0px",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "4px",
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    color: tokens.colorNeutralForeground3,
    fontSize: "12px",
  },
  riskBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#d13438",
    backgroundColor: "#fde7e9",
    padding: "2px 8px",
    borderRadius: "10px",
    marginTop: "6px",
  },
  mediumRiskBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#f7630c",
    backgroundColor: "#fff4ce",
    padding: "2px 8px",
    borderRadius: "10px",
    marginTop: "6px",
  },
  deferredSection: {
    marginTop: "16px",
    padding: "14px 16px",
    backgroundColor: "#fffdf5",
    borderRadius: "8px",
    ...shorthands.border("1px", "solid", "#f5deb3"),
  },
  deferredTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "8px",
  },
  deferredItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "6px",
    marginTop: "4px",
  },
});

interface MeetingListProps {
  upcoming: Meeting[];
  past: Meeting[];
  deferred: { id: string; text: string; person: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemoveDeferred?: (id: string) => void;
}

export const MeetingList: React.FC<MeetingListProps> = ({
  upcoming,
  past,
  deferred,
  selectedId,
  onSelect,
  onRemoveDeferred,
}) => {
  const styles = useStyles();
  const [tab, setTab] = useState<string>("upcoming");

  const meetings = tab === "upcoming" ? upcoming : past;

  return (
    <div className={styles.container}>
      <TabList
        selectedValue={tab}
        onTabSelect={(_, d) => setTab(d.value as string)}
        style={{ marginBottom: "12px" }}
      >
        <Tab value="upcoming">Upcoming ({upcoming.length})</Tab>
        <Tab value="past">Past ({past.length})</Tab>
      </TabList>

      {meetings.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 16px", color: tokens.colorNeutralForeground3 }}>
          <Text size={300}>No {tab} meetings</Text>
        </div>
      )}

      {meetings.map((m) => (
        <div
          key={m.id}
          role="button"
          tabIndex={0}
          className={`${styles.card} ${selectedId === m.id ? styles.cardSelected : ""}`}
          onClick={() => onSelect(m.id)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(m.id); } }}
        >
          <Avatar name={m.name} size={36} color="colorful" style={{ backgroundColor: m.avatarColor, color: "#fff" }} />
          <div className={styles.cardBody}>
            <Text weight="semibold" size={300}>{m.name}</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
              {m.role}
            </Text>
            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <CalendarLtr16Regular /> {format(new Date(m.date), "MMM d")}
              </span>
              <span className={styles.metaItem}>
                <Clock16Regular /> {m.duration}
              </span>
              <span className={styles.metaItem}>
                <Chat16Regular /> {m.topics.length} topics
              </span>
            </div>
            {m.riskLevel === "high" && (
              <div className={styles.riskBadge}>
                <Warning16Filled /> High risk
              </div>
            )}
            {m.riskLevel === "medium" && (
              <div className={styles.mediumRiskBadge}>
                <Warning16Filled /> Medium risk
              </div>
            )}
          </div>
          <ChevronRight16Regular style={{ color: tokens.colorNeutralForeground3, flexShrink: 0 }} />
        </div>
      ))}

      {tab === "upcoming" && deferred.length > 0 && (
        <div className={styles.deferredSection}>
          <div className={styles.deferredTitle}>
            <span style={{ display: "inline-flex", alignItems: "center", fontSize: "11px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", backgroundColor: "#fff4ce", color: "#c4841d" }}>⚠</span>
            <Text weight="semibold" size={300} style={{ color: "#c4841d" }}>
              Deferred Topics ({deferred.length})
            </Text>
          </div>
          {deferred.map((dt) => (
            <div key={dt.id} className={styles.deferredItem}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <span style={{ color: "#c4841d", fontSize: "12px" }}>●</span>
                <div>
                  <Text size={200} weight="semibold">{dt.text}</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
                    {dt.person}
                  </Text>
                </div>
              </div>
              {onRemoveDeferred && (
                <Button
                  appearance="subtle"
                  icon={<Dismiss16Regular />}
                  size="small"
                  style={{ minWidth: "auto", padding: "2px" }}
                  onClick={() => onRemoveDeferred(dt.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
