import { PageHeader } from "../components/PageHeader";
import {
  Text,
  Card,
  Persona,
  Button,
  Tooltip,
  makeStyles,
  shorthands,
  tokens,
  Tab,
  TabList,
  ProgressBar,
} from "@fluentui/react-components";
import {
  Warning16Filled,
  Sparkle20Filled,
  People20Regular,
  Trophy20Regular,
  ArrowTrendingDown20Regular,
  Lightbulb20Regular,
} from "@fluentui/react-icons";
import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTabParam } from "../hooks/useTabParam";
import { AppShell } from "../components/AppShell";
import SkillsTab from "../components/SkillsTab";
import DeliveryTab from "../components/DeliveryTab";
import { useEmployees } from "../hooks/useApiData";
import { TeamGridSkeleton, ErrorState } from "../components/LoadingState";
import { AIOverviewDialog } from "../components/AIOverviewDialog";
import type { Employee } from "../data/sampleData";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    "@media (max-width: 1024px)": { gridTemplateColumns: "repeat(2, 1fr)" },
    "@media (max-width: 640px)": { gridTemplateColumns: "1fr" },
  },
  card: { padding: "20px", paddingRight: "48px", cursor: "pointer", position: "relative" },
  cardAtRisk: { backgroundColor: "#fff8f6" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  scoresRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", textAlign: "center" },
  scoreLabel: { fontSize: "10px", textTransform: "uppercase", color: tokens.colorNeutralForeground3, letterSpacing: "0.5px", marginTop: "2px" },
  scoreValue: { fontSize: "20px", fontWeight: 700, lineHeight: "1.2" },
  churnRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginTop: "12px" },
  aiBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    minWidth: "auto",
    borderRadius: "8px",
    padding: "6px",
    backgroundColor: "#e8ebf9",
    color: "#5b5fc7",
    ":hover": { backgroundColor: "#d8dcf5" },
  },
  // AI Summary card
  summaryCard: {
    ...shorthands.border("1px", "solid", "#d8dcf5"),
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    backgroundColor: "#fafaff",
  },
  summaryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  summaryIcon: { color: "#5b5fc7" },
  summaryBadge: {
    display: "inline-flex",
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "4px",
    backgroundColor: "#e8ebf9",
    color: "#5b5fc7",
  },
  insightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginTop: "16px",
    "@media (max-width: 640px)": { gridTemplateColumns: "1fr" },
  },
  insightItem: {
    display: "flex",
    gap: "10px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
  },
  insightIcon: { flexShrink: 0, marginTop: "2px" },
});

const getScoreColor = (score: number) => {
  if (score >= 70) return "#107c10";
  if (score >= 50) return "#f7630c";
  return "#d13438";
};

function generateTeamSummary(employees: Employee[]) {
  const atRisk = employees.filter(e => e.churnRisk === "At risk");
  const avgSkills = Math.round(employees.reduce((s, e) => s + e.skills.score, 0) / employees.length);
  const avgWellbeing = Math.round(employees.reduce((s, e) => s + e.wellbeing.score, 0) / employees.length);
  const lowSkills = employees.filter(e => e.skills.score < 50);
  const topPerformers = employees.filter(e => e.delivery.score >= 85);
  const highOvertime = employees.filter(e => e.overtimeHours >= 15);
  const lowLearning = employees.filter(e => e.learningHours < 8);

  return { atRisk, avgSkills, avgWellbeing, lowSkills, topPerformers, highOvertime, lowLearning };
}

const FILTER_LABELS: Record<string, string> = {
  "at-risk": "At Risk",
  "medium-risk": "Medium Risk",
  "low-performers": "Low Performers",
  "high-overtime": "High Overtime",
  "low-wellbeing": "Low Wellbeing",
  "low-skills": "Low Skills",
  "top-performers": "Top Performers",
};

function applyFilter(employees: Employee[], filter: string | null): Employee[] {
  if (!filter) return employees;
  switch (filter) {
    case "at-risk": return employees.filter(e => e.churnRisk === "At risk");
    case "medium-risk": return employees.filter(e => e.churnRisk === "Medium" || e.churnRisk === "At risk");
    case "low-performers": return employees.filter(e => e.delivery.score < 60);
    case "high-overtime": return employees.filter(e => e.overtimeHours >= 15);
    case "low-wellbeing": return employees.filter(e => e.wellbeing.score < 60);
    case "low-skills": return employees.filter(e => e.skills.score < 60);
    case "top-performers": return employees.filter(e => e.delivery.score >= 85);
    default: return employees;
  }
}

