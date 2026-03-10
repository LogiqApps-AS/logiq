import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Card,
  Button,
  mergeClasses,
} from "@fluentui/react-components";
import {
  Sparkle20Filled,
  ArrowRight16Regular,
  Warning16Filled,
  Lightbulb16Filled,
  HeartPulse20Filled,
  People16Filled,
  ArrowTrendingDown16Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  container: {
    marginBottom: "24px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  copilotIcon: {
    color: "#5b5fc7",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "4px",
    backgroundColor: "#e8ebf9",
    color: "#5b5fc7",
  },
  insightsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  insightCard: {
    paddingTop: "14px",
    paddingBottom: "14px",
    paddingLeft: "16px",
    paddingRight: "16px",
  },
  insightHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  insightNumber: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#e8ebf9",
    color: "#5b5fc7",
    fontSize: "11px",
    fontWeight: 700,
    flexShrink: 0,
  },
  actionsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "10px",
  },
  actionBox: {
    padding: "10px 12px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "flex-start",
    gap: "6px",
  },
  immediateBox: {
    backgroundColor: "#fef0f1",
  },
  longTermBox: {
    backgroundColor: "#e8ebf9",
  },
  actionLabel: {
    fontSize: "10px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "2px",
    display: "block",
  },
  severityHigh: {
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    borderLeftColor: "#d13438",
  },
  severityMedium: {
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    borderLeftColor: "#f7630c",
  },
  severityLow: {
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    borderLeftColor: "#0078d4",
  },
});

interface Insight {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  immediateAction: string;
  longTermAction: string;
}

const insights: Insight[] = [
  {
    id: 1,
    icon: <HeartPulse20Filled style={{ color: "#d13438", fontSize: "16px" }} />,
    title: "Burnout risk detected for 2 team members",
    description: "Alex Chen and David Kim show elevated sick leave, overtime, and declining engagement — classic burnout precursors.",
    severity: "high",
    immediateAction: "Schedule a 1:1 this week to discuss workload and wellbeing. Temporarily reassign 2 sprint items.",
    longTermAction: "Implement workload caps and quarterly wellbeing check-ins. Consider hiring to reduce sustained pressure.",
  },
  {
    id: 2,
    icon: <ArrowTrendingDown16Regular style={{ color: "#f7630c" }} />,
    title: "Team psychological safety score dropped 12%",
    description: "Two consecutive pulse surveys show declining trust scores. Correlated with increased meeting load and reduced feedback frequency.",
    severity: "high",
    immediateAction: "Run a team retro focused on communication and safety. Introduce anonymous feedback channel.",
    longTermAction: "Train managers on psychological safety practices. Establish regular skip-level meetings.",
  },
  {
    id: 3,
    icon: <People16Filled style={{ color: "#f7630c" }} />,
    title: "Skill gaps widening in 3 critical areas",
    description: "Cloud architecture, security testing, and data pipeline skills are below team coverage thresholds. Kevin Dahl and Emma Nilsen need targeted development.",
    severity: "medium",
    immediateAction: "Pair Kevin and Emma with senior mentors. Allocate 4h/week for structured learning.",
    longTermAction: "Build a skills matrix with quarterly targets. Budget for external certifications in gap areas.",
  },
  {
    id: 4,
    icon: <Warning16Filled style={{ color: "#f7630c" }} />,
    title: "Meeting overload affecting delivery velocity",
    description: "3 team members spend >50% of their week in meetings. Sprint completion has dropped 15% for over-meetinged individuals.",
    severity: "medium",
    immediateAction: "Audit and eliminate redundant recurring meetings. Introduce 'Focus Fridays' with no meetings.",
    longTermAction: "Set a team-wide meeting budget of 30% max. Shift to async standups and written updates.",
  },
  {
    id: 5,
    icon: <Lightbulb16Filled style={{ color: "#0078d4" }} />,
    title: "High performers at risk of plateau",
    description: "Sarah Lin and Priya Sharma show consistently high scores but have not taken on new challenges in 2 quarters. Risk of disengagement through under-stimulation.",
    severity: "low",
    immediateAction: "Discuss stretch goals and career aspirations in next 1:1. Offer a cross-team project opportunity.",
    longTermAction: "Create a 'Senior IC track' with leadership exposure. Introduce innovation sprints or 20% time.",
  },
];

export const InsightsRecommendations: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  const severityClass = (s: Insight["severity"]) =>
    s === "high" ? styles.severityHigh : s === "medium" ? styles.severityMedium : styles.severityLow;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Sparkle20Filled className={styles.copilotIcon} />
        <Text size={500} weight="bold">LogIQ Insights & Recommendations</Text>
        <span className={styles.badge}>AI Generated</span>
      </div>

      <div className={styles.insightsList}>
        {insights.map((insight) => (
          <Card key={insight.id} className={mergeClasses(styles.insightCard, severityClass(insight.severity))}>
            <div className={styles.insightHeader}>
              <span className={styles.insightNumber}>{insight.id}</span>
              {insight.icon}
              <Text weight="semibold" size={300}>{insight.title}</Text>
            </div>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3, lineHeight: "1.6", display: "block" }}>
              {insight.description}
            </Text>
            <div className={styles.actionsRow}>
              <div className={mergeClasses(styles.actionBox, styles.immediateBox)}>
                <div>
                  <span className={styles.actionLabel} style={{ color: "#d13438" }}>⚡ Immediate</span>
                  <Text size={200} style={{ lineHeight: "1.5" }}>{insight.immediateAction}</Text>
                </div>
              </div>
              <div className={mergeClasses(styles.actionBox, styles.longTermBox)}>
                <div>
                  <span className={styles.actionLabel} style={{ color: "#5b5fc7" }}>🎯 Long-term</span>
                  <Text size={200} style={{ lineHeight: "1.5" }}>{insight.longTermAction}</Text>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
