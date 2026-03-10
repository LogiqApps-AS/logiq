import { PageHeader } from "../components/PageHeader";
import {
  Text,
  Card,
  makeStyles,
  shorthands,
  tokens,
  Tab,
  TabList,
  Button,
} from "@fluentui/react-components";
import {
  Money20Regular,
  HeartPulse20Filled,
  Warning20Filled,
  PersonAlert20Filled,
  Shield20Filled,
  ArrowTrendingLines20Filled,
  ArrowRight16Regular,
  ShieldCheckmark20Regular,
  Circle12Filled,
  Warning16Filled,
  Sparkle20Filled,
  ArrowTrendingDown20Regular,
  PeopleCommunity20Regular,
  CalendarClock20Regular,
} from "@fluentui/react-icons";
import { useState } from "react";
import { PageContainer } from "../components/PageContainer";
import { CopilotInsightsDialog } from "../components/CopilotInsightsDialog";
import { useNavigate } from "react-router-dom";
import { useTabParam } from "../hooks/useTabParam";
import { useEmployees, useSignals } from "../hooks/useApiData";
import {
  ErrorState,
  SkeletonBlock,
  SignalsSkeleton,
  FinancialSummarySkeleton,
} from "../components/LoadingState";

const useStyles = makeStyles({
  copilotCard: {
    padding: "20px 24px",
    marginBottom: "20px",
    ...shorthands.border("1px", "solid", "#d1e4ff"),
    backgroundColor: "#f0f6ff",
    borderRadius: "8px",
  },
  copilotHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
  copilotIcon: { color: "#0f6cbd" },
  insightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
    gap: "12px", marginTop: "12px",
  },
  insightItem: {
    display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px",
    backgroundColor: "#fff", borderRadius: "6px",
    ...shorthands.border("1px", "solid", "#e8e8e8"),
  },
  insightIcon: { flexShrink: 0, marginTop: "2px" },
  summaryRow: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px",
    "@media (max-width: 640px)": { gridTemplateColumns: "1fr" },
  },
  summaryCard: { padding: "20px" },
  summaryLabel: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" },
  summaryValue: { fontSize: "32px", fontWeight: 700, lineHeight: "1" },
  tableWrapper: {
    overflowX: "auto", borderRadius: "8px",
    border: "1px solid #e8e8e8", backgroundColor: "#fff",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: {
    padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "10px",
    textTransform: "uppercase", letterSpacing: "0.5px",
    color: tokens.colorNeutralForeground3, borderBottom: "1px solid #e8e8e8", whiteSpace: "nowrap",
  },
  td: { padding: "14px 16px", borderBottom: "1px solid #f5f5f5", whiteSpace: "nowrap" },
  nameCell: { display: "flex", alignItems: "center", gap: "8px" },
  warningIcon: { color: "#d13438", flexShrink: 0 },
  signalsList: { display: "flex", flexDirection: "column", gap: "12px" },
  signalCard: { paddingTop: "16px", paddingBottom: "16px", paddingLeft: "20px", paddingRight: "20px" },
  signalCritical: { borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#d13438" },
  signalWarning: { borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#f7630c" },
  signalInfo: { borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#0078d4" },
  signalTitleRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" },
  signalFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" },
});

const iconMap: Record<string, React.ReactNode> = {
  HeartPulse: <HeartPulse20Filled />,
  Warning: <Warning20Filled />,
  ArrowTrending: <ArrowTrendingLines20Filled />,
  PersonAlert: <PersonAlert20Filled />,
  Shield: <Shield20Filled />,
};

const typeColors: Record<string, string> = { critical: "#d13438", warning: "#f7630c", info: "#0078d4" };

const getScoreColor = (score: number) => {
  if (score >= 70) return "#107c10";
  if (score >= 50) return "#f7630c";
  return "#d13438";
};

const getChurnColor = (percent: number) => {
  if (percent >= 60) return "#d13438";
  if (percent >= 30) return "#f7630c";
  return "#107c10";
};

const WellbeingRisks = () => {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useTabParam("churn");
  const [insightsOpen, setInsightsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: employees, isLoading: empLoading, isError: empError, refetch: refetchEmp } = useEmployees();
  const { data: signals, isLoading: sigLoading, isError: sigError, refetch: refetchSig } = useSignals();

  const isLoading = empLoading || sigLoading;

  const sorted = employees ? [...employees].sort((a, b) => b.churnPercent - a.churnPercent) : [];
  const atRiskEmployees = employees?.filter((e) => e.churnRisk === "At risk") ?? [];
  const atRiskCount = atRiskEmployees.length;

  const totalChurnExposure = employees
    ? employees.filter((e) => e.churnRisk === "At risk" || e.churnRisk === "Medium").reduce((sum, e) => sum + e.replacementCost, 0)
    : 0;

  const avgAbsenceCost = employees ? Math.round(employees.reduce((sum, e) => sum + e.sickDays * 450, 0)) : 0;

  const avgPreventability = employees
    ? Math.round(employees.reduce((sum, e) => sum + e.preventabilityScore, 0) / employees.length)
    : 0;

  const criticalSignalCount = signals?.filter((s) => s.type === "critical").length ?? 0;

  return (
    <PageContainer>
        <PageHeader title="Wellbeing & Risks" subtitle="Monitor team signals and churn exposure" />

        {/* Copilot Summary */}
        {isLoading ? (
          <div style={{ marginBottom: "20px" }}>
            <Card style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <SkeletonBlock width="20px" height="20px" borderRadius="50%" />
                <SkeletonBlock width="120px" height="16px" />
                <SkeletonBlock width="70px" height="18px" borderRadius="10px" />
              </div>
              <SkeletonBlock width="100%" height="14px" style={{ marginBottom: "6px" }} />
              <SkeletonBlock width="85%" height="14px" style={{ marginBottom: "16px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonBlock key={i} width="100%" height="80px" />
                ))}
              </div>
            </Card>
          </div>
        ) : empError ? (
          <ErrorState message="Failed to load employee data." onRetry={() => refetchEmp()} />
        ) : (
          <div className={styles.copilotCard}>
            <div className={styles.copilotHeader}>
              <Sparkle20Filled className={styles.copilotIcon} />
              <Text weight="semibold" size={400}>Copilot Insights</Text>
              <span style={{ display: "inline-flex", alignItems: "center", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#e8ebf9", color: "#5b5fc7" }}>AI Summary</span>
            </div>
            <Text size={300} style={{ color: tokens.colorNeutralForeground2, lineHeight: "1.6" }}>
              Your team has <Text weight="semibold" style={{ color: "#d13438" }}>{atRiskCount} employees at elevated churn risk</Text> with
              a combined exposure of <Text weight="semibold" style={{ color: "#d13438" }}>${(totalChurnExposure / 1000).toFixed(0)}k</Text>.
              {" "}The primary drivers are declining wellbeing scores and workload imbalance. Preventability sits
              at <Text weight="semibold" style={{ color: "#107c10" }}>{avgPreventability}%</Text>, suggesting targeted interventions could significantly reduce attrition.
            </Text>
            <div className={styles.insightGrid}>
              <div className={styles.insightItem}>
                <ArrowTrendingDown20Regular className={styles.insightIcon} style={{ color: "#d13438" }} />
                <div>
                  <Text weight="semibold" size={300}>Wellbeing Declining</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "2px" }}>
                    2 team members dropped below threshold in the last 30 days. Sick leave is up 200% for Alex Chen.
                  </Text>
                </div>
              </div>
              <div className={styles.insightItem}>
                <PeopleCommunity20Regular className={styles.insightIcon} style={{ color: "#f7630c" }} />
                <div>
                  <Text weight="semibold" size={300}>Engagement Gap</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "2px" }}>
                    Psychological safety score dropped 12% across the team. Consider addressing communication patterns.
                  </Text>
                </div>
              </div>
              <div className={styles.insightItem}>
                <CalendarClock20Regular className={styles.insightIcon} style={{ color: "#0f6cbd" }} />
                <div>
                  <Text weight="semibold" size={300}>Recommended Action</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "2px" }}>
                    Schedule 1:1s with Alex Chen and David Kim this week. Focus on workload redistribution and career development.
                  </Text>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <Button appearance="transparent" size="small" icon={<ArrowRight16Regular />} iconPosition="after" style={{ color: "#0f6cbd" }} onClick={() => setInsightsOpen(true)}>
                See full analysis
              </Button>
            </div>
          </div>
        )}

        <CopilotInsightsDialog
          open={insightsOpen}
          onClose={() => setInsightsOpen(false)}
          atRiskEmployees={atRiskEmployees}
          totalChurnExposure={totalChurnExposure}
          avgPreventability={avgPreventability}
          onNavigateToPrep={() => { setInsightsOpen(false); navigate("/prep"); }}
          onNavigateToProfile={(id) => { setInsightsOpen(false); navigate(`/teams/1/members/${id}`); }}
        />

        <TabList selectedValue={activeTab} onTabSelect={(_, d) => setActiveTab(d.value as string)} style={{ marginBottom: "20px" }}>
          <Tab value="signals">Signals</Tab>
          <Tab value="churn">Churn Risk</Tab>
        </TabList>

        {activeTab === "churn" && (
          empLoading ? <FinancialSummarySkeleton /> :
          empError ? <ErrorState message="Failed to load churn data." onRetry={() => refetchEmp()} /> :
          <>
            <div className={styles.summaryRow}>
              <Card className={styles.summaryCard}>
                <div className={styles.summaryLabel}>
                  <Money20Regular style={{ color: "#d13438" }} />
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>Churn Exposure</Text>
                </div>
                <span className={styles.summaryValue} style={{ color: "#d13438" }}>${(totalChurnExposure / 1000).toFixed(0)}k</span>
              </Card>
              <Card className={styles.summaryCard}>
                <div className={styles.summaryLabel}>
                  <HeartPulse20Filled style={{ color: "#f7630c" }} />
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>Absence Cost</Text>
                </div>
                <span className={styles.summaryValue} style={{ color: "#f7630c" }}>${(avgAbsenceCost / 1000).toFixed(0)}k</span>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>/yr</Text>
              </Card>
              <Card className={styles.summaryCard}>
                <div className={styles.summaryLabel}>
                  <ShieldCheckmark20Regular style={{ color: "#107c10" }} />
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>Preventability</Text>
                </div>
                <span className={styles.summaryValue} style={{ color: "#107c10" }}>{avgPreventability}%</span>
              </Card>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Employee</th>
                    <th className={styles.th}>Churn Risk</th>
                    <th className={styles.th}>Wellbeing</th>
                    <th className={styles.th}>Motivation</th>
                    <th className={styles.th} style={{ textAlign: "right" }}>Est. Replace Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((emp) => {
                    const isHighRisk = emp.churnPercent >= 60;
                    return (
                      <tr key={emp.id}>
                        <td className={styles.td}>
                          <div className={styles.nameCell}>
                            {isHighRisk && <Warning16Filled className={styles.warningIcon} />}
                            <div>
                              <Text weight="semibold" size={300}>{emp.name}</Text>
                              <br />
                              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{emp.role}</Text>
                            </div>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <Text weight="bold" style={{ color: getChurnColor(emp.churnPercent) }}>{emp.churnPercent}%</Text>
                        </td>
                        <td className={styles.td}>
                          <Text style={{ color: getScoreColor(emp.wellbeing.score) }}>{emp.wellbeing.score}</Text>
                        </td>
                        <td className={styles.td}>
                          <Text style={{ color: getScoreColor(emp.motivation.score) }}>{emp.motivation.score}</Text>
                        </td>
                        <td className={styles.td} style={{ textAlign: "right" }}>
                          <Text>${(emp.replacementCost / 1000).toFixed(0)}k</Text>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "signals" && (
          sigLoading ? <SignalsSkeleton count={4} /> :
          sigError ? <ErrorState message="Failed to load signals." onRetry={() => refetchSig()} /> :
          <div className={styles.signalsList}>
            {signals!.map((signal) => {
              const borderClass =
                signal.type === "critical" ? styles.signalCritical :
                signal.type === "warning" ? styles.signalWarning : styles.signalInfo;
              return (
                <Card key={signal.id} className={`${styles.signalCard} ${borderClass}`}>
                  <div className={styles.signalTitleRow}>
                    <span style={{ color: typeColors[signal.type] }}>{iconMap[signal.icon] || <Warning20Filled />}</span>
                    <Text weight="bold" size={400}>{signal.title}</Text>
                    <Circle12Filled style={{ color: "#0078d4", fontSize: "8px" }} />
                  </div>
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: "1.5" }}>{signal.message}</Text>
                  <div className={styles.signalFooter}>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground4 }}>{signal.time}</Text>
                    {signal.actionLabel && (
                      <Button appearance="transparent" size="small" icon={<ArrowRight16Regular />} iconPosition="after" style={{ color: "#0f6cbd" }}>
                        {signal.actionLabel}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
    </PageContainer>
  );
};

export default WellbeingRisks;
