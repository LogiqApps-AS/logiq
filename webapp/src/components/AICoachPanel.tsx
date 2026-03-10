import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Input,
  Button,
  Badge,
  ProgressBar,
  Spinner,
  Avatar,
} from "@fluentui/react-components";
import {
  Dismiss20Regular,
  Send20Regular,
  HeartPulse20Regular,
  Rocket20Regular,
  TargetArrow20Regular,
  Warning20Regular,
  Lightbulb20Regular,
  BookOpen20Regular,
  ArrowTrending20Regular,
} from "@fluentui/react-icons";
import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api";
import type { ChatSuggestion } from "@/lib/api";
import { useMemberDashboard } from "@/hooks/useApiData";

const useStyles = makeStyles({
  panel: {
    width: "380px",
    minWidth: "380px",
    height: "100%",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderLeft("1px", "solid", tokens.colorNeutralStroke2),
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    "@media (max-width: 768px)": {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      width: "100%",
      minWidth: "unset",
      zIndex: 1000,
      boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
      ...shorthands.borderLeft("0px", "solid", "transparent"),
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
    flexShrink: 0,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  iconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    backgroundColor: "#107c10",
  },
  chatArea: {
    flexGrow: 1,
    overflowY: "auto",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  suggestionGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  suggestionCard: {
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground1,
    fontSize: "12px",
    textAlign: "left",
    transition: "background-color 0.15s",
    ":hover": { backgroundColor: "#e8f0fe", ...shorthands.borderColor("#0f6cbd") },
  },
  inputBar: {
    display: "flex",
    gap: "8px",
    padding: "12px 20px",
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke2),
    flexShrink: 0,
  },
  overviewCard: {
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    borderRadius: "10px",
    padding: "14px 16px",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  metricRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 0",
  },
  metricLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: tokens.colorNeutralForeground2 },
  recCard: {
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    borderRadius: "10px",
    padding: "12px 14px",
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
  recIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: tokens.colorNeutralForeground3,
    marginBottom: "8px",
    marginTop: "4px",
  },
  messageBubble: {
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    borderRadius: "12px",
    backgroundColor: tokens.colorNeutralBackground1,
    padding: "12px 16px",
    maxWidth: "90%",
    lineHeight: "1.5",
    fontSize: "13px",
    whiteSpace: "pre-wrap",
  },
  messageBubbleUser: {
    borderRadius: "12px",
    backgroundColor: "#107c10",
    color: "#fff",
    padding: "10px 14px",
    maxWidth: "80%",
    lineHeight: "1.5",
    fontSize: "13px",
  },
  messageBot: { display: "flex", gap: "10px", alignItems: "flex-start" },
  messageUser: { display: "flex", gap: "10px", alignItems: "flex-start", justifyContent: "flex-end" },
});

const defaultSuggestions: ChatSuggestion[] = [
  { text: "How can I reduce my overtime?" },
  { text: "What skills should I focus on?" },
  { text: "Help me prepare for my 1:1" },
  { text: "How is my wellbeing trending?" },
];

const priorityBadge: Record<string, { color: "danger" | "warning" | "informative"; label: string }> = {
  high: { color: "danger", label: "High" },
  medium: { color: "warning", label: "Medium" },
  low: { color: "informative", label: "Low" },
};

function getScoreColor(score: number) {
  if (score >= 70) return "#107c10";
  if (score >= 50) return "#f7630c";
  return "#d13438";
}

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
}

interface AICoachPanelProps {
  open: boolean;
  onClose: () => void;
  memberId?: string;
  teamId?: string;
}

