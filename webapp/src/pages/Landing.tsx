import { Text, Button, makeStyles, mergeClasses, tokens, Badge } from "@fluentui/react-components";
import {
  BrainCircuit24Regular,
  BrainCircuit20Regular,
  Shield20Regular,
  PeopleTeam20Regular,
  ArrowRight20Regular,
  Alert20Regular,
  Flash20Regular,
  Timer20Regular,
  HeartPulse20Regular,
  PersonBoard20Regular,
  Rocket20Regular,
  DataUsage20Regular,
  PersonChat20Regular,
  ShieldCheckmark20Regular,
  Circle12Filled,
  CheckmarkCircle20Regular,
  Warning20Filled,
  Checkmark20Regular,
} from "@fluentui/react-icons";
import { Logo } from "../components/Logo";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTeamKPIs } from "../hooks/useApiData";
import { RevealSection, RevealItem } from "../components/RevealSection";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "56px",
    paddingLeft: "32px",
    paddingRight: "32px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e0e0e0",
    position: "sticky",
    top: "0",
    zIndex: 100,
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    "@media (max-width: 768px)": {
      display: "none",
    },
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "80px 32px 80px",
    background: "linear-gradient(180deg, #eef4ff 0%, #f5f0ff 50%, #fafafa 100%)",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "24px",
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    color: "#424242",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "28px",
  },
  heroBadgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#107c10",
  },
  heroTitle: {
    fontSize: "56px",
    fontWeight: 700,
    lineHeight: "1.1",
    color: "#242424",
    marginBottom: "20px",
    maxWidth: "780px",
    "@media (max-width: 768px)": {
      fontSize: "36px",
    },
  },
  heroGradientText: {
    background: "linear-gradient(90deg, #0f6cbd, #7b2ff2, #0f6cbd)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "18px",
    color: "#616161",
    maxWidth: "620px",
    lineHeight: "1.7",
    marginBottom: "36px",
  },
  heroActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  section: {
    padding: "80px 32px",
    maxWidth: "1100px",
    margin: "0 auto",
    "@media (max-width: 768px)": {
      padding: "48px 16px",
    },
  },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: 700,
    color: "#242424",
    textAlign: "center",
    marginBottom: "12px",
    "@media (max-width: 768px)": {
      fontSize: "28px",
    },
  },
  sectionSubtitle: {
    fontSize: "16px",
    color: "#616161",
    textAlign: "center",
    maxWidth: "600px",
    margin: "0 auto 48px",
    lineHeight: "1.6",
  },
  whyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  whyCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "28px 24px",
    border: "1px solid #e8e8e8",
    transition: "box-shadow 0.2s",
    ":hover": {
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    },
  },
  whyIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    backgroundColor: "#e8f0fe",
    color: "#0f6cbd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  agentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
    },
  },
  agentCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #e8e8e8",
    position: "relative",
  },
  agentBadge: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "3px 8px",
    borderRadius: "4px",
    marginBottom: "12px",
  },
  agentBadgeAnalyzer: {
    backgroundColor: "#e8f0fe",
    color: "#0f6cbd",
  },
  agentBadgeSynthesis: {
    backgroundColor: "#f3e8ff",
    color: "#7b2ff2",
  },
  agentBadgeCopilot: {
    backgroundColor: "#e6f7e6",
    color: "#107c10",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "16px",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
    "@media (max-width: 600px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },
  kpiCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px 20px",
    border: "1px solid #e8e8e8",
    textAlign: "center",
  },
  kpiScore: {
    fontSize: "42px",
    fontWeight: 700,
    lineHeight: "1",
    marginBottom: "8px",
  },
  signalsBg: {
    backgroundColor: "#f5f5f5",
    borderRadius: "16px",
    padding: "48px 32px",
    margin: "0 auto",
    maxWidth: "1100px",
  },
  signalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  signalCard: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    border: "1px solid #e8e8e8",
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
  },
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  roleCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #e8e8e8",
  },
  roleList: {
    listStyleType: "none",
    padding: 0,
    margin: "16px 0 0",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  roleListItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#424242",
  },
  ctaSection: {
    textAlign: "center",
    padding: "80px 32px",
    background: "linear-gradient(180deg, #fafafa 0%, #eef4ff 100%)",
  },
  footer: {
    textAlign: "center",
    padding: "24px 32px",
    borderTop: "1px solid #e0e0e0",
    backgroundColor: "#fff",
  },
});