const MyTeam = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useTabParam("people");
  const { data: employees, isLoading, isError, refetch } = useEmployees();
  const [aiEmployee, setAiEmployee] = useState<Employee | null>(null);

  const activeFilter = searchParams.get("filter");
  const filteredEmployees = useMemo(
    () => employees ? applyFilter(employees, activeFilter) : undefined,
    [employees, activeFilter]
  );
  const clearFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("filter");
      return next;
    }, { replace: true });
  };

  const summary = employees ? generateTeamSummary(employees) : null;

  return (
    <AppShell>
      <div style={{ maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        <PageHeader title="My Team" subtitle={employees ? `${employees.length} team members` : "Loading..."} />

        <TabList selectedValue={activeTab} onTabSelect={(_, d) => setActiveTab(d.value as string)} style={{ marginBottom: "20px" }}>
          <Tab value="people">People</Tab>
          <Tab value="skills">Skills</Tab>
          <Tab value="delivery">Delivery</Tab>
        </TabList>

        {activeTab === "people" && (
          isLoading ? <TeamGridSkeleton /> :
          isError ? <ErrorState message="Failed to load team data." onRetry={() => refetch()} /> :
          <>
            {/* AI Team Summary */}
            {summary && (
              <div className={styles.summaryCard}>
                <div className={styles.summaryHeader}>
                  <Sparkle20Filled className={styles.summaryIcon} />
                  <Text weight="semibold" size={400}>Team Insights</Text>
                  <span className={styles.summaryBadge}>AI Summary</span>
                </div>
                <Text size={300} style={{ color: tokens.colorNeutralForeground2, lineHeight: "1.6" }}>
                  Your team of <Text weight="semibold">{employees!.length} members</Text> has an average skills score of{" "}
                  <Text weight="semibold" style={{ color: summary.avgSkills >= 70 ? "#107c41" : "#f7630c" }}>{summary.avgSkills}</Text> and wellbeing at{" "}
                  <Text weight="semibold" style={{ color: summary.avgWellbeing >= 70 ? "#107c41" : "#f7630c" }}>{summary.avgWellbeing}</Text>.
                  {summary.atRisk.length > 0 && (
                    <> There {summary.atRisk.length === 1 ? "is" : "are"}{" "}
                      <Text weight="semibold" style={{ color: "#d13438" }}>{summary.atRisk.length} employee{summary.atRisk.length > 1 ? "s" : ""} at risk</Text> requiring immediate attention.
                    </>
                  )}
                  {summary.topPerformers.length > 0 && (
                    <> <Text weight="semibold" style={{ color: "#107c41" }}>{summary.topPerformers.length} top performers</Text> are driving strong delivery outcomes.</>
                  )}
                </Text>

                <div className={styles.insightGrid}>
                  {summary.lowSkills.length > 0 && (
                    <div className={styles.insightItem}>
                      <ArrowTrendingDown20Regular className={styles.insightIcon} style={{ color: "#d13438" }} />
                      <div>
                        <Text weight="semibold" size={300}>Skills Gap</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "2px" }}>
                          {summary.lowSkills.map(e => e.name).join(", ")} {summary.lowSkills.length === 1 ? "has" : "have"} skills below 50. Consider pairing with senior mentors.
                        </Text>
                      </div>
                    </div>
                  )}
                  {summary.highOvertime.length > 0 && (
                    <div className={styles.insightItem}>
                      <People20Regular className={styles.insightIcon} style={{ color: "#f7630c" }} />
                      <div>
                        <Text weight="semibold" size={300}>Workload Alert</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "2px" }}>
                          {summary.highOvertime.map(e => e.name).join(", ")} averaging 15+ overtime hours/week. Rebalance tasks to prevent burnout.
                        </Text>
                      </div>
                    </div>
                  )}
                  {summary.topPerformers.length > 0 && (
                    <div className={styles.insightItem}>
                      <Trophy20Regular className={styles.insightIcon} style={{ color: "#107c41" }} />
                      <div>
                        <Text weight="semibold" size={300}>Top Performers</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "2px" }}>
                          {summary.topPerformers.map(e => e.name).join(", ")} — recognize contributions and explore growth opportunities.
                        </Text>
                      </div>
                    </div>
                  )}
                  {summary.lowLearning.length > 0 && (
                    <div className={styles.insightItem}>
                      <Lightbulb20Regular className={styles.insightIcon} style={{ color: "#5b5fc7" }} />
                      <div>
                        <Text weight="semibold" size={300}>Learning Deficit</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "2px" }}>
                          {summary.lowLearning.length} team member{summary.lowLearning.length > 1 ? "s" : ""} under 8h/month on learning. Allocate dedicated development time.
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active filter badge */}
            {activeFilter && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", padding: "10px 16px", borderRadius: "8px", backgroundColor: "#e8ebf9" }}>
                <Text size={300} weight="semibold" style={{ color: "#5b5fc7" }}>
                  Filtered: {FILTER_LABELS[activeFilter] || activeFilter}
                </Text>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                  ({filteredEmployees?.length || 0} of {employees!.length} members)
                </Text>
                <Button appearance="subtle" size="small" onClick={clearFilter} style={{ marginLeft: "auto", color: "#5b5fc7" }}>
                  Clear Filter
                </Button>
              </div>
            )}

            <div className={styles.grid}>
            {(filteredEmployees || employees!).map((emp) => {
              const isAtRisk = emp.churnRisk === "At risk";
              return (
                <Card key={emp.id} className={`${styles.card} ${isAtRisk ? styles.cardAtRisk : ""}`} onClick={() => navigate(`/teams/1/members/${emp.id}`)}>
                  <div className={styles.header}>
                    <Persona
                      name={emp.name}
                      secondaryText={`${emp.role} · ${emp.tenure}`}
                      size="medium"
                      avatar={{ color: isAtRisk ? "cranberry" : "brand" }}
                    />
                    {isAtRisk && (
                      <span title="At Risk" style={{ display: "inline-flex", alignItems: "center", gap: "3px", backgroundColor: "#fde7e9", color: "#d13438", fontSize: "11px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", whiteSpace: "nowrap", flexShrink: 0 }}>
                        <Warning16Filled style={{ fontSize: "12px" }} /> Risk
                      </span>
                    )}
                  </div>
                  <div className={styles.scoresRow}>
                    {(["wellbeing", "skills", "motivation", "delivery"] as const).map((key) => (
                      <div key={key}>
                        <div className={styles.scoreValue} style={{ color: getScoreColor(emp[key].score) }}>{emp[key].score}</div>
                        <div className={styles.scoreLabel}>{key === "wellbeing" ? "Well-being" : key.charAt(0).toUpperCase() + key.slice(1)}</div>
                      </div>
                    ))}
                  </div>
                  {(emp.churnRisk === "At risk" || emp.churnRisk === "Medium") && (
                    <div className={styles.churnRow}>
                      <Text size={200}>Churn Risk</Text>
                      <div style={{ flex: 1 }}>
                        <ProgressBar value={emp.churnPercent / 100} thickness="large" color={emp.churnRisk === "At risk" ? "error" : "warning"} />
                      </div>
                      <Text size={300} weight="bold" style={{ color: emp.churnRisk === "At risk" ? "#d13438" : "#f7630c" }}>{emp.churnPercent}%</Text>
                    </div>
                  )}
                  <Tooltip content="AI Overview" relationship="label">
                    <Button
                      className={styles.aiBtn}
                      appearance="subtle"
                      icon={<Sparkle20Filled />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAiEmployee(emp);
                      }}
                    />
                  </Tooltip>
                </Card>
              );
            })}
          </div>
          </>
        )}

        {activeTab === "skills" && <SkillsTab />}
        {activeTab === "delivery" && <DeliveryTab />}
      </div>

      <AIOverviewDialog
        open={!!aiEmployee}
        onClose={() => setAiEmployee(null)}
        employee={aiEmployee}
      />
    </AppShell>
  );
};

export default MyTeam;
