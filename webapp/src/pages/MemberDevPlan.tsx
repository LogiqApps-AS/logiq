import { useCallback, useReducer } from "react";
import { PageHeader } from "../components/PageHeader";
import { Sparkle20Filled, Lightbulb16Filled, Info16Regular, Edit16Regular, CheckmarkCircle16Regular, Add16Regular } from "@fluentui/react-icons";
import {
  Text,
  Card,
  makeStyles,
  tokens,
  ProgressBar,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Button,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Dropdown,
  Option,
} from "@fluentui/react-components";
import { ArrowTrending20Regular, ArrowTrendingDown20Regular } from "@fluentui/react-icons";
import { AppShell } from "../components/AppShell";
import { devPlanGoals as initialGoals, learningItems as initialLearning, memberSkills } from "../data/memberDashboardData";
import type { DevGoal, LearningItem } from "../data/memberDashboardData";
import LearningCardList from "../components/LearningCardList";
import { toast } from "sonner";

const useStyles = makeStyles({
  goalCard: { padding: "14px 18px", marginBottom: "8px" },
  goalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" },
  goalFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" },
  statusBadge: { fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px" },
  skillBar: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" },
  skillName: { width: "110px", flexShrink: 0, fontSize: "12px", fontWeight: 500 },
  skillTrack: { flex: 1, height: "7px", borderRadius: "4px", backgroundColor: "#e8e8e8", overflow: "hidden" },
  skillFill: { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },
  skillValue: { width: "30px", textAlign: "right", fontSize: "12px", fontWeight: 700, flexShrink: 0 },
  sectionHeader: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" },
  infoButton: {
    background: "none",
    border: "none",
    padding: "2px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "50%",
    ":hover": { backgroundColor: tokens.colorNeutralBackground1Hover },
  },
  legendRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" },
  legendDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  legendBadge: { fontSize: "10px", fontWeight: 600, padding: "1px 7px", borderRadius: "4px", whiteSpace: "nowrap" as any },
  actionRow: { display: "flex", gap: "4px", alignItems: "center" },
  threeCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
    alignItems: "start",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr 1fr" },
    "@media (max-width: 600px)": { gridTemplateColumns: "1fr" },
  },
});

const statusColors: Record<string, { bg: string; color: string }> = {
  "on-track": { bg: "#dff6dd", color: "#107c41" },
  behind: { bg: "#fde7e9", color: "#d13438" },
  completed: { bg: "#e8ebf9", color: "#5b5fc7" },
};
const priorityColors: Record<string, { color: string; bg: string }> = {
  HIGH: { color: "#d13438", bg: "#fde7e9" },
  MEDIUM: { color: "#f7630c", bg: "#fff4ce" },
  LOW: { color: "#107c41", bg: "#dff6dd" },
};
const getBarColor = (v: number) => (v >= 70 ? "#5b5fc7" : v >= 50 ? "#f7630c" : "#d13438");

const skillRecommendations: Record<string, { training: string; provider: string; duration: string; reason: string }[]> = {
  "TypeScript": [
    { training: "Advanced TypeScript Patterns", provider: "Pluralsight", duration: "12h", reason: "Solidify generics and type-level programming" },
  ],
  "React": [
    { training: "React Performance Optimization", provider: "Frontend Masters", duration: "8h", reason: "Improve rendering efficiency in large apps" },
  ],
  "Cloud Architecture": [
    { training: "AWS Solutions Architect Associate", provider: "A Cloud Guru", duration: "40h", reason: "Critical skill gap — aligns with IDP goal" },
    { training: "Cloud Design Patterns", provider: "Microsoft Learn", duration: "6h", reason: "Learn scalable architecture fundamentals" },
  ],
  "System Design": [
    { training: "System Design Interview Prep", provider: "Educative", duration: "20h", reason: "Behind on IDP goal — structured learning needed" },
    { training: "Distributed Systems Fundamentals", provider: "Coursera", duration: "15h", reason: "Build foundation for architecture reviews" },
  ],
  "Node.js": [
    { training: "Node.js Advanced Concepts", provider: "Udemy", duration: "10h", reason: "Deepen backend proficiency" },
  ],
  "Testing": [
    { training: "Test-Driven Development Mastery", provider: "Pluralsight", duration: "8h", reason: "Improve test coverage and methodology" },
  ],
  "CI/CD": [
    { training: "GitHub Actions & DevOps Pipelines", provider: "LinkedIn Learning", duration: "6h", reason: "Skill trending down — needs reinforcement" },
    { training: "Infrastructure as Code with Terraform", provider: "HashiCorp Learn", duration: "12h", reason: "Complement CI/CD with IaC skills" },
  ],
  "Leadership": [
    { training: "Leading Without Authority", provider: "Coursera", duration: "8h", reason: "Supports leadership readiness IDP goal" },
    { training: "Effective 1:1 Conversations", provider: "Internal Workshop", duration: "2h", reason: "Build mentoring skills for team growth" },
  ],
};

