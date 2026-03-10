import { PageHeader } from "../components/PageHeader";
import { Text, Card, makeStyles, tokens, Spinner } from "@fluentui/react-components";
import { TextBulletListSquare20Regular, Lightbulb20Regular, Trophy20Regular, QuestionCircle20Regular } from "@fluentui/react-icons";
import { AppShell } from "../components/AppShell";
import { useMemberDashboard } from "../hooks/useApiData";

const useStyles = makeStyles({
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", "@media (max-width: 800px)": { gridTemplateColumns: "1fr" } },
  sectionCard: { padding: "24px" },
  sectionHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
  sectionIcon: { width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  listItem: { display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px", lineHeight: "1.5", fontSize: "13px", color: tokens.colorNeutralForeground2 },
  bullet: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, marginTop: "7px" },
});

const MemberPrep: React.FC = () => {
  const styles = useStyles();
  const { data: dashboard, isLoading } = useMemberDashboard("1");

  if (isLoading) {
    return (
      <AppShell>
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Spinner label="Loading prep..." />
        </div>
      </AppShell>
    );
  }

  const sections = [
    { title: "Your Topics", icon: <TextBulletListSquare20Regular />, iconBg: "#e8ebf9", iconColor: "#5b5fc7", bulletColor: "#5b5fc7", items: dashboard?.prepTopics ?? [] },
    { title: "Coach Tips", icon: <Lightbulb20Regular />, iconBg: "#fff4ce", iconColor: "#f7630c", bulletColor: "#f7630c", items: dashboard?.coachTips ?? [] },
    { title: "Your Wins", icon: <Trophy20Regular />, iconBg: "#dff6dd", iconColor: "#107c41", bulletColor: "#107c41", items: dashboard?.wins ?? [] },
    { title: "Questions to Ask", icon: <QuestionCircle20Regular />, iconBg: "#fff4ce", iconColor: "#f7630c", bulletColor: "#f7630c", items: dashboard?.questionsToAsk ?? [] },
  ];

  return (
    <AppShell>
      <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <PageHeader title="1:1 Prep Assistant" subtitle="Prepare for your next meeting with your team lead" />
        <div className={styles.grid}>
          {sections.map((section) => (
            <Card key={section.title} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} style={{ backgroundColor: section.iconBg, color: section.iconColor }}>{section.icon}</span>
                <Text weight="bold" size={400}>{section.title}</Text>
              </div>
              {section.items.map((item) => (
                <div key={item} className={styles.listItem}>
                  <span className={styles.bullet} style={{ backgroundColor: section.bulletColor }} />
                  <span>{item}</span>
                </div>
              ))}
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default MemberPrep;
