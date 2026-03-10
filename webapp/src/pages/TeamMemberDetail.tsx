import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Persona,
  Button,
  Tab,
  TabList,
  ProgressBar,
  Spinner,
} from "@fluentui/react-components";
import {
  ArrowLeft20Regular,
  Chat20Regular,
  Warning16Filled,
  Star16Filled,
  Star16Regular,
  CheckmarkCircle16Filled,
  Clock16Regular,
  Building16Regular,
  Certificate16Regular,
  ChevronRight12Regular,
} from "@fluentui/react-icons";
import {
  Building20Regular,
  Star20Regular,
  Warning20Regular,
} from "@fluentui/react-icons";
import { useParams, useNavigate } from "react-router-dom";
import { useTabParam } from "../hooks/useTabParam";
import { AppShell } from "../components/AppShell";
import { useEmployee, useMemberDetail } from "../hooks/useApiData";
import { EmptyState } from "../components/EmptyState";

const useStyles = makeStyles({
  backLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    color: tokens.colorNeutralForeground2,
    backgroundColor: "transparent",
    ...shorthands.border("0px"),
    padding: "0px",
    marginBottom: "20px",
    fontSize: "14px",
    ":hover": { color: tokens.colorNeutralForeground1 },
  },
  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px 24px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  profileInfo: {
    flex: 1,
    minWidth: "200px",
  },
  skillBadge: {
    display: "inline-flex",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "4px",
    marginRight: "4px",
    marginTop: "4px",
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "12px",
    marginBottom: "16px",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
  kpiCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 12px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "10px",
    gap: "4px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "20px",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "10px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  tabContent: {
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sectionCard: {
    padding: "16px 20px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "10px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  feedbackCard: {
    padding: "16px 20px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "10px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
    },
  },
  strengthItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: tokens.colorNeutralForeground2,
    marginTop: "4px",
  },
  growthItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: tokens.colorNeutralForeground2,
    marginTop: "4px",
  },
  threeColGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "12px",
  },
  signalCard: {
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid",
  },
  signalCritical: {
    backgroundColor: "#fff0f0",
    borderColor: "#ffd7d7",
  },
  signalWarning: {
    backgroundColor: "#fff9f0",
    borderColor: "#ffe0b2",
  },
  roleTimeline: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  roleDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    marginTop: "4px",
    flexShrink: 0,
  },
});

const getScoreColor = (score: number) => {
  if (score >= 80) return "#107c41";
  if (score >= 60) return "#f7630c";
  return "#d13438";
};

const kpiEmojis = ["💚", "🌸", "🔥", "🍪", "⚠️"];
const kpiLabels = ["WELL-BEING", "SKILLS", "MOTIVATION", "DELIVERY", "CHURN RISK"];

interface StarRatingProps {
  rating: number;
  max?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, max = 5 }) => (
  <>
    {Array.from({ length: max }, (_, i) => {
      const starIndex = i;
      return i < rating
        ? <Star16Filled key={`filled-${starIndex}`} style={{ color: "#f7b731" }} />
        : <Star16Regular key={`regular-${starIndex}`} style={{ color: "#d1d1d1" }} />;
    })}
  </>
);