type State = {
  goals: DevGoal[];
  learning: LearningItem[];
  enrolledTrainings: Set<string>;
  editGoal: DevGoal | null;
  editProgress: number;
  editStatus: string;
};

type Action =
  | { type: 'UPDATE_GOALS'; goals: DevGoal[] }
  | { type: 'SET_LEARNING'; learning: LearningItem[] }
  | { type: 'ADD_ENROLLED_TRAINING'; training: string }
  | { type: 'OPEN_EDIT_DIALOG'; goal: DevGoal }
  | { type: 'SET_EDIT_PROGRESS'; progress: number }
  | { type: 'SET_EDIT_STATUS'; status: string }
  | { type: 'CLOSE_EDIT_DIALOG' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE_GOALS':
      return { ...state, goals: action.goals };
    case 'SET_LEARNING':
      return { ...state, learning: action.learning };
    case 'ADD_ENROLLED_TRAINING': {
      const next = new Set(state.enrolledTrainings);
      next.add(action.training);
      return { ...state, enrolledTrainings: next };
    }
    case 'OPEN_EDIT_DIALOG':
      return { ...state, editGoal: action.goal, editProgress: action.goal.progress, editStatus: action.goal.status };
    case 'SET_EDIT_PROGRESS':
      return { ...state, editProgress: action.progress };
    case 'SET_EDIT_STATUS':
      return { ...state, editStatus: action.status };
    case 'CLOSE_EDIT_DIALOG':
      return { ...state, editGoal: null };
    default:
      return state;
  }
};