const statusColors: Record<string, string> = {
  green: "#107c10",
  yellow: "#f7630c",
  red: "#d13438",
};

const agents = [
  {
    type: "analyzer",
    title: "Wellbeing & Risk Analyzer",
    desc: "Monitors sick leave patterns, psychological safety signals, and work-life balance indicators.",
    icon: <HeartPulse20Regular />,
  },
  {
    type: "analyzer",
    title: "Skills & Growth Analyzer",
    desc: "Tracks skill coverage, learning engagement, and IDP progress across the team.",
    icon: <PersonBoard20Regular />,
  },
  {
    type: "analyzer",
    title: "Delivery & Workload Analyzer",
    desc: "Analyzes sprint velocity, PR metrics, meeting load, and overtime patterns.",
    icon: <Rocket20Regular />,
  },
  {
    type: "synthesis",
    title: "Conversation Prep Agent",
    desc: "Synthesizes multi-signal insights into actionable 1:1 preparation briefs.",
    icon: <DataUsage20Regular />,
  },
  {
    type: "copilot",
    title: "People Partner Copilot",
    desc: "AI assistant for Team Leads with team-wide context and proactive recommendations.",
    icon: <PersonChat20Regular />,
  },
  {
    type: "copilot",
    title: "Development Coach",
    desc: "Private AI coach for Team Members — career guidance, learning paths, and wellbeing support.",
    icon: <ShieldCheckmark20Regular />,
  },
];

const signalExamples = [
  { title: "Sick Leave Spike", who: "Alex Chen · 2h ago", color: "#d13438" },
  { title: "Workload Levels", who: "David Kim · 6h ago", color: "#f7630c" },
  { title: "Team Trust Declining", who: "Team · 1d ago", color: "#0078d4" },
];

const navSections = ["features", "architecture", "kpis", "roles"];

