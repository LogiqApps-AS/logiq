import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Persona,
  ProgressBar,
  Divider,
} from "@fluentui/react-components";
import {
  ThumbLike16Filled,
  Warning16Filled,
  Lightbulb16Filled,
  Briefcase16Filled,
  Trophy16Filled,
  ArrowTrendingDown20Regular,
  ArrowTrending20Regular,
  Sparkle20Filled,
} from "@fluentui/react-icons";
import { useEffect, useRef, useReducer } from "react";
import type { Employee } from "@/lib/api";
import type { MemberDetail } from "@/lib/api";
import { useMemberDetail } from "../hooks/useApiData";
import { LogiqDialog } from "./LogiqDialog";

const useStyles = makeStyles({
  section: {
    marginBottom: "20px",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  },
  summaryText: {
    color: tokens.colorNeutralForeground2,
    lineHeight: "1.6",
    display: "block",
    fontSize: "13px",
  },
  pillList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  pillGreen: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: "6px",
    backgroundColor: "#dff6dd",
    color: "#107c41",
  },
  pillRed: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: "6px",
    backgroundColor: "#fde7e9",
    color: "#d13438",
  },
  pillBlue: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: "6px",
    backgroundColor: "#e8ebf9",
    color: "#5b5fc7",
  },
  recCard: {
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "8px",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    textAlign: "center",
    marginBottom: "16px",
  },
  scoreItem: {
    padding: "8px",
    borderRadius: "8px",
    backgroundColor: tokens.colorNeutralBackground3,
  },
  expItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  shimmerLine: {
    height: "12px",
    borderRadius: "6px",
    backgroundColor: tokens.colorNeutralBackground5,
    position: "relative" as const,
    overflow: "hidden",
    marginBottom: "10px",
    "::after": {
      content: '""',
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(90deg, transparent, ${tokens.colorNeutralBackground1}, transparent)`,
      animationName: {
        "0%": { transform: "translateX(-100%)" },
        "100%": { transform: "translateX(100%)" },
      },
      animationDuration: "1.5s",
      animationIterationCount: "infinite",
      animationTimingFunction: "ease-in-out",
    },
  },
  shimmerBlock: {
    height: "48px",
    borderRadius: "8px",
    backgroundColor: tokens.colorNeutralBackground5,
    position: "relative" as const,
    overflow: "hidden",
    marginBottom: "12px",
    "::after": {
      content: '""',
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(90deg, transparent, ${tokens.colorNeutralBackground1}, transparent)`,
      animationName: {
        "0%": { transform: "translateX(-100%)" },
        "100%": { transform: "translateX(100%)" },
      },
      animationDuration: "1.5s",
      animationIterationCount: "infinite",
      animationTimingFunction: "ease-in-out",
    },
  },
  shimmerPill: {
    height: "28px",
    width: "100px",
    borderRadius: "6px",
    backgroundColor: tokens.colorNeutralBackground5,
    position: "relative" as const,
    overflow: "hidden",
    display: "inline-block",
    "::after": {
      content: '""',
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(90deg, transparent, ${tokens.colorNeutralBackground1}, transparent)`,
      animationName: {
        "0%": { transform: "translateX(-100%)" },
        "100%": { transform: "translateX(100%)" },
      },
      animationDuration: "1.5s",
      animationIterationCount: "infinite",
      animationTimingFunction: "ease-in-out",
    },
  },
  loadingHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
  },
  sparkleAnimated: {
    color: "#5b5fc7",
    animationName: {
      "0%, 100%": { opacity: 1, transform: "scale(1)" },
      "50%": { opacity: 0.5, transform: "scale(1.2)" },
    },
    animationDuration: "1.5s",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
  },
  loadingStatus: {
    color: tokens.colorNeutralForeground3,
    fontSize: "12px",
    fontStyle: "italic",
  },
  contentFadeIn: {
    animationName: {
      "0%": { opacity: 0, transform: "translateY(8px)" },
      "100%": { opacity: 1, transform: "translateY(0)" },
    },
    animationDuration: "0.4s",
    animationTimingFunction: "ease-out",
    animationFillMode: "both",
  },
});

const emptyDetail: MemberDetail = {
  department: "",
  skills: [],
  roleHistory: [],
  projects: [],
  feedback: [],
  training: [],
  signals: [],
  certifications: [],
  feedbackScoreAvg: 0,
  trainingHoursTotal: 0,
  activeSignalsCount: 0,
  projectCount: 0,
};

function generateOverview(emp: Employee, detail: MemberDetail | null) {
  const d = detail ?? emptyDetail;
  const scores = { wellbeing: emp.wellbeing?.score ?? 0, skills: emp.skills?.score ?? 0, motivation: emp.motivation?.score ?? 0, delivery: emp.delivery?.score ?? 0 };
  const avg = Math.round((scores.wellbeing + scores.skills + scores.motivation + scores.delivery) / 4);

  const strengths: string[] = [];
  if (scores.wellbeing >= 70) strengths.push("Good work-life balance");
  if (scores.skills >= 70) strengths.push("Strong technical skills");
  if (scores.motivation >= 70) strengths.push("Highly motivated");
  if (scores.delivery >= 70) strengths.push("Consistent delivery");
  if (emp.sprintCompletion >= 90) strengths.push("Sprint champion");
  if (emp.learningHours >= 15) strengths.push("Continuous learner");
  if (emp.psychSafety >= 80) strengths.push("Team culture builder");
  if (emp.feedbackScore360 >= 85) strengths.push("Strong peer feedback");
  if (strengths.length === 0) strengths.push("Reliable team member", "Growth potential");

  const weaknesses: string[] = [];
  if (scores.wellbeing < 50) weaknesses.push("Wellbeing concerns");
  if (scores.skills < 50) weaknesses.push("Skill gaps present");
  if (scores.motivation < 50) weaknesses.push("Low engagement");
  if (scores.delivery < 60) weaknesses.push("Delivery at risk");
  if (emp.overtimeHours >= 20) weaknesses.push("Overtime overload");
  if (emp.meetingLoad >= 50) weaknesses.push("Meeting-heavy schedule");
  if (emp.sickDays >= 5) weaknesses.push("Elevated sick leave");
  if (emp.idpGoalProgress < 50) weaknesses.push("IDP behind schedule");

  const recs: { title: string; desc: string; priority: "high" | "medium" | "low" }[] = [];
  if (emp.churnRisk === "At risk") {
    recs.push({ title: "Schedule urgent 1:1", desc: "Address churn risk signals and discuss workload concerns immediately.", priority: "high" });
  }
  if (scores.wellbeing < 50) {
    recs.push({ title: "Review workload distribution", desc: `${emp.overtimeHours}h overtime and ${emp.meetingHours}h meetings/week need rebalancing.`, priority: "high" });
  }
  if (emp.idpGoalProgress < 50) {
    recs.push({ title: "Revisit IDP goals", desc: `Goal progress at ${emp.idpGoalProgress}%. Consider adjusting timelines or providing mentorship.`, priority: "medium" });
  }
  if (scores.skills < 60) {
    recs.push({ title: "Assign learning pathway", desc: `Skills coverage at ${emp.skillsCoverage}%. Pair with senior mentor for targeted growth.`, priority: "medium" });
  }
  if (emp.learningHours < 8) {
    recs.push({ title: "Allocate learning time", desc: `Only ${emp.learningHours}h/month on learning. Block dedicated development hours.`, priority: "low" });
  }
  if (recs.length === 0) {
    recs.push({ title: "Continue current trajectory", desc: "Performance metrics are healthy. Recognize and maintain momentum.", priority: "low" });
  }

  let summary = "";
  if (avg >= 75) {
    summary = `${emp.name} is performing well across all dimensions with an average score of ${avg}. They are a valuable contributor to the team and show strong consistency.`;
  } else if (avg >= 55) {
    summary = `${emp.name} shows mixed signals with an average score of ${avg}. Some areas are solid while others need attention. A focused development plan would help elevate performance.`;
  } else {
    summary = `${emp.name} is showing concerning patterns with an average score of ${avg}. Multiple dimensions are below target, and proactive intervention is recommended to prevent further decline.`;
  }

  return { strengths, weaknesses, recs, summary, detail: d, avg };
}

interface AIOverviewDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const priorityColors = { high: "#d13438", medium: "#f7630c", low: "#107c41" };
const priorityLabels = { high: "High Priority", medium: "Medium", low: "Low" };

const LOADING_STEPS = [
  "Analyzing employee data…",
  "Evaluating performance dimensions…",
  "Identifying strengths & risks…",
  "Generating recommendations…",
];

type LoadingAction = 
  | { type: 'START' }
  | { type: 'NEXT_STEP'; step: number }
  | { type: 'COMPLETE' };

const loadingReducer = (state: { isLoading: boolean; step: number }, action: LoadingAction) => {
  switch (action.type) {
    case 'START':
      return { isLoading: true, step: 0 };
    case 'NEXT_STEP':
      return { isLoading: true, step: action.step };
    case 'COMPLETE':
      return { isLoading: false, step: state.step };
    default:
      return state;
  }
};

export const AIOverviewDialog: React.FC<AIOverviewDialogProps> = ({ open, onClose, employee }) => {
  const styles = useStyles();
  const [loadingState, dispatch] = useReducer(loadingReducer, { isLoading: true, step: 0 });
  const prevEmployeeId = useRef<string | null>(null);

  const { data: apiDetail, isLoading: detailLoading } = useMemberDetail(employee?.id ?? "", "team1");

  useEffect(() => {
    if (!open || !employee) return;
    if (prevEmployeeId.current !== employee.id) {
      dispatch({ type: 'START' });
      prevEmployeeId.current = employee.id;
    }

    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < LOADING_STEPS.length) {
        dispatch({ type: 'NEXT_STEP', step });
      } else {
        clearInterval(stepInterval);
        dispatch({ type: 'COMPLETE' });
      }
    }, 600);

    return () => clearInterval(stepInterval);
  }, [open, employee]);

  if (!employee) return null;

  const { strengths, weaknesses, recs, summary, detail: overviewDetail } = generateOverview(employee, apiDetail ?? null);
  const scores = [
    { label: "Well-being", value: employee.wellbeing.score },
    { label: "Skills", value: employee.skills.score },
    { label: "Motivation", value: employee.motivation.score },
    { label: "Delivery", value: employee.delivery.score },
  ];
  const getColor = (v: number) => v >= 70 ? "#107c41" : v >= 50 ? "#f7630c" : "#d13438";

  const renderSkeleton = () => (
    <div>
      {/* Loading header */}
      <div className={styles.loadingHeader}>
        <Sparkle20Filled className={styles.sparkleAnimated} />
        <Text size={300} className={styles.loadingStatus}>{LOADING_STEPS[loadingState.step]}</Text>
      </div>

      {/* Persona skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div className={styles.shimmerPill} style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
        <div style={{ flex: 1 }}>
          <div className={styles.shimmerLine} style={{ width: "60%", marginBottom: "6px" }} />
          <div className={styles.shimmerLine} style={{ width: "40%", height: "10px" }} />
        </div>
      </div>

      {/* Score grid skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "20px" }}>
        {[1, 2, 3, 4].map((num) => (
          <div key={`score-skeleton-${num}`} className={styles.shimmerBlock} style={{ height: "56px" }} />
        ))}
      </div>

      {/* Summary skeleton */}
      <div className={styles.shimmerLine} style={{ width: "100%" }} />
      <div className={styles.shimmerLine} style={{ width: "90%" }} />
      <div className={styles.shimmerLine} style={{ width: "75%", marginBottom: "20px" }} />

      <Divider style={{ margin: "0 0 16px" }} />

      {/* Strengths skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
        <div className={styles.shimmerPill} style={{ width: "16px", height: "16px", borderRadius: "4px" }} />
        <div className={styles.shimmerLine} style={{ width: "80px", marginBottom: 0 }} />
      </div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
        {[110, 90, 130].map((w, i) => (
          <div key={`pill-${w}`} className={styles.shimmerPill} style={{ width: `${w}px` }} />
        ))}
      </div>

      {/* Recommendations skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
        <div className={styles.shimmerPill} style={{ width: "16px", height: "16px", borderRadius: "4px" }} />
        <div className={styles.shimmerLine} style={{ width: "120px", marginBottom: 0 }} />
      </div>
      {[1, 2].map((num) => (
        <div key={`rec-skeleton-${num}`} className={styles.shimmerBlock} style={{ height: "64px" }} />
      ))}
    </div>
  );

  return (
    <LogiqDialog
      open={open}
      onClose={onClose}
      title="AI Overview"
      badge="Generated Analysis"
      maxWidth="560px"
    >
      {loadingState.isLoading || detailLoading ? renderSkeleton() : (
      <div className={styles.contentFadeIn}>
      {/* Employee info */}
      <div style={{ marginBottom: "16px" }}>
        <Persona
          name={employee.name}
          secondaryText={`${employee.role} · ${overviewDetail.department} · ${employee.tenure}`}
          size="large"
          avatar={{ color: employee.churnRisk === "At risk" ? "cranberry" : "brand" }}
          presence={employee.churnRisk === "At risk" ? { status: "busy" } : { status: "available" }}
        />
      </div>

      {/* Score overview */}
      <div className={styles.scoreGrid}>
        {scores.map((s) => (
          <div key={s.label} className={styles.scoreItem}>
            <Text weight="bold" size={500} style={{ color: getColor(s.value), display: "block" }}>{s.value}</Text>
            <Text size={100} style={{ color: tokens.colorNeutralForeground3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</Text>
          </div>
        ))}
      </div>

      {/* Churn risk bar */}
      {employee.churnPercent > 20 && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", padding: "10px 12px", borderRadius: "8px", backgroundColor: employee.churnRisk === "At risk" ? "#fef0f1" : "#fff8f0" }}>
          <Text size={200}>Churn Risk</Text>
          <div style={{ flex: 1 }}>
            <ProgressBar value={employee.churnPercent / 100} thickness="large" color={employee.churnRisk === "At risk" ? "error" : "warning"} />
          </div>
          <Text weight="bold" size={300} style={{ color: employee.churnRisk === "At risk" ? "#d13438" : "#f7630c" }}>{employee.churnPercent}%</Text>
        </div>
      )}

      {/* Summary */}
      <div className={styles.section}>
        <Text className={styles.summaryText}>{summary}</Text>
      </div>

      <Divider style={{ margin: "0 0 16px" }} />

      {/* Strengths */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <ThumbLike16Filled style={{ color: "#107c41" }} />
          <Text weight="semibold" size={300}>Strengths</Text>
        </div>
        <div className={styles.pillList}>
          {strengths.map((s) => (
            <span key={s} className={styles.pillGreen}>{s}</span>
          ))}
        </div>
      </div>

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Warning16Filled style={{ color: "#d13438" }} />
            <Text weight="semibold" size={300}>Areas of Concern</Text>
          </div>
          <div className={styles.pillList}>
            {weaknesses.map((w) => (
              <span key={w} className={styles.pillRed}>{w}</span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Briefcase16Filled style={{ color: "#5b5fc7" }} />
          <Text weight="semibold" size={300}>Experience & Skills</Text>
        </div>
        <div className={styles.expItem}>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3, minWidth: "90px" }}>Tenure</Text>
          <Text size={200} weight="semibold">{employee.tenure}</Text>
        </div>
        <div className={styles.expItem}>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3, minWidth: "90px" }}>Projects</Text>
          <Text size={200} weight="semibold">{overviewDetail.projectCount} ({overviewDetail.projects.filter(p => p.status === "Active").length} active)</Text>
        </div>
        <div className={styles.expItem}>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3, minWidth: "90px" }}>Training</Text>
          <Text size={200} weight="semibold">{overviewDetail.trainingHoursTotal}h completed</Text>
        </div>
        <div className={styles.expItem}>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3, minWidth: "90px" }}>Skills</Text>
          <div className={styles.pillList}>
            {overviewDetail.skills.slice(0, 4).map((s) => (
              <span key={s} className={styles.pillBlue}>{s}</span>
            ))}
            {overviewDetail.skills.length > 4 && (
              <span className={styles.pillBlue}>+{overviewDetail.skills.length - 4}</span>
            )}
          </div>
        </div>
      </div>

      <Divider style={{ margin: "0 0 16px" }} />

      {/* Recommendations */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Lightbulb16Filled style={{ color: "#f7630c" }} />
          <Text weight="semibold" size={300}>Recommendations</Text>
        </div>
        {recs.map((r, i) => (
          <div key={r.title} className={styles.recCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <Text weight="semibold" size={300}>{r.title}</Text>
              <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", backgroundColor: priorityColors[r.priority] + "18", color: priorityColors[r.priority] }}>
                {priorityLabels[r.priority]}
              </span>
            </div>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{r.desc}</Text>
          </div>
        ))}
      </div>

      {/* Key metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {[
          { label: "360 Feedback", value: employee.feedbackScore360, icon: <Trophy16Filled style={{ color: "#f7b731" }} /> },
          { label: "Engagement", value: employee.engagementPulse, icon: <ArrowTrending20Regular style={{ color: "#107c41", fontSize: "16px" }} /> },
          { label: "Goal Progress", value: `${employee.goalAchievement}%`, icon: <ArrowTrendingDown20Regular style={{ color: employee.goalAchievement >= 70 ? "#107c41" : "#f7630c", fontSize: "16px" }} /> },
        ].map((m) => (
          <div key={m.label} style={{ textAlign: "center", padding: "10px", borderRadius: "8px", backgroundColor: tokens.colorNeutralBackground3 }}>
            <div style={{ marginBottom: "4px" }}>{m.icon}</div>
            <Text weight="bold" size={400} style={{ display: "block" }}>{m.value}</Text>
            <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>{m.label}</Text>
          </div>
        ))}
      </div>
      </div>
      )}
    </LogiqDialog>
  );
};