const MemberDevPlan: React.FC = () => {
  const styles = useStyles();
  
  const [state, dispatch] = useReducer(reducer, {
    goals: initialGoals,
    learning: initialLearning,
    enrolledTrainings: new Set<string>(),
    editGoal: null,
    editProgress: 0,
    editStatus: "on-track",
  });

  const handleUpdateProgress = useCallback((goalId: string, delta: number) => {
    dispatch({ 
      type: 'UPDATE_GOALS', 
      goals: state.goals.map(g => {
      if (g.id !== goalId) return g;
      const newProgress = Math.min(100, Math.max(0, g.progress + delta));
      const newStatus = newProgress >= 100 ? "completed" as const : g.status;
      return { ...g, progress: newProgress, status: newStatus };
    })
    });
    toast.success("Progress updated");
  }, [state.goals]);

  const handleMarkComplete = useCallback((goalId: string) => {
    dispatch({ 
      type: 'UPDATE_GOALS', 
      goals: state.goals.map(g =>
        g.id === goalId ? { ...g, progress: 100, status: "completed" as const } : g
      )
    });
    toast.success("Goal marked as completed! 🎉");
  }, [state.goals]);

  const openEditDialog = useCallback((goal: DevGoal) => {
    dispatch({ type: 'OPEN_EDIT_DIALOG', goal });
  }, []);

  const saveEditDialog = useCallback(() => {
    if (!state.editGoal) return;
    dispatch({ 
      type: 'UPDATE_GOALS', 
      goals: state.goals.map(g =>
        g.id === state.editGoal!.id ? { ...g, progress: state.editProgress, status: state.editStatus as DevGoal["status"] } : g
      )
    });
    dispatch({ type: 'CLOSE_EDIT_DIALOG' });
    toast.success("Goal updated");
  }, [state.editGoal, state.editProgress, state.editStatus, state.goals]);

  const handleDismissLearning = useCallback((itemId: string) => {
    dispatch({ type: 'SET_LEARNING', learning: state.learning.filter(l => l.id !== itemId) });
    toast("Learning item dismissed");
  }, [state.learning]);

  const handleStartLearning = useCallback((item: LearningItem) => {
    toast.success(`Starting "${item.title}" — opening course...`);
  }, []);

  const handleEnrollTraining = useCallback((trainingName: string) => {
    dispatch({ type: 'ADD_ENROLLED_TRAINING', training: trainingName });
    toast.success(`Enrolled in "${trainingName}"`);
  }, []);

  return (
    <AppShell>
      <div style={{ maxWidth: "1200px", width: "100%", textAlign: "left" }}>
        <PageHeader title="Individual Development Plan" subtitle="Track your growth, learning, and skill development" />

        <div className={styles.threeCol}>
          {/* Column 1: Goals */}
          <div>
            <div className={styles.sectionHeader}>
              <Text weight="bold" size={500}>Goals</Text>
              <Popover withArrow>
                <PopoverTrigger disableButtonEnhancement>
                  <button className={styles.infoButton} aria-label="Goals legend">
                    <Info16Regular style={{ color: tokens.colorNeutralForeground3 }} />
                  </button>
                </PopoverTrigger>
                <PopoverSurface style={{ padding: "14px 18px", maxWidth: "270px" }}>
                  <Text weight="semibold" size={300} style={{ display: "block", marginBottom: "10px" }}>Goal Statuses</Text>
                  <div className={styles.legendRow}>
                    <span className={styles.legendBadge} style={{ backgroundColor: "#dff6dd", color: "#107c41" }}>on-track</span>
                    <Text size={200}>Progressing as planned</Text>
                  </div>
                  <div className={styles.legendRow}>
                    <span className={styles.legendBadge} style={{ backgroundColor: "#fde7e9", color: "#d13438" }}>behind</span>
                    <Text size={200}>Needs immediate attention</Text>
                  </div>
                  <div className={styles.legendRow}>
                    <span className={styles.legendBadge} style={{ backgroundColor: "#e8ebf9", color: "#5b5fc7" }}>completed</span>
                    <Text size={200}>Goal achieved</Text>
                  </div>
                </PopoverSurface>
              </Popover>
            </div>
            {state.goals.map((goal) => {
              const sc = statusColors[goal.status];
              const isCompleted = goal.status === "completed";
              return (
                <Card key={goal.id} className={styles.goalCard}>
                  <div className={styles.goalHeader}>
                    <Text weight="semibold" size={200}>{goal.title}</Text>
                    <span className={styles.statusBadge} style={{ backgroundColor: sc.bg, color: sc.color }}>{goal.status}</span>
                  </div>
                  {goal.description && <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block", marginBottom: "4px" }}>{goal.description}</Text>}
                  <ProgressBar value={goal.progress / 100} thickness="large" color="brand" />
                  <div className={styles.goalFooter}>
                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>{goal.progress}%{goal.targetDate && ` · ${goal.targetDate}`}</Text>
                    <div className={styles.actionRow}>
                      {!isCompleted && (
                        <>
                          <Button
                            size="small"
                            appearance="subtle"
                            icon={<Add16Regular />}
                            onClick={() => handleUpdateProgress(goal.id, 10)}
                            title="Add 10% progress"
                          >
                            +10%
                          </Button>
                          <Button
                            size="small"
                            appearance="subtle"
                            icon={<Edit16Regular />}
                            onClick={() => openEditDialog(goal)}
                            title="Edit goal"
                          />
                          <Button
                            size="small"
                            appearance="subtle"
                            icon={<CheckmarkCircle16Regular />}
                            onClick={() => handleMarkComplete(goal.id)}
                            title="Mark complete"
                          />
                        </>
                      )}
                      {isCompleted && (
                        <Text size={100} style={{ color: "#107c41", fontWeight: 600 }}>✓ Done</Text>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Column 2: Learning */}
          <div>
            <div className={styles.sectionHeader}>
              <Text weight="bold" size={500}>Recommended Learning</Text>
              <Popover withArrow>
                <PopoverTrigger disableButtonEnhancement>
                  <button className={styles.infoButton} aria-label="Learning legend">
                    <Info16Regular style={{ color: tokens.colorNeutralForeground3 }} />
                  </button>
                </PopoverTrigger>
                <PopoverSurface style={{ padding: "14px 18px", maxWidth: "270px" }}>
                  <Text weight="semibold" size={300} style={{ display: "block", marginBottom: "10px" }}>Priority Levels</Text>
                  <div className={styles.legendRow}>
                    <span className={styles.legendBadge} style={{ backgroundColor: "#fde7e9", color: "#d13438" }}>HIGH</span>
                    <Text size={200}>Critical skill gap to close</Text>
                  </div>
                  <div className={styles.legendRow}>
                    <span className={styles.legendBadge} style={{ backgroundColor: "#fff4ce", color: "#f7630c" }}>MEDIUM</span>
                    <Text size={200}>Recommended focus area</Text>
                  </div>
                  <div className={styles.legendRow}>
                    <span className={styles.legendBadge} style={{ backgroundColor: "#dff6dd", color: "#107c41" }}>LOW</span>
                    <Text size={200}>Nice-to-have enrichment</Text>
                  </div>
                </PopoverSurface>
              </Popover>
            </div>
            <LearningCardList
              items={state.learning}
              onStart={handleStartLearning}
              onDismiss={handleDismissLearning}
            />
          </div>

          {/* Column 3: Skills + AI Recommendations */}
          <div>
            <div className={styles.sectionHeader}>
              <Text weight="bold" size={500}>Skills Profile</Text>
              <Popover withArrow>
                <PopoverTrigger disableButtonEnhancement>
                  <button className={styles.infoButton} aria-label="Skills legend">
                    <Info16Regular style={{ color: tokens.colorNeutralForeground3 }} />
                  </button>
                </PopoverTrigger>
                <PopoverSurface style={{ padding: "14px 18px", maxWidth: "280px" }}>
                  <Text weight="semibold" size={300} style={{ display: "block", marginBottom: "10px" }}>Skill Levels</Text>
                  <div className={styles.legendRow}>
                    <span className={styles.legendDot} style={{ backgroundColor: "#5b5fc7" }} />
                    <Text size={200}><Text weight="semibold" size={200}>70+</Text> — Proficient</Text>
                  </div>
                  <div className={styles.legendRow}>
                    <span className={styles.legendDot} style={{ backgroundColor: "#f7630c" }} />
                    <Text size={200}><Text weight="semibold" size={200}>50–69</Text> — Developing</Text>
                  </div>
                  <div className={styles.legendRow}>
                    <span className={styles.legendDot} style={{ backgroundColor: "#d13438" }} />
                    <Text size={200}><Text weight="semibold" size={200}>&lt;50</Text> — Skill gap</Text>
                  </div>
                  <div style={{ borderTop: `1px solid ${tokens.colorNeutralStroke2}`, marginTop: "8px", paddingTop: "8px" }}>
                    <Text weight="semibold" size={300} style={{ display: "block", marginBottom: "6px" }}>Trends</Text>
                    <div className={styles.legendRow}>
                      <ArrowTrending20Regular style={{ color: "#107c41", fontSize: 14 }} />
                      <Text size={200}>Skill is improving</Text>
                    </div>
                    <div className={styles.legendRow}>
                      <ArrowTrendingDown20Regular style={{ color: "#d13438", fontSize: 14 }} />
                      <Text size={200}>Skill is declining</Text>
                    </div>
                  </div>
                </PopoverSurface>
              </Popover>
            </div>
            <Card style={{ padding: "12px 16px" }}>
              {memberSkills.map((skill) => {
                const color = getBarColor(skill.level);
                return (
                  <div key={skill.name} className={styles.skillBar}>
                    <span className={styles.skillName}>{skill.name}</span>
                    <div className={styles.skillTrack}>
                      <div className={styles.skillFill} style={{ width: `${skill.level}%`, backgroundColor: color }} />
                    </div>
                    <span className={styles.skillValue} style={{ color }}>{skill.level}</span>
                    {skill.trend === "up" ? <ArrowTrending20Regular style={{ color: "#107c41", fontSize: 14 }} />
                      : skill.trend === "down" ? <ArrowTrendingDown20Regular style={{ color: "#d13438", fontSize: 14 }} />
                      : <span style={{ width: 16 }} />}
                  </div>
                );
              })}
            </Card>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", marginBottom: "6px" }}>
              <Sparkle20Filled style={{ color: "#5b5fc7" }} />
              <Text weight="bold" size={300}>Training by Skill</Text>
              <span style={{ fontSize: "9px", fontWeight: 600, padding: "1px 6px", borderRadius: "4px", backgroundColor: "#e8ebf9", color: "#5b5fc7" }}>AI</span>
            </div>
            {memberSkills
              .filter((s) => s.level < 70 || s.trend === "down")
              .sort((a, b) => a.level - b.level)
              .map((skill) => {
                const recs = skillRecommendations[skill.name] || [];
                if (recs.length === 0) return null;
                const color = getBarColor(skill.level);
                return (
                  <Card key={skill.name} style={{ padding: "10px 12px", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color }}>{skill.name}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color }}>{skill.level}</span>
                      {skill.trend === "down" && <ArrowTrendingDown20Regular style={{ color: "#d13438", fontSize: 13 }} />}
                      {skill.level < 50 && <span style={{ fontSize: "9px", fontWeight: 600, padding: "1px 5px", borderRadius: "4px", backgroundColor: "#fde7e9", color: "#d13438" }}>Gap</span>}
                      {skill.trend === "down" && <span style={{ fontSize: "9px", fontWeight: 600, padding: "1px 5px", borderRadius: "4px", backgroundColor: "#fff4ce", color: "#f7630c" }}>↓</span>}
                    </div>
                    {recs.map((r) => {
                      const enrolled = state.enrolledTrainings.has(r.training);
                      return (
                        <div key={r.training} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", borderTop: `1px solid ${tokens.colorNeutralStroke2}` }}>
                          <Lightbulb16Filled style={{ color: "#5b5fc7", marginTop: "2px", flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <Text weight="semibold" size={200}>{r.training}</Text>
                            <Text size={100} style={{ display: "block", color: tokens.colorNeutralForeground3 }}>{r.provider} · {r.duration}</Text>
                          </div>
                          {enrolled ? (
                            <Text size={100} style={{ color: "#107c41", fontWeight: 600, whiteSpace: "nowrap" }}>✓ Enrolled</Text>
                          ) : (
                            <Button
                              size="small"
                              appearance="subtle"
                              style={{ fontSize: "11px", minWidth: 0, padding: "2px 8px" }}
                              onClick={() => handleEnrollTraining(r.training)}
                            >
                              Enroll
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </Card>
                );
              })}
          </div>
        </div>
      </div>

      {/* Edit Goal Dialog */}
      <Dialog open={!!state.editGoal} onOpenChange={(_, d) => { if (!d.open) dispatch({ type: 'CLOSE_EDIT_DIALOG' }); }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogContent>
              {state.editGoal && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
                  <div>
                    <Text weight="semibold" size={200} style={{ display: "block", marginBottom: "4px" }}>Goal</Text>
                    <Text size={300}>{state.editGoal.title}</Text>
                  </div>
                  <div>
                    <Text weight="semibold" size={200} style={{ display: "block", marginBottom: "4px" }}>Progress: {state.editProgress}%</Text>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={state.editProgress}
                      onChange={(_, d) => dispatch({ type: 'SET_EDIT_PROGRESS', progress: d.value })}
                    />
                  </div>
                  <div>
                    <Text weight="semibold" size={200} style={{ display: "block", marginBottom: "4px" }}>Status</Text>
                    <Dropdown
                      value={state.editStatus}
                      selectedOptions={[state.editStatus]}
                      onOptionSelect={(_, d) => dispatch({ type: 'SET_EDIT_STATUS', status: d.optionValue || "on-track" })}
                    >
                      <Option value="on-track">On Track</Option>
                      <Option value="behind">Behind</Option>
                      <Option value="completed">Completed</Option>
                    </Dropdown>
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={saveEditDialog}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </AppShell>
  );
};

export default MemberDevPlan;
