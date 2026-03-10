import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Avatar,
  Button,
  Input,
  Textarea,
  Checkbox,
  Divider,
} from "@fluentui/react-components";
import {
  Dismiss20Regular,
  BrainCircuit20Regular,
  CheckmarkCircle20Filled,
  CheckmarkCircle20Regular,
  Heart16Filled,
  TargetArrow16Filled,
  ChartMultiple16Filled,
  Delete16Regular,
  Add16Regular,
  Person20Regular,
} from "@fluentui/react-icons";
import { format } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../hooks/useApiData";
import type { Meeting } from "@/types";

const useStyles = makeStyles({
  container: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "8px",
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    padding: "0px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  body: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: "14px",
    color: tokens.colorNeutralForeground1,
  },
  topicRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 0",
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
  },
  topicText: {
    flexGrow: 1,
    fontSize: "13px",
  },
  topicTextDone: {
    flexGrow: 1,
    fontSize: "13px",
    textDecoration: "line-through",
    color: tokens.colorNeutralForeground3,
  },
  statusBadge: {
    fontSize: "11px",
    padding: "2px 10px",
    borderRadius: "10px",
    fontWeight: 500,
  },
  addRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "4px",
  },
  followUpItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 0",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 24px",
    color: tokens.colorNeutralForeground3,
  },
});

const topicIcons: Record<string, React.ReactNode> = {
  heart: <Heart16Filled style={{ color: "#d13438" }} />,
  target: <TargetArrow16Filled style={{ color: "#0f6cbd" }} />,
  chart: <ChartMultiple16Filled style={{ color: "#107c41" }} />,
};

const statusStyles: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#f5f5f5", color: "#616161" },
  discussed: { bg: "#e1f5e8", color: "#107c41" },
  deferred: { bg: "#fff4ce", color: "#c4841d" },
};

interface MeetingDetailProps {
  meeting: Meeting | null;
  onClose: () => void;
  onToggleTopic: (meetingId: string, topicId: string) => void;
  onDeleteTopic: (meetingId: string, topicId: string) => void;
  onAddTopic: (meetingId: string, text: string) => void;
  onToggleFollowUp: (meetingId: string, followUpId: string) => void;
  onAddFollowUp: (meetingId: string, text: string) => void;
  onDeleteFollowUp: (meetingId: string, followUpId: string) => void;
  onUpdateNotes: (meetingId: string, notes: string) => void;
  onComplete: (meetingId: string) => void;
  onCancel: (meetingId: string) => void;
}

