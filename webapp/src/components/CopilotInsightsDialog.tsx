import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Button,
  Avatar,
  Divider,
} from "@fluentui/react-components";
import {
  ArrowTrendingDown20Regular,
  PeopleCommunity20Regular,
  CalendarClock20Regular,
  ArrowRight16Regular,
  Warning16Filled,
  PersonSearch20Regular,
  Mail20Regular,
  ClipboardTask20Regular,
  Sparkle20Filled,
} from "@fluentui/react-icons";
import { useEffect, useRef, useReducer } from "react";
import type { Employee } from "@/types";
import { LogiqDialog } from "./LogiqDialog";

const shimmerKeyframes = {
  "0%": { transform: "translateX(-100%)" },
  "100%": { transform: "translateX(100%)" },
};

const pulseKeyframes = {
  "0%, 100%": { opacity: 1, transform: "scale(1)" },
  "50%": { opacity: 0.5, transform: "scale(1.2)" },
};

const fadeInKeyframes = {
  "0%": { opacity: 0, transform: "translateY(8px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
};

const useStyles = makeStyles({
  section: {
    marginTop: "20px",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  riskList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  riskCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderRadius: "8px",
    ...shorthands.border("1px", "solid", "#e8e8e8"),
    backgroundColor: tokens.colorNeutralBackground1,
    flexWrap: "wrap",
    gap: "12px",
  },
  riskLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: "0px",
  },
  riskScores: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  riskScore: {
    textAlign: "center",
  },
  riskActions: {
    display: "flex",
    gap: "4px",
    flexShrink: 0,
  },
  insightItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px",
    backgroundColor: "#f5f5f5",
    borderRadius: "6px",
    marginBottom: "8px",
  },
  insightIcon: {
    flexShrink: 0,
    marginTop: "2px",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
    gap: "10px",
  },
  actionCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "8px",
    ...shorthands.border("1px", "solid", "#d1e4ff"),
    backgroundColor: "#f0f6ff",
    cursor: "pointer",
    transition: "background-color 0.15s",
    ":hover": {
      backgroundColor: "#e0edff",
    },
  },
  // Skeleton styles
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
      top: 0, left: 0, right: 0, bottom: 0,
      background: `linear-gradient(90deg, transparent, ${tokens.colorNeutralBackground1}, transparent)`,
      animationName: shimmerKeyframes,
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
      top: 0, left: 0, right: 0, bottom: 0,
      background: `linear-gradient(90deg, transparent, ${tokens.colorNeutralBackground1}, transparent)`,
      animationName: shimmerKeyframes,
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
      top: 0, left: 0, right: 0, bottom: 0,
      background: `linear-gradient(90deg, transparent, ${tokens.colorNeutralBackground1}, transparent)`,
      animationName: shimmerKeyframes,
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
    animationName: pulseKeyframes,
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
    animationName: fadeInKeyframes,
    animationDuration: "0.4s",
    animationTimingFunction: "ease-out",
    animationFillMode: "both",
  },
});

const getScoreColor = (score: number) => {
  if (score >= 70) return "#107c10";
  if (score >= 50) return "#f7630c";
  return "#d13438";
};

