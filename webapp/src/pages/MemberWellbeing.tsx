import { useState } from "react";
import {
  Text,
  Card,
  Button,
  makeStyles,
  tokens,
  ProgressBar,
  RadioGroup,
  Radio,
  Divider,
} from "@fluentui/react-components";
import {
  HeartPulse20Filled,
  Checkmark20Regular,
  Clock20Regular,
  CalendarClock20Regular,
  ArrowTrending20Regular,
} from "@fluentui/react-icons";
import { PageContainer } from "../components/PageContainer";
import { PageHeader } from "../components/PageHeader";

const useStyles = makeStyles({
  container: { maxWidth: "900px", margin: "0 auto", width: "100%" },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "24px",
    "@media (max-width: 700px)": { gridTemplateColumns: "repeat(2, 1fr)" },
  },
  statusCard: { padding: "20px", textAlign: "center" },
  statusScore: { fontSize: "36px", fontWeight: 700, lineHeight: "1" },
  statusLabel: { textTransform: "uppercase", letterSpacing: "0.5px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", marginTop: "24px" },
  checkInCard: { padding: "20px", marginBottom: "12px" },
  questionRow: { marginBottom: "16px" },
  resultCard: { padding: "16px", marginBottom: "10px" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    "@media (max-width: 700px)": { gridTemplateColumns: "1fr" },
  },
});

const wellbeingMetrics = [
  { label: "Overall", score: 42, color: "#d13438" },
  { label: "Work-Life Balance", score: 55, color: "#f7630c" },
  { label: "Stress Level", score: 38, color: "#d13438" },
  { label: "Energy", score: 50, color: "#f7630c" },
];

const checkInQuestions = [
  { id: "q1", question: "How would you rate your energy level this week?", options: ["Very Low", "Low", "Moderate", "High", "Very High"] },
  { id: "q2", question: "How manageable is your current workload?", options: ["Overwhelming", "Heavy", "Just Right", "Light", "Too Light"] },
  { id: "q3", question: "How supported do you feel by your team?", options: ["Not at all", "Slightly", "Moderately", "Very", "Extremely"] },
  { id: "q4", question: "How is your work-life balance right now?", options: ["Very Poor", "Poor", "Okay", "Good", "Excellent"] },
];

const pastResults = [
  { date: "March 3, 2026", overall: 42, trend: "down" as const, highlights: ["High stress from overtime", "Meeting load above comfort level", "Sleep quality declining"] },
  { date: "February 24, 2026", overall: 48, trend: "down" as const, highlights: ["Workload increased significantly", "Missed workout routines", "Positive team recognition helped"] },
  { date: "February 17, 2026", overall: 58, trend: "stable" as const, highlights: ["Balanced week overall", "Good focus time", "Slight concern about upcoming deadlines"] },
];

const tips = [
  { icon: "🧘", title: "Try a 5-minute mindfulness break", desc: "Short breaks between meetings can reduce stress by 23%." },
  { icon: "📅", title: "Block focus time on your calendar", desc: "You have 18h of meetings — try protecting 2h blocks for deep work." },
  { icon: "🏃", title: "Move more during the day", desc: "A 15-min walk after lunch improves afternoon energy by 30%." },
  { icon: "💤", title: "Prioritize sleep recovery", desc: "Aim for 7+ hours — it directly impacts cognitive performance." },
];

const MemberWellbeing: React.FC = () => {
  const styles = useStyles();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <PageContainer>
      <div className={styles.container}>
        <PageHeader title="Well-Being" subtitle="Track your wellbeing, complete check-ins, and view personalized recommendations" />

        <div className={styles.statusGrid}>
          {wellbeingMetrics.map((m) => (
            <Card key={m.label} className={styles.statusCard}>
              <HeartPulse20Filled style={{ color: m.color, marginBottom: "8px" }} />
              <div className={styles.statusScore} style={{ color: m.color }}>{m.score}</div>
              <Text size={100} className={styles.statusLabel} style={{ color: tokens.colorNeutralForeground3 }}>{m.label}</Text>
            </Card>
          ))}
        </div>

        <div className={styles.twoCol}>
          <div>
            <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
              <Text size={500} weight="bold">Weekly Check-In</Text>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#fff4ce", color: "#f7630c" }}>Due Today</span>
            </div>

            <Card className={styles.checkInCard}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <Checkmark20Regular style={{ color: "#107c41", fontSize: "32px", marginBottom: "8px" }} />
                  <Text weight="semibold" size={400} style={{ display: "block", color: "#107c41" }}>Check-in submitted!</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Thank you. Your responses are confidential.</Text>
                </div>
              ) : (
                <>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginBottom: "16px" }}>
                    Your responses are confidential and help LogIQ personalize your experience.
                  </Text>
                  {checkInQuestions.map((q) => (
                    <div key={q.id} className={styles.questionRow}>
                      <Text weight="semibold" size={300} style={{ display: "block", marginBottom: "6px" }}>{q.question}</Text>
                      <RadioGroup
                        layout="horizontal"
                        value={answers[q.id] || ""}
                        onChange={(_, data) => setAnswers((prev) => ({ ...prev, [q.id]: data.value }))}
                      >
                        {q.options.map((opt) => (
                          <Radio key={opt} value={opt} label={opt} />
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                  <Button appearance="primary" onClick={handleSubmit} disabled={Object.keys(answers).length < checkInQuestions.length} style={{ marginTop: "8px" }}>
                    Submit Check-In
                  </Button>
                </>
              )}
            </Card>
          </div>

          <div>
            <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
              <Text size={500} weight="bold">Personalized Tips</Text>
            </div>
            {tips.map((tip) => (
              <Card key={tip.title} style={{ padding: "14px 16px", marginBottom: "10px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "20px" }}>{tip.icon}</span>
                  <div>
                    <Text weight="semibold" size={300}>{tip.title}</Text>
                    <Text size={200} style={{ display: "block", color: tokens.colorNeutralForeground3, marginTop: "2px" }}>{tip.desc}</Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className={styles.sectionHeader}>
          <Text size={500} weight="bold">Past Check-In Results</Text>
        </div>
        {pastResults.map((r) => (
          <Card key={r.date} className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarClock20Regular style={{ color: tokens.colorNeutralForeground3 }} />
                <Text weight="semibold" size={300}>{r.date}</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Text weight="bold" size={400} style={{ color: r.overall >= 60 ? "#107c41" : r.overall >= 45 ? "#f7630c" : "#d13438" }}>{r.overall}</Text>
                <ArrowTrending20Regular style={{ color: r.trend === "down" ? "#d13438" : "#107c41", fontSize: "16px", transform: r.trend === "down" ? "scaleY(-1)" : "none" }} />
              </div>
            </div>
            <ProgressBar value={r.overall / 100} thickness="large" color={r.overall >= 60 ? "success" : r.overall >= 45 ? "warning" : "error"} style={{ marginBottom: "8px" }} />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {r.highlights.map((h) => (
                <span key={h} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "4px", backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground2 }}>{h}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default MemberWellbeing;