const TeamMemberDetail = () => {
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useTabParam("projects");

  const { data: emp, isLoading: empLoading } = useEmployee(id ?? "");
  const { data: detail, isLoading: detailLoading } = useMemberDetail(id ?? "");

  if (empLoading || detailLoading) {
    return (
      <AppShell>
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Spinner size="large" label="Loading member profile..." />
        </div>
      </AppShell>
    );
  }

  if (!emp || !detail) {
    return (
      <AppShell>
        <Text size={500}>Employee not found</Text>
      </AppShell>
    );
  }

  const scores = [emp.wellbeing.score, emp.skills.score, emp.motivation.score, emp.delivery.score, emp.churnPercent + "%"];

  return (
    <AppShell>
      <div style={{ maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        {/* Back link */}
        <button className={styles.backLink} onClick={() => navigate("/team")}>
          <ArrowLeft20Regular /> Back to Team
        </button>

        {/* Profile header */}
        <div className={styles.profileCard}>
          <Persona
            name={emp.name}
            secondaryText={`${emp.role} · ${detail.department} · ${emp.tenure}`}
            tertiaryText={detail.previousRole ? `Previously: ${detail.previousRole} (${detail.previousRolePeriod})` : undefined}
            size="huge"
            avatar={{ color: emp.churnRisk === "At risk" ? "cranberry" : "brand" }}
            presence={emp.churnRisk === "At risk" ? { status: "busy" } : { status: "available" }}
          />
          <div className={styles.profileInfo}>
            <div style={{ marginTop: "6px" }}>
              {detail.skills.map((s) => (
                <span key={s} className={styles.skillBadge}>{s}</span>
              ))}
            </div>
          </div>
          <Button
            appearance="primary"
            icon={<Chat20Regular />}
          >
            Prepare 1:1
          </Button>
        </div>

        {/* KPI Scores */}
        <div className={styles.kpiGrid}>
          {scores.map((score, i) => (
            <div key={kpiLabels[i]} className={styles.kpiCard}>
              <span style={{ fontSize: "20px" }}>{kpiEmojis[i]}</span>
              <Text
                size={700}
                weight="bold"
                style={{ color: i < 4 ? getScoreColor(Number(score)) : (Number(String(score).replace("%", "")) >= 50 ? "#d13438" : "#f7630c") }}
              >
                {score}
              </Text>
              <Text size={100} style={{ color: tokens.colorNeutralForeground3, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {kpiLabels[i]}
              </Text>
            </div>
          ))}
        </div>

        {/* Stat cards */}
        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <Warning16Filled style={{ color: "#d13438" }} />
            <div>
              <Text weight="bold" size={500}>{detail.activeSignalsCount}</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>Active Signals</Text>
            </div>
          </div>
          <div className={styles.statCard}>
            <Star16Filled style={{ color: "#f7b731" }} />
            <div>
              <Text weight="bold" size={500}>{detail.feedbackScoreAvg.toFixed(1)}</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>Feedback Score</Text>
            </div>
          </div>
          <div className={styles.statCard}>
            <Clock16Regular style={{ color: "#0f6cbd" }} />
            <div>
              <Text weight="bold" size={500}>{detail.trainingHoursTotal}</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>Training Hours</Text>
            </div>
          </div>
          <div className={styles.statCard}>
            <Building16Regular style={{ color: "#5b5fc7" }} />
            <div>
              <Text weight="bold" size={500}>{detail.projectCount}</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>Projects</Text>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <TabList
          selectedValue={activeTab}
          onTabSelect={(_, d) => setActiveTab(d.value as string)}
          style={{ marginBottom: "4px" }}
        >
          <Tab value="projects" icon={<Building16Regular />}>Projects</Tab>
          <Tab value="feedback" icon={<Star16Regular />}>Feedback</Tab>
          <Tab value="training" icon={<Clock16Regular />}>Training</Tab>
          <Tab value="signals" icon={<Warning16Filled />}>Signals</Tab>
          <Tab value="career">Career</Tab>
        </TabList>

        <div className={styles.tabContent}>
          {/* PROJECTS TAB */}
          {activeTab === "projects" && (
            detail.projects.length > 0 ? detail.projects.map((p) => (
            <div key={p.id} className={styles.sectionCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <Text weight="bold" size={400}>{p.title}</Text>
                <span style={{ display: "inline-flex", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", backgroundColor: p.status === "Active" ? "#e8ebf9" : "#dff6dd", color: p.status === "Active" ? "#5b5fc7" : "#107c41", whiteSpace: "nowrap" }}>
                  {p.status}
                </span>
              </div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
                {p.role} · {p.period}
              </Text>
              <Text size={300} style={{ display: "block", marginTop: "8px", color: tokens.colorNeutralForeground2 }}>
                {p.description}
              </Text>
              <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {p.skills.map((s) => (
                  <span key={s} style={{
                    padding: "2px 10px", borderRadius: "12px", fontSize: "11px",
                    border: `1px solid ${tokens.colorNeutralStroke2}`, color: tokens.colorNeutralForeground2,
                  }}>{s}</span>
                ))}
              </div>
            </div>
            )) : <EmptyState icon={<Building20Regular />} title="No projects yet" description="This team member has not been assigned to any projects." />
          )}

          {/* FEEDBACK TAB */}
          {activeTab === "feedback" && (
            detail.feedback.length > 0 ? detail.feedback.map((f) => (
            <div key={f.id} className={styles.feedbackCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ display: "inline-flex", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", whiteSpace: "nowrap", backgroundColor: f.type === "Manager" ? "#dff6dd" : f.type === "Self" ? "#e8ebf9" : "#e8ebf9", color: f.type === "Manager" ? "#107c41" : "#5b5fc7" }}>
                    {f.type}
                  </span>
                  <Text weight="semibold" size={300}>{f.reviewerName}</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>· {f.reviewerRole}</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <StarRating rating={f.rating} />
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, marginLeft: "8px" }}>{f.date}</Text>
                </div>
              </div>
              <Text size={300} style={{ display: "block", color: tokens.colorNeutralForeground2, fontStyle: "italic", marginBottom: "12px" }}>
                {f.comment}
              </Text>
              <div className={styles.twoColGrid}>
                <div>
                  <Text size={200} weight="bold" style={{ color: "#107c41", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Strengths
                  </Text>
                  {f.strengths.map((s) => (
                    <div key={s} className={styles.strengthItem}>
                      <CheckmarkCircle16Filled style={{ color: "#107c41" }} /> {s}
                    </div>
                  ))}
                </div>
                <div>
                  <Text size={200} weight="bold" style={{ color: "#f7630c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Growth Areas
                  </Text>
                  {f.growthAreas.map((g) => (
                    <div key={g} className={styles.growthItem}>
                      <ChevronRight12Regular /> {g}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )) : <EmptyState icon={<Star20Regular />} title="No feedback received" description="No peer or manager feedback has been submitted for this team member yet." />
          )}

          {/* TRAINING TAB */}
          {activeTab === "training" && (
            <>
              <div className={styles.threeColGrid}>
                <div className={styles.kpiCard}>
                  <CheckmarkCircle16Filled style={{ color: "#107c41", fontSize: "20px" }} />
                  <Text weight="bold" size={600}>{detail.training.filter((t) => t.status === "Completed").length}</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Completed</Text>
                </div>
                <div className={styles.kpiCard}>
                  <Clock16Regular style={{ color: "#0f6cbd", fontSize: "20px" }} />
                  <Text weight="bold" size={600}>{detail.training.filter((t) => t.status === "In Progress").length}</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>In Progress</Text>
                </div>
                <div className={styles.kpiCard}>
                  <Clock16Regular style={{ color: "#5b5fc7", fontSize: "20px" }} />
                  <Text weight="bold" size={600}>{detail.trainingHoursTotal}h</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Total Hours</Text>
                </div>
              </div>
              {detail.training.map((t) => (
                <div key={t.id} className={styles.sectionCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Certificate16Regular style={{ color: "#5b5fc7" }} />
                      <Text weight="bold" size={400}>{t.title}</Text>
                      <span style={{ display: "inline-flex", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", whiteSpace: "nowrap", backgroundColor: t.status === "Completed" ? "#dff6dd" : t.status === "In Progress" ? "#e8ebf9" : "#f0f0f0", color: t.status === "Completed" ? "#107c41" : t.status === "In Progress" ? "#5b5fc7" : "#616161" }}>
                        {t.status}
                      </span>
                    </div>
                    {t.score && (
                      <Text weight="bold" size={400} style={{ color: "#107c41" }}>{t.score}%</Text>
                    )}
                  </div>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "4px" }}>
                    {t.provider} · {t.tags.join(" · ")}
                  </Text>
                  <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      ⏱ {t.hours}h
                    </Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      Started: {t.startDate}
                    </Text>
                    {t.completedDate && (
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        Completed: {t.completedDate}
                      </Text>
                    )}
                  </div>
                  {t.status === "In Progress" && (
                    <ProgressBar
                      value={0.4}
                      thickness="large"
                      color="brand"
                      style={{ marginTop: "10px" }}
                    />
                  )}
                </div>
              ))}
            </>
          )}

          {/* SIGNALS TAB */}
          {activeTab === "signals" && (
            detail.signals.length > 0 ? detail.signals.map((s) => (
            <div
              key={s.id}
              className={`${styles.signalCard} ${s.severity === "critical" ? styles.signalCritical : styles.signalWarning}`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Warning16Filled style={{ color: s.severity === "critical" ? "#d13438" : "#f7630c" }} />
                  <Text weight="bold" size={300}>{s.title}</Text>
                </div>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{s.timeAgo}</Text>
              </div>
              <Text size={300} style={{ color: tokens.colorNeutralForeground2, display: "block" }}>
                {s.description}
              </Text>
            </div>
            )) : <EmptyState icon={<Warning20Regular />} title="No active signals" description="There are no alerts or signals for this team member right now." />
          )}

          {/* CAREER TAB */}
          {activeTab === "career" && (
            <>
              <div className={styles.sectionCard}>
                <Text weight="bold" size={400} style={{ display: "block", marginBottom: "16px" }}>
                  📈 Role History
                </Text>
                {detail.roleHistory.map((r) => (
                  <div key={`${r.title}-${r.period}`} className={styles.roleTimeline}>
                    <div
                      className={styles.roleDot}
                      style={{ backgroundColor: r.current ? "#5b5fc7" : "#c8c8c8" }}
                    />
                    <div>
                      <Text weight="semibold" size={300}>{r.title}</Text>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
                        {r.department} · {r.period} · {r.duration}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
              {detail.certifications.length > 0 && (
                <div className={styles.sectionCard}>
                  <Text weight="bold" size={400} style={{ display: "block", marginBottom: "12px" }}>
                    🏅 Certifications & Achievements
                  </Text>
                  {detail.certifications.map((c) => (
                    <div key={c.title} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <Certificate16Regular style={{ color: "#f7b731" }} />
                      <div>
                        <Text weight="semibold" size={300}>{c.title}</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
                          {c.provider} · {c.status}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default TeamMemberDetail;