const Landing = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");
  const { data: kpiData } = useTeamKPIs();

  const kpis = [
    { label: "Well-being Index", data: kpiData?.wellbeing },
    { label: "Skills & Development", data: kpiData?.skills },
    { label: "Motivation Index", data: kpiData?.motivation },
    { label: "Churn & Retention", data: kpiData?.churn },
    { label: "Delivery & Workload", data: kpiData?.delivery },
  ];

  useEffect(() => {
    const handleScroll = () => {
      let current = "";
      for (const id of navSections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.nav}>
        <div className={styles.navBrand}>
          <Logo size={36} iconSize={20} />
          <Text weight="bold" size={500}>
            LogIQ
          </Text>
        </div>
        <div className={styles.navLinks}>
          {[
            { id: "features", label: "Features" },
            { id: "architecture", label: "Architecture" },
            { id: "kpis", label: "KPIs" },
            { id: "roles", label: "Roles" },
          ].map((item) => (
            <Button
              key={item.id}
              appearance="subtle"
              size="small"
              as="a"
              href={`#${item.id}`}
              style={
                activeSection === item.id
                  ? { color: "#0f6cbd", fontWeight: 600, borderBottom: "2px solid #0f6cbd", borderRadius: 0 }
                  : {}
              }
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className={styles.navActions}>
          <Button appearance="subtle" onClick={() => navigate("/signin")}>
            Sign In
          </Button>
          <Button
            appearance="primary"
            icon={<ArrowRight20Regular />}
            iconPosition="after"
            onClick={() => navigate("/demo")}
          >
            Get Started
          </Button>
        </div>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroBadge} style={{ animation: "fade-in 0.6s ease-out forwards" }}>
          <div className={styles.heroBadgeDot} />
          AI Multi-Agent People Intelligence
        </div>
        <h1 className={styles.heroTitle} style={{ animation: "fade-in 0.7s ease-out 0.15s forwards", opacity: 0 }}>
          <span className={styles.heroGradientText}>Intelligence</span> for High-Performing Teams
        </h1>
        <p className={styles.heroSubtitle} style={{ animation: "fade-in 0.7s ease-out 0.3s forwards", opacity: 0 }}>
          LogIQ proactively surfaces risks, signals, and coaching — powered by 6 AI agents that monitor well-being,
          skills, motivation, retention, and delivery in real-time.
        </p>
        <div className={styles.heroActions} style={{ animation: "fade-in 0.7s ease-out 0.45s forwards", opacity: 0 }}>
          <Button
            appearance="primary"
            size="large"
            icon={<ArrowRight20Regular />}
            iconPosition="after"
            onClick={() => navigate("/demo")}
          >
            Get Started
          </Button>
          <Button
            appearance="outline"
            size="large"
            onClick={() => {
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            See How It Works
          </Button>
        </div>
      </div>

      <RevealSection id="features" className={styles.section}>
        <h2 className={styles.sectionTitle}>Why Traditional HRBP is Too Reactive</h2>
        <p className={styles.sectionSubtitle}>
          HR teams discover burnout, churn, and disengagement <em>after</em> it happens. LogIQ detects signals{" "}
          <em>before</em> they become problems.
        </p>
        <div className={styles.whyGrid}>
          {[
            {
              icon: <Alert20Regular />,
              title: "Proactive, Not Reactive",
              desc: "AI agents continuously analyze signals and surface actionable insights before issues escalate.",
            },
            {
              icon: <Flash20Regular />,
              title: "Signal-First UX",
              desc: "Critical alerts appear front-and-center — not buried in dashboards. Every signal has a clear action.",
            },
            {
              icon: <Shield20Regular />,
              title: "Privacy by Design",
              desc: `Team Members get private coaching. Team Leads get team-level insights. Strict role boundaries.`,
            },
          ].map((f, i) => (
              <RevealItem key={f.title} delay={i * 0.12} className={mergeClasses(styles.whyCard, "hover-lift")}>
              <div className={styles.whyIcon}>{f.icon}</div>
              <Text weight="semibold" size={400} block style={{ marginBottom: "8px" }}>
                {f.title}
              </Text>
              <Text size={300} style={{ color: "#616161", lineHeight: "1.6" }}>
                {f.desc}
              </Text>
            </RevealItem>
          ))}
        </div>
      </RevealSection>

      <div id="architecture" style={{ backgroundColor: "#f5f5f5", padding: "80px 32px" }}>
        <RevealSection style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 className={styles.sectionTitle}>6-Agent Architecture</h2>
          <p className={styles.sectionSubtitle}>
            Three background analyzers feed a synthesis layer, which powers two role-specific copilots.
          </p>
          <div className={styles.agentGrid}>
            {agents.map((a, i) => (
              <RevealItem key={a.title} delay={i * 0.08} className={mergeClasses(styles.agentCard, "hover-lift")}>
                <span
                  className={mergeClasses(
                    styles.agentBadge,
                    a.type === "analyzer"
                      ? styles.agentBadgeAnalyzer
                      : a.type === "synthesis"
                      ? styles.agentBadgeSynthesis
                      : styles.agentBadgeCopilot
                  )}
                >
                  {a.type}
                </span>
                <Text weight="semibold" size={400} block style={{ marginBottom: "8px" }}>
                  {a.title}
                </Text>
                <Text size={300} style={{ color: "#616161", lineHeight: "1.6" }}>
                  {a.desc}
                </Text>
              </RevealItem>
            ))}
          </div>
        </RevealSection>
      </div>

      <RevealSection id="kpis" className={styles.section}>
        <h2 className={styles.sectionTitle}>5 Intelligence Dimensions</h2>
        <p className={styles.sectionSubtitle}>
          Every team is scored across five critical KPIs with drill-down sub-metrics and threshold-based alerting.
        </p>
        <div className={styles.kpiGrid}>
          {kpis.map((k, i) => (
            <RevealItem key={k.label} delay={i * 0.1} className={mergeClasses(styles.kpiCard, "hover-lift")}>
              <div className={styles.kpiScore} style={{ color: k.data ? statusColors[k.data.status] : "#999" }}>
                {k.data?.score ?? "—"}
              </div>
              <Text size={300} style={{ color: "#616161" }}>
                {k.label}
              </Text>
            </RevealItem>
          ))}
        </div>
      </RevealSection>

      <RevealSection className={styles.section}>
        <h2 className={styles.sectionTitle}>Signals Before Dashboards</h2>
        <p className={styles.sectionSubtitle}>
          Critical issues surface immediately. Each signal has context, rationale, and a clear next action.
        </p>
        <div className={styles.signalGrid}>
          {signalExamples.map((s, i) => (
            <RevealItem
              key={s.title}
              delay={i * 0.12}
              className={mergeClasses(styles.signalCard, "hover-lift")}
              style={{ borderLeftColor: s.color }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Warning20Filled style={{ color: s.color }} />
                <Text weight="semibold" size={400}>
                  {s.title}
                </Text>
              </div>
              <Text size={200} style={{ color: "#999" }}>
                {s.who}
              </Text>
            </RevealItem>
          ))}
        </div>
      </RevealSection>

      <div id="roles" style={{ backgroundColor: "#f5f5f5", padding: "80px 32px" }}>
        <RevealSection style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 className={styles.sectionTitle}>Two Experiences, One Platform</h2>
          <p className={styles.sectionSubtitle}>&nbsp;</p>
          <div className={styles.rolesGrid}>
            <RevealItem delay={0} className={mergeClasses(styles.roleCard, "hover-lift")}>
              <Text weight="bold" size={500} block style={{ marginBottom: "8px" }}>
                Team Lead
              </Text>
              <Text size={300} style={{ color: "#616161", lineHeight: "1.6" }}>
                Team health dashboards, risk signals, 1:1 prep, churn prevention, skills search, AI copilot.
              </Text>
              <ul className={styles.roleList}>
                {[
                  "Proactive risk alerts",
                  "Conversation preparation",
                  "Cost-of-attrition analysis",
                  "Team workload rebalancing",
                ].map((item) => (
                  <li key={item} className={styles.roleListItem}>
                    <CheckmarkCircle20Regular style={{ color: "#0f6cbd", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </RevealItem>
            <RevealItem delay={0.15} className={mergeClasses(styles.roleCard, "hover-lift")}>
              <Text weight="bold" size={500} block style={{ marginBottom: "8px" }}>
                Team Member
              </Text>
              <Text size={300} style={{ color: "#616161", lineHeight: "1.6" }}>
                Personal growth, private coaching, skills gaps, learning paths, IDP tracking, 1:1 prep.
              </Text>
              <ul className={styles.roleList}>
                {[
                  "Private AI coaching",
                  "Skills gap analysis",
                  "Learning recommendations",
                  "Development plan tracking",
                ].map((item) => (
                  <li key={item} className={styles.roleListItem}>
                    <CheckmarkCircle20Regular style={{ color: "#107c10", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </RevealItem>
          </div>
        </RevealSection>
      </div>

      <RevealSection className={styles.ctaSection}>
        <h2 className={styles.sectionTitle}>Ready to See LogIQ in Action?</h2>
        <p style={{ fontSize: "16px", color: "#616161", marginBottom: "28px" }}>
          Experience proactive people intelligence. No setup required.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            appearance="primary"
            size="large"
            icon={<ArrowRight20Regular />}
            iconPosition="after"
            onClick={() => navigate("/demo")}
          >
            Try Interactive Demo
          </Button>
          <Button appearance="outline" size="large" onClick={() => navigate("/signup")}>
            Create Account
          </Button>
        </div>
      </RevealSection>

      <div className={styles.footer}>
        <Text size={200} style={{ color: "#999" }}>
          © 2026 LogIQ · Intelligence for Teams · Built on Microsoft 365
        </Text>
      </div>
    </div>
  );
};

export default Landing;