export const AICoachPanel: React.FC<AICoachPanelProps> = ({ open, onClose, memberId = "1", teamId = "team1" }) => {
  const styles = useStyles();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>(defaultSuggestions);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: dashboard } = useMemberDashboard(memberId, teamId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!open) return null;

  const kpis = dashboard?.kpis;
  const metrics = kpis
    ? [
        { icon: <HeartPulse20Regular />, label: "Wellbeing", score: kpis.wellbeing.score },
        { icon: <ArrowTrending20Regular />, label: "Motivation", score: kpis.motivation.score },
        { icon: <Rocket20Regular />, label: "Delivery", score: kpis.delivery.score },
        { icon: <TargetArrow20Regular />, label: "Skills", score: kpis.skills.score },
      ]
    : [];

  const recommendations: { icon: React.ReactNode; iconBg: string; iconColor: string; title: string; desc: string; priority: "high" | "medium" | "low" }[] = [];

  if (dashboard?.deliveryStats.hoursThisWeek && dashboard.deliveryStats.hoursThisWeek > 45) {
    recommendations.push({ icon: <Warning20Regular />, iconBg: "#fde7e9", iconColor: "#d13438", title: "Reduce Overtime", desc: `You've worked ${dashboard.deliveryStats.hoursThisWeek}h this week. Discuss workload redistribution with your lead.`, priority: "high" });
  }
  if (kpis && kpis.wellbeing.score < 50) {
    recommendations.push({ icon: <HeartPulse20Regular />, iconBg: "#fde7e9", iconColor: "#d13438", title: "Wellbeing Needs Attention", desc: `Your wellbeing score is ${kpis.wellbeing.score}/100. Take breaks and set boundaries.`, priority: "high" });
  }
  const weakestSkill = dashboard?.skills.slice().sort((a, b) => a.level - b.level)[0];
  if (weakestSkill && weakestSkill.level < 50) {
    recommendations.push({ icon: <BookOpen20Regular />, iconBg: "#e8f0fe", iconColor: "#0f6cbd", title: `Invest in ${weakestSkill.name}`, desc: `Your ${weakestSkill.name} skill is at ${weakestSkill.level}%. Check your learning catalog.`, priority: "medium" });
  }
  const behindGoals = dashboard?.devGoals.filter((g) => g.status === "behind") ?? [];
  if (behindGoals.length > 0) {
    recommendations.push({ icon: <TargetArrow20Regular />, iconBg: "#fff4ce", iconColor: "#f7630c", title: `${behindGoals.length} Goal${behindGoals.length > 1 ? "s" : ""} Behind Schedule`, desc: `"${behindGoals[0].title}" needs attention.`, priority: "medium" });
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text }]);
    setLoading(true);
    try {
      const response = await apiClient.coachChat({ message: text, memberId, teamId, conversationId });
      setConversationId(response.conversationId);
      setMessages((prev) => [...prev, { id: response.conversationId + Date.now(), role: "bot", text: response.reply }]);
      if (response.suggestions.length > 0) setSuggestions(response.suggestions);
    } catch {
      setMessages((prev) => [...prev, { id: "err-" + Date.now(), role: "bot", text: "Sorry, I couldn't reach your AI Coach. Please check the backend connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}><Lightbulb20Regular /></div>
          <div>
            <Text weight="semibold" size={400}>AI Coach</Text>
            <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>Your personal development assistant</Text>
          </div>
        </div>
        <Button appearance="subtle" icon={<Dismiss20Regular />} onClick={onClose} />
      </div>

      <div className={styles.chatArea}>
        {messages.length === 0 && (
          <>
            {metrics.length > 0 && (
              <>
                <div className={styles.sectionLabel}>Your Snapshot</div>
                <div className={styles.overviewCard}>
                  {metrics.map((m) => (
                    <div key={m.label} className={styles.metricRow}>
                      <span className={styles.metricLabel}>{m.icon}{m.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "140px" }}>
                        <ProgressBar value={m.score / 100} thickness="large" style={{ flexGrow: 1 }} color={m.score >= 70 ? "success" : m.score >= 50 ? "warning" : "error"} />
                        <Text size={200} weight="semibold" style={{ color: getScoreColor(m.score), minWidth: "28px", textAlign: "right" }}>{m.score}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {recommendations.length > 0 && (
              <>
                <div className={styles.sectionLabel}>Recommendations</div>
                {recommendations.map((rec) => (
                  <div key={rec.title} className={styles.recCard}>
                    <div className={styles.recIcon} style={{ backgroundColor: rec.iconBg, color: rec.iconColor }}>{rec.icon}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Text size={300} weight="semibold">{rec.title}</Text>
                        <Badge size="small" appearance="filled" color={priorityBadge[rec.priority].color}>{priorityBadge[rec.priority].label}</Badge>
                      </div>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3, lineHeight: "1.5" }}>{rec.desc}</Text>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className={styles.sectionLabel}>Ask your coach</div>
            <div className={styles.suggestionGrid}>
              {suggestions.map((s) => (
                <button key={s.text} className={styles.suggestionCard} onClick={() => sendMessage(s.text)}>{s.text}</button>
              ))}
            </div>
          </>
        )}

        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className={styles.messageUser}>
              <div className={styles.messageBubbleUser}>{msg.text}</div>
            </div>
          ) : (
            <div key={msg.id} className={styles.messageBot}>
              <Avatar name="C" size={28} style={{ backgroundColor: "#107c10", color: "#fff" }} />
              <div className={styles.messageBubble}>{msg.text}</div>
            </div>
          )
        )}

        {loading && (
          <div className={styles.messageBot}>
            <Avatar name="C" size={28} style={{ backgroundColor: "#107c10", color: "#fff" }} />
            <div className={styles.messageBubble}><Spinner size="extra-tiny" label="Thinking..." /></div>
          </div>
        )}

        {messages.length > 0 && !loading && (
          <div className={styles.suggestionGrid}>
            {suggestions.slice(0, 2).map((s) => (
              <button key={s.text} className={styles.suggestionCard} onClick={() => sendMessage(s.text)}>{s.text}</button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className={styles.inputBar}>
        <Input
          placeholder="Ask your AI Coach..."
          value={input}
          onChange={(_, d) => setInput(d.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          style={{ flexGrow: 1 }}
          size="small"
        />
        <Button appearance="primary" icon={<Send20Regular />} size="small" onClick={() => sendMessage(input)} disabled={loading} />
      </div>
    </div>
  );
};