const LOADING_STEPS = [
  "Scanning team signals…",
  "Evaluating churn risk patterns…",
  "Correlating wellbeing & workload data…",
  "Building recommendations…",
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

interface CopilotInsightsDialogProps {
  open: boolean;
  onClose: () => void;
  atRiskEmployees: Employee[];
  totalChurnExposure: number;
  avgPreventability: number;
  onNavigateToPrep: () => void;
  onNavigateToProfile: (id: string) => void;
}

export const CopilotInsightsDialog: React.FC<CopilotInsightsDialogProps> = ({
  open,
  onClose,
  atRiskEmployees,
  totalChurnExposure,
  avgPreventability,
  onNavigateToPrep,
  onNavigateToProfile,
}) => {
  const styles = useStyles();
  const [loadingState, dispatch] = useReducer(loadingReducer, { isLoading: true, step: 0 });
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false;
      return;
    }
    if (prevOpenRef.current) return;
    prevOpenRef.current = true;

    dispatch({ type: 'START' });

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < LOADING_STEPS.length) {
        dispatch({ type: 'NEXT_STEP', step });
      } else {
        clearInterval(interval);
        dispatch({ type: 'COMPLETE' });
      }
    }, 650);

    return () => clearInterval(interval);
  }, [open]);

  const renderSkeleton = () => (
    <div>
      <div className={styles.loadingHeader}>
        <Sparkle20Filled className={styles.sparkleAnimated} />
        <Text size={300} className={styles.loadingStatus}>{LOADING_STEPS[loadingState.step]}</Text>
      </div>

      {/* Summary skeleton */}
      <div className={styles.shimmerLine} style={{ width: "100%" }} />
      <div className={styles.shimmerLine} style={{ width: "85%" }} />
      <div className={styles.shimmerLine} style={{ width: "70%", marginBottom: "24px" }} />

      {/* Key Findings skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div className={styles.shimmerPill} style={{ width: "20px", height: "20px", borderRadius: "4px" }} />
        <div className={styles.shimmerLine} style={{ width: "110px", marginBottom: 0 }} />
      </div>
      <div className={styles.shimmerBlock} style={{ height: "64px" }} />
      <div className={styles.shimmerBlock} style={{ height: "64px", marginBottom: "24px" }} />

      <Divider style={{ margin: "0 0 20px" }} />

      {/* People at Risk skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div className={styles.shimmerPill} style={{ width: "20px", height: "20px", borderRadius: "4px" }} />
        <div className={styles.shimmerLine} style={{ width: "120px", marginBottom: 0 }} />
        <div className={styles.shimmerPill} style={{ width: "24px", height: "20px" }} />
      </div>
      {[1, 2, 3].map((num) => (
        <div key={`user-skeleton-${num}`} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div className={styles.shimmerPill} style={{ width: "36px", height: "36px", borderRadius: "50%" }} />
          <div style={{ flex: 1 }}>
            <div className={styles.shimmerLine} style={{ width: "50%", marginBottom: "6px" }} />
            <div className={styles.shimmerLine} style={{ width: "35%", height: "10px", marginBottom: 0 }} />
          </div>
          <div className={styles.shimmerPill} style={{ width: "60px" }} />
        </div>
      ))}

      <Divider style={{ margin: "8px 0 20px" }} />

      {/* Actions skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div className={styles.shimmerPill} style={{ width: "20px", height: "20px", borderRadius: "4px" }} />
        <div className={styles.shimmerLine} style={{ width: "160px", marginBottom: 0 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {[1, 2, 3].map((num) => (
          <div key={`action-skeleton-${num}`} className={styles.shimmerBlock} style={{ height: "56px" }} />
        ))}
      </div>
    </div>
  );

  return (
    <LogiqDialog
      open={open}
      onClose={onClose}
      title="Copilot Analysis"
      maxWidth="720px"
      primaryAction={{
        label: "Open 1:1 Planner",
        icon: <PersonSearch20Regular />,
        onClick: onNavigateToPrep,
      }}
    >
      {loadingState.isLoading ? renderSkeleton() : (
      <div className={styles.contentFadeIn}>
      {/* Summary narrative */}
      <Text size={300} style={{ color: tokens.colorNeutralForeground2, lineHeight: "1.7", display: "block" }}>
        Based on the latest signals, your team shows elevated risk patterns.
        Combined churn exposure is{" "}
        <Text weight="bold" style={{ color: "#d13438" }}>${(totalChurnExposure / 1000).toFixed(0)}k</Text>
        {" "}with a preventability rate of{" "}
        <Text weight="bold" style={{ color: "#107c10" }}>{avgPreventability}%</Text>.
        {" "}Here's a detailed breakdown and recommended actions.
      </Text>

      {/* Key Insights */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <ArrowTrendingDown20Regular style={{ color: "#d13438" }} />
          <Text weight="semibold" size={400}>Key Findings</Text>
        </div>
        <div className={styles.insightItem}>
          <PeopleCommunity20Regular className={styles.insightIcon} style={{ color: "#f7630c" }} />
          <div>
            <Text weight="semibold" size={300}>Psychological Safety Declining</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "2px" }}>
              Team psychological safety dropped 12% over the last 2 pulse surveys. This correlates with increased sick leave and lower engagement scores across the board.
            </Text>
          </div>
        </div>
        <div className={styles.insightItem}>
          <CalendarClock20Regular className={styles.insightIcon} style={{ color: "#0f6cbd" }} />
          <div>
            <Text weight="semibold" size={300}>Workload Imbalance Detected</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "2px" }}>
              Meeting load exceeds 50% for 3 team members. Overtime hours are concentrated on at-risk employees, limiting recovery time.
            </Text>
          </div>
        </div>
      </div>

      <Divider style={{ margin: "16px 0" }} />

      {/* At-Risk People */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Warning16Filled style={{ color: "#d13438" }} />
          <Text weight="semibold" size={400}>People at Risk</Text>
          <span style={{ display: "inline-flex", alignItems: "center", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#fde7e9", color: "#d13438" }}>{atRiskEmployees.length}</span>
        </div>
        <div className={styles.riskList}>
          {atRiskEmployees.map((emp) => (
            <div key={emp.id} className={styles.riskCard}>
              <div className={styles.riskLeft}>
                <Avatar name={emp.name} size={36} color="colorful" />
                <div>
                  <Text weight="semibold" size={300}>{emp.name}</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
                    {emp.role} · {emp.tenure}
                  </Text>
                </div>
              </div>
              <div className={styles.riskScores}>
                <div className={styles.riskScore}>
                  <Text weight="bold" size={400} style={{ color: getScoreColor(emp.wellbeing.score) }}>{emp.wellbeing.score}</Text>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>Wellbeing</Text>
                </div>
                <div className={styles.riskScore}>
                  <Text weight="bold" size={400} style={{ color: getScoreColor(emp.motivation.score) }}>{emp.motivation.score}</Text>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>Motivation</Text>
                </div>
                <div className={styles.riskScore}>
                  <Text weight="bold" size={400} style={{ color: "#d13438" }}>{emp.churnPercent}%</Text>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>Churn</Text>
                </div>
              </div>
              <div className={styles.riskActions}>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<ArrowRight16Regular />}
                  iconPosition="after"
                  onClick={() => onNavigateToProfile(emp.id)}
                >
                  Profile
                </Button>
                <Button
                  appearance="primary"
                  size="small"
                  icon={<PersonSearch20Regular />}
                  onClick={onNavigateToPrep}
                >
                  Prep 1:1
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider style={{ margin: "16px 0" }} />

      {/* Recommended Actions */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <ClipboardTask20Regular style={{ color: "#0f6cbd" }} />
          <Text weight="semibold" size={400}>Recommended Actions</Text>
        </div>
        <div className={styles.actionGrid}>
          <div className={styles.actionCard} role="button" tabIndex={0} onClick={onNavigateToPrep} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateToPrep(); } }}>
            <PersonSearch20Regular style={{ color: "#0f6cbd" }} />
            <div>
              <Text weight="semibold" size={300}>Schedule 1:1s</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
                With Alex Chen & David Kim this week
              </Text>
            </div>
          </div>
          <div className={styles.actionCard}>
            <Mail20Regular style={{ color: "#0f6cbd" }} />
            <div>
              <Text weight="semibold" size={300}>Redistribute Workload</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
                Reassign 2 sprint items from at-risk members
              </Text>
            </div>
          </div>
          <div className={styles.actionCard}>
            <CalendarClock20Regular style={{ color: "#0f6cbd" }} />
            <div>
              <Text weight="semibold" size={300}>Team Pulse Check</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
                Run a quick engagement survey this Friday
              </Text>
            </div>
          </div>
        </div>
      </div>
      </div>
      )}
    </LogiqDialog>
  );
};