export const MeetingDetail: React.FC<MeetingDetailProps> = ({
  meeting,
  onClose,
  onToggleTopic,
  onDeleteTopic,
  onAddTopic,
  onToggleFollowUp,
  onAddFollowUp,
  onDeleteFollowUp,
  onUpdateNotes,
  onComplete,
  onCancel,
}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [newTopic, setNewTopic] = useState("");
  const [newFollowUp, setNewFollowUp] = useState("");
  const { data: employees = [] } = useEmployees("team1");

  if (!meeting) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Text size={400} style={{ color: tokens.colorNeutralForeground3 }}>
            Select a meeting to view details
          </Text>
        </div>
      </div>
    );
  }

  const formattedDate = format(new Date(meeting.date), "EEEE, MMM d, yyyy");
  const emp = employees.find((e) => e.name === meeting.name);

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    onAddTopic(meeting.id, newTopic.trim());
    setNewTopic("");
  };

  const handleAddFollowUp = () => {
    if (!newFollowUp.trim()) return;
    onAddFollowUp(meeting.id, newFollowUp.trim());
    setNewFollowUp("");
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Avatar name={meeting.name} size={40} color="colorful" style={{ backgroundColor: meeting.avatarColor, color: "#fff" }} />
          <div>
            <Text weight="semibold" size={400}>{meeting.name}</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
              {formattedDate} · {meeting.duration}
            </Text>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button
            appearance="subtle"
            icon={<BrainCircuit20Regular />}
            size="small"
          >
            AI Prep
          </Button>
          <Button
            appearance="primary"
            icon={<CheckmarkCircle20Filled />}
            size="small"
            onClick={() => onComplete(meeting.id)}
          >
            Complete
          </Button>
          <Button
            appearance="subtle"
            icon={<Dismiss20Regular />}
            size="small"
            onClick={() => onCancel(meeting.id)}
            title="Cancel meeting"
          />
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Topics & Agenda */}
        <div className={styles.section}>
          <Text className={styles.sectionTitle}>
            Topics & Agenda ({meeting.topics.length})
          </Text>
          {meeting.topics.map((topic) => {
            const st = statusStyles[topic.status];
            const isDone = topic.status === "discussed";
            return (
              <div key={topic.id} className={styles.topicRow}>
                <Checkbox
                  size="medium"
                  checked={isDone}
                  onChange={() => onToggleTopic(meeting.id, topic.id)}
                />
                {topicIcons[topic.icon]}
                <span className={isDone ? styles.topicTextDone : styles.topicText}>
                  {topic.text}
                </span>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: st.bg, color: st.color }}
                >
                  {topic.status}
                </span>
                <Button
                  appearance="subtle"
                  icon={<Delete16Regular />}
                  size="small"
                  style={{ minWidth: "auto", padding: "4px" }}
                  onClick={() => onDeleteTopic(meeting.id, topic.id)}
                />
              </div>
            );
          })}
          {meeting.topics.length === 0 && (
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>No topics added yet</Text>
          )}
          <div className={styles.addRow}>
            <Input
              placeholder="Add a topic..."
              size="small"
              value={newTopic}
              onChange={(_, d) => setNewTopic(d.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddTopic(); }}
              style={{ flexGrow: 1 }}
            />
            <Button
              appearance="subtle"
              icon={<Add16Regular />}
              size="small"
              onClick={handleAddTopic}
              disabled={!newTopic.trim()}
            />
          </div>
        </div>

        <Divider />

        {/* Meeting Notes */}
        <div className={styles.section}>
          <Text className={styles.sectionTitle}>Meeting Notes</Text>
          <Textarea
            placeholder="Capture notes during or after the meeting..."
            resize="vertical"
            value={meeting.notes}
            onChange={(_, d) => onUpdateNotes(meeting.id, d.value)}
            style={{ minHeight: "80px" }}
          />
        </div>

        <Divider />

        {/* Follow-up Actions */}
        <div className={styles.section}>
          <Text className={styles.sectionTitle}>
            Follow-up Actions ({meeting.followUps.length})
          </Text>
          {meeting.followUps.length > 0 ? (
            meeting.followUps.map((fu) => (
              <div key={fu.id} className={styles.followUpItem}>
                <Checkbox
                  checked={fu.done}
                  onChange={() => onToggleFollowUp(meeting.id, fu.id)}
                />
                {fu.done ? (
                  <CheckmarkCircle20Filled style={{ color: "#107c41" }} />
                ) : (
                  <CheckmarkCircle20Regular style={{ color: tokens.colorNeutralForeground3 }} />
                )}
                <Text
                  size={300}
                  style={fu.done ? { textDecoration: "line-through", color: tokens.colorNeutralForeground3 } : undefined}
                >
                  {fu.text}
                </Text>
                <Button
                  appearance="subtle"
                  icon={<Delete16Regular />}
                  size="small"
                  style={{ minWidth: "auto", padding: "4px", marginLeft: "auto" }}
                  onClick={() => onDeleteFollowUp(meeting.id, fu.id)}
                />
              </div>
            ))
          ) : (
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              No follow-up actions yet
            </Text>
          )}
          <div className={styles.addRow}>
            <Input
              placeholder="Add a follow-up action..."
              size="small"
              value={newFollowUp}
              onChange={(_, d) => setNewFollowUp(d.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddFollowUp(); }}
              style={{ flexGrow: 1 }}
            />
            <Button
              appearance="subtle"
              icon={<Add16Regular />}
              size="small"
              onClick={handleAddFollowUp}
              disabled={!newFollowUp.trim()}
            />
          </div>
        </div>

        <Divider />

        {/* View Profile */}
        <Button
          appearance="subtle"
          icon={<Person20Regular />}
          size="small"
          onClick={() => {
            if (emp) navigate(`/teams/1/members/${emp.id}`);
          }}
          disabled={!emp}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};
