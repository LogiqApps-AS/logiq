import { useState } from "react";
import {
  Text,
  Card,
  Button,
  makeStyles,
  tokens,
  Textarea,
  Checkbox,
  Divider,
  Avatar,
  ProgressBar,
} from "@fluentui/react-components";
import {
  PersonFeedback20Regular,
  Send20Regular,
  Star20Filled,
  Star20Regular,
  ShieldLock20Regular,
  Checkmark20Regular,
} from "@fluentui/react-icons";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/PageHeader";

const useStyles = makeStyles({
  container: { maxWidth: "900px", margin: "0 auto", width: "100%" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "24px",
    "@media (max-width: 600px)": { gridTemplateColumns: "1fr" },
  },
  statCard: { padding: "20px", textAlign: "center" },
  statValue: { fontSize: "32px", fontWeight: 700, lineHeight: "1" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", marginTop: "24px" },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    "@media (max-width: 700px)": { gridTemplateColumns: "1fr" },
  },
  feedbackCard: { padding: "16px", marginBottom: "12px" },
  feedbackHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" },
  requestCard: { padding: "20px" },
  skillRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" },
});

const feedbackStats = [
  { label: "Overall Score", value: "76", color: "#5b5fc7" },
  { label: "Feedback Received", value: "12", color: "#107c41" },
  { label: "Pending Requests", value: "2", color: "#f7630c" },
];

interface FeedbackItem {
  id: string;
  from: string;
  anonymous: boolean;
  date: string;
  rating: number;
  strengths: string;
  improvements: string;
  category: string;
}

const recentFeedback: FeedbackItem[] = [
  {
    id: "f1",
    from: "Sarah Lin",
    anonymous: false,
    date: "March 5, 2026",
    rating: 4,
    strengths: "Great collaboration during sprint planning. Your technical suggestions were very insightful and helped the team avoid potential blockers.",
    improvements: "Consider sharing your ideas earlier in discussions — your input is valuable and others might build on it.",
    category: "Collaboration",
  },
  {
    id: "f2",
    from: "Anonymous",
    anonymous: true,
    date: "February 28, 2026",
    rating: 3,
    strengths: "Strong code quality and attention to detail in pull requests. Always provides helpful review comments.",
    improvements: "Could improve on communicating blockers earlier rather than trying to solve everything alone.",
    category: "Communication",
  },
  {
    id: "f3",
    from: "Tom Eriksen",
    anonymous: false,
    date: "February 20, 2026",
    rating: 5,
    strengths: "Excellent mentoring attitude. Helped onboard Emma and was patient and thorough with explanations.",
    improvements: "Keep investing in cloud architecture — it would strengthen the team's overall capabilities.",
    category: "Leadership",
  },
  {
    id: "f4",
    from: "Anonymous",
    anonymous: true,
    date: "February 14, 2026",
    rating: 4,
    strengths: "Reliable delivery and good at breaking down complex tasks into manageable pieces.",
    improvements: "Sometimes takes on too much — learning to delegate or ask for help would improve sustainability.",
    category: "Delivery",
  },
];

const skillRatings = [
  { skill: "Technical Expertise", avg: 4.2, count: 8 },
  { skill: "Communication", avg: 3.5, count: 10 },
  { skill: "Collaboration", avg: 4.0, count: 9 },
  { skill: "Problem Solving", avg: 4.4, count: 7 },
  { skill: "Leadership Potential", avg: 3.8, count: 6 },
];

const colleagues = [
  "Sarah Lin", "Tom Eriksen", "Lisa Wang", "Emma Nilsen", "Jonas Berg", "Priya Sharma", "Maria Santos",
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div style={{ display: "flex", gap: "2px" }}>
    {[1, 2, 3, 4, 5].map((num) =>
      num <= rating
        ? <Star20Filled key={`filled-${num}`} style={{ color: "#f7b731", fontSize: "16px" }} />
        : <Star20Regular key={`regular-${num}`} style={{ color: tokens.colorNeutralStroke1, fontSize: "16px" }} />
    )}
  </div>
);

