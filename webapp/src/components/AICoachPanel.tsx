import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Input,
  Button,
  Badge,
  ProgressBar,
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
import { useState } from "react";
import { memberKPIs, devPlanGoals, memberSkills, weeklyStats } from "../data/memberDashboardData";

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
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
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
    marginTop: "10px",
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
    ":hover": {
      backgroundColor: "#e8f0fe",
      ...shorthands.borderColor("#0f6cbd"),
    },
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
  metricLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: tokens.colorNeutralForeground2,
  },
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
});

const suggestions = [
  "How can I reduce my overtime?",
  "What skills should I focus on?",
  "Help me prepare for my 1:1",
  "How is my wellbeing trending?",
];

function getScoreColor(score: number) {
  if (score >= 70) return "#107c10";
  if (score >= 50) return "#f7630c";
  return "#d13438";
}

function getRecommendations() {
  const recs: { icon: React.ReactNode; iconBg: string; iconColor: string; title: string; desc: string; priority: "high" | "medium" | "low" }[] = [];

  if (weeklyStats.hoursWorked > 45) {
    recs.push({
      icon: <Warning20Regular />,
      iconBg: "#fde7e9",
      iconColor: "#d13438",
      title: "Reduce Overtime",
      desc: `You've worked ${weeklyStats.hoursWorked}h this week. Consider discussing workload redistribution with your lead.`,
      priority: "high",
    });
  }

  if (memberKPIs.wellbeing.score < 50) {
    recs.push({
      icon: <HeartPulse20Regular />,
      iconBg: "#fde7e9",
      iconColor: "#d13438",
      title: "Wellbeing Needs Attention",
      desc: `Your wellbeing score is ${memberKPIs.wellbeing.score}/100. Take breaks, set boundaries, and consider reaching out for support.`,
      priority: "high",
    });
  }

  const weakestSkill = [...memberSkills].sort((a, b) => a.level - b.level)[0];
  if (weakestSkill && weakestSkill.level < 50) {
    recs.push({
      icon: <BookOpen20Regular />,
      iconBg: "#e8f0fe",
      iconColor: "#0f6cbd",
      title: `Invest in ${weakestSkill.name}`,
      desc: `Your ${weakestSkill.name} skill is at ${weakestSkill.level}%. Check your learning catalog for relevant courses.`,
      priority: "medium",
    });
  }

  const behindGoals = devPlanGoals.filter(g => g.status === "behind");
  if (behindGoals.length > 0) {
    recs.push({
      icon: <TargetArrow20Regular />,
      iconBg: "#fff4ce",
      iconColor: "#f7630c",
      title: `${behindGoals.length} Goal${behindGoals.length > 1 ? "s" : ""} Behind Schedule`,
      desc: `"${behindGoals[0].title}" needs attention. Break it into smaller milestones to get back on track.`,
      priority: "medium",
    });
  }

  if (weeklyStats.meetingHours > 15) {
    recs.push({
      icon: <Rocket20Regular />,
      iconBg: "#e6f7e6",
      iconColor: "#107c10",
      title: "Optimize Meeting Time",
      desc: `${weeklyStats.meetingHours}h in meetings this week. Consider declining optional meetings to reclaim focus time.`,
      priority: "low",
    });
  }

  return recs;
}

const priorityBadge: Record<string, { color: "danger" | "warning" | "informative"; label: string }> = {
  high: { color: "danger", label: "High" },
  medium: { color: "warning", label: "Medium" },
  low: { color: "informative", label: "Low" },
};

interface AICoachPanelProps {
  open: boolean;
  onClose: () => void;
}

export const AICoachPanel: React.FC<AICoachPanelProps> = ({ open, onClose }) => {
  const styles = useStyles();
  const [input, setInput] = useState("");

  if (!open) return null;

  const recommendations = getRecommendations();

  const metrics = [
    { icon: <HeartPulse20Regular />, label: "Wellbeing", score: memberKPIs.wellbeing.score, trend: memberKPIs.wellbeing.trend },
    { icon: <ArrowTrending20Regular />, label: "Motivation", score: memberKPIs.motivation.score, trend: memberKPIs.motivation.trend },
    { icon: <Rocket20Regular />, label: "Delivery", score: memberKPIs.delivery.score, trend: memberKPIs.delivery.trend },
    { icon: <TargetArrow20Regular />, label: "Skills", score: memberKPIs.skills.score, trend: memberKPIs.skills.trend },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <Lightbulb20Regular />
          </div>
          <div>
            <Text weight="semibold" size={400}>AI Coach</Text>
            <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
              Your personal development assistant
            </Text>
          </div>
        </div>
        <Button appearance="subtle" icon={<Dismiss20Regular />} onClick={onClose} />
      </div>

      <div className={styles.chatArea}>
        {/* Snapshot */}
        <div className={styles.sectionLabel}>Your Snapshot</div>
        <div className={styles.overviewCard}>
          {metrics.map((m) => (
            <div key={m.label} className={styles.metricRow}>
              <span className={styles.metricLabel}>
                {m.icon}
                {m.label}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "140px" }}>
                <ProgressBar
                  value={m.score / 100}
                  thickness="large"
                  style={{ flexGrow: 1 }}
                  color={m.score >= 70 ? "success" : m.score >= 50 ? "warning" : "error"}
                />
                <Text size={200} weight="semibold" style={{ color: getScoreColor(m.score), minWidth: "28px", textAlign: "right" }}>
                  {m.score}
                </Text>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className={styles.sectionLabel}>Recommendations</div>
        {recommendations.map((rec, i) => (
          <div key={rec.title} className={styles.recCard}>
            <div className={styles.recIcon} style={{ backgroundColor: rec.iconBg, color: rec.iconColor }}>
              {rec.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Text size={300} weight="semibold">{rec.title}</Text>
                <Badge size="small" appearance="filled" color={priorityBadge[rec.priority].color}>
                  {priorityBadge[rec.priority].label}
                </Badge>
              </div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, lineHeight: "1.5" }}>
                {rec.desc}
              </Text>
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className={styles.sectionLabel}>Ask your coach</div>
        <div className={styles.suggestionGrid}>
          {suggestions.map((s) => (
            <button key={s} className={styles.suggestionCard} onClick={() => setInput(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.inputBar}>
        <Input
          placeholder="Ask your AI Coach..."
          value={input}
          onChange={(_, d) => setInput(d.value)}
          style={{ flexGrow: 1 }}
          size="small"
        />
        <Button appearance="primary" icon={<Send20Regular />} size="small" />
      </div>
    </div>
  );
};