const Feedback360: React.FC = () => {
  const styles = useStyles();
  const [requestMessage, setRequestMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedColleagues, setSelectedColleagues] = useState<string[]>([]);
  const [requestSent, setRequestSent] = useState(false);

  const toggleColleague = (name: string) => {
    setSelectedColleagues((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSendRequest = () => {
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setRequestMessage("");
      setSelectedColleagues([]);
    }, 3000);
  };

  return (
    <AppShell>
      <div className={styles.container}>
        <PageHeader title="360 Feedback" subtitle="View feedback, request peer reviews, and track your growth areas" />

        {/* Stats */}
        <div className={styles.statsGrid}>
          {feedbackStats.map((s) => (
            <Card key={s.label} className={styles.statCard}>
              <PersonFeedback20Regular style={{ color: s.color, marginBottom: "8px" }} />
              <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</Text>
            </Card>
          ))}
        </div>

        <div className={styles.twoCol}>
          {/* Recent feedback */}
          <div>
            <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
              <Text size={500} weight="bold">Recent Feedback</Text>
            </div>
            {recentFeedback.map((fb) => (
              <Card key={fb.id} className={styles.feedbackCard}>
                <div className={styles.feedbackHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar
                      name={fb.anonymous ? "?" : fb.from}
                      size={32}
                      color={fb.anonymous ? "neutral" : "colorful"}
                      icon={fb.anonymous ? <ShieldLock20Regular /> : undefined}
                    />
                    <div>
                      <Text weight="semibold" size={300}>{fb.from}</Text>
                      <Text size={100} style={{ display: "block", color: tokens.colorNeutralForeground3 }}>{fb.date} · {fb.category}</Text>
                    </div>
                  </div>
                  <StarRating rating={fb.rating} />
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <Text size={200} weight="semibold" style={{ color: "#107c41" }}>Strengths: </Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{fb.strengths}</Text>
                </div>
                <div>
                  <Text size={200} weight="semibold" style={{ color: "#f7630c" }}>Growth area: </Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{fb.improvements}</Text>
                </div>
              </Card>
            ))}
          </div>

          {/* Request + Skill ratings */}
          <div>
            <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
              <Text size={500} weight="bold">Request Feedback</Text>
            </div>
            <Card className={styles.requestCard}>
              {requestSent ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <Checkmark20Regular style={{ color: "#107c41", fontSize: "32px", marginBottom: "8px" }} />
                  <Text weight="semibold" size={400} style={{ display: "block", color: "#107c41" }}>Request sent!</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                    {selectedColleagues.length} colleague{selectedColleagues.length !== 1 ? "s" : ""} will receive your feedback request.
                  </Text>
                </div>
              ) : (
                <>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginBottom: "12px" }}>
                    Select colleagues and send a feedback request. They can respond anonymously if they choose.
                  </Text>

                  <Text weight="semibold" size={300} style={{ display: "block", marginBottom: "8px" }}>Select colleagues</Text>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                    {colleagues.map((name) => (
                      <Button
                        key={name}
                        size="small"
                        appearance={selectedColleagues.includes(name) ? "primary" : "outline"}
                        onClick={() => toggleColleague(name)}
                        style={{ borderRadius: "16px" }}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>

                  <Text weight="semibold" size={300} style={{ display: "block", marginBottom: "6px" }}>Add a message (optional)</Text>
                  <Textarea
                    placeholder="e.g. I'd appreciate feedback on my recent project collaboration..."
                    value={requestMessage}
                    onChange={(_, d) => setRequestMessage(d.value)}
                    resize="vertical"
                    style={{ marginBottom: "12px" }}
                  />

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Checkbox
                      checked={isAnonymous}
                      onChange={(_, d) => setIsAnonymous(!!d.checked)}
                      label={
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <ShieldLock20Regular style={{ fontSize: "14px", color: "#5b5fc7" }} />
                          <Text size={200}>Allow anonymous responses</Text>
                        </span>
                      }
                    />
                    <Button
                      appearance="primary"
                      icon={<Send20Regular />}
                      disabled={selectedColleagues.length === 0}
                      onClick={handleSendRequest}
                    >
                      Send Request
                    </Button>
                  </div>
                </>
              )}
            </Card>

            <Divider style={{ margin: "20px 0" }} />

            <div className={styles.sectionHeader}>
              <Text size={500} weight="bold">Skill Ratings (Avg)</Text>
            </div>
            {skillRatings.map((s) => (
              <div key={s.skill} className={styles.skillRow}>
                <Text size={300} style={{ minWidth: "140px" }}>{s.skill}</Text>
                <div style={{ flex: 1 }}>
                  <ProgressBar value={s.avg / 5} thickness="large" color="brand" />
                </div>
                <Text weight="bold" size={300} style={{ minWidth: "30px", textAlign: "right" }}>{s.avg}</Text>
                <Text size={100} style={{ color: tokens.colorNeutralForeground3, minWidth: "40px" }}>({s.count})</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Feedback360;
