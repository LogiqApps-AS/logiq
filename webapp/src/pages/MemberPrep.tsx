import { useState, useCallback } from "react";
import { PageHeader } from "../components/PageHeader";
import { Text, Card, makeStyles, tokens, Spinner, Button } from "@fluentui/react-components";
import { TextBulletListSquare20Regular, Lightbulb20Regular, Trophy20Regular, QuestionCircle20Regular, Sparkle20Regular, ArrowSync20Regular } from "@fluentui/react-icons";
import { PageContainer } from "../components/PageContainer";
import { useMemberDashboard } from "../hooks/useApiData";
import { apiClient, type ConversationPrep } from "@/lib/api";

const MEMBER_ID = "1";
const TEAM_ID = "team1";

const useStyles = makeStyles({
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", "@media (max-width: 800px)": { gridTemplateColumns: "1fr" } },
  sectionCard: { padding: "24px" },
  sectionHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
  sectionIcon: { width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  listItem: { display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px", lineHeight: "1.5", fontSize: "13px", color: tokens.colorNeutralForeground2 },
  bullet: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, marginTop: "7px" },
  contextBlock: { padding: "16px", backgroundColor: tokens.colorNeutralBackground3, borderRadius: "8px", marginBottom: "20px" },
  actions: { marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" },
});

const MemberPrep: React.FC = () => {
  const styles = useStyles();
  const { data: dashboard, isLoading } = useMemberDashboard(MEMBER_ID, TEAM_ID);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState<string | null>(null);
  const [generatedPrep, setGeneratedPrep] = useState<ConversationPrep | null>(null);

  const handleGeneratePrep = useCallback(async () => {
    setPrepLoading(true);
    setPrepError(null);
    try {
      const result = await apiClient.getMemberPrep(MEMBER_ID, TEAM_ID);
      setGeneratedPrep(result);
    } catch (e) {
      setPrepError(e instanceof Error ? e.message : "Failed to generate prep");
    } finally {
      setPrepLoading(false);
    }
  }, []);

  const usePrep = generatedPrep !== null;
  const sections = usePrep && generatedPrep
    ? [
        { title: "Your Topics", icon: <TextBulletListSquare20Regular />, iconBg: "#e8ebf9", iconColor: "#5b5fc7", bulletColor: "#5b5fc7", items: generatedPrep.suggestedTopics ?? [] },
        { title: "Coach Tips", icon: <Lightbulb20Regular />, iconBg: "#fff4ce", iconColor: "#f7630c", bulletColor: "#f7630c", items: generatedPrep.coachTips ?? [] },
        { title: "Follow-up Actions", icon: <ArrowSync20Regular />, iconBg: "#e8ebf9", iconColor: "#5b5fc7", bulletColor: "#5b5fc7", items: generatedPrep.followUpActions ?? [] },
        { title: "Questions to Ask", icon: <QuestionCircle20Regular />, iconBg: "#fff4ce", iconColor: "#f7630c", bulletColor: "#f7630c", items: generatedPrep.questionsToAsk ?? [] },
      ]
    : [
        { title: "Your Topics", icon: <TextBulletListSquare20Regular />, iconBg: "#e8ebf9", iconColor: "#5b5fc7", bulletColor: "#5b5fc7", items: dashboard?.prepTopics ?? [] },
        { title: "Coach Tips", icon: <Lightbulb20Regular />, iconBg: "#fff4ce", iconColor: "#f7630c", bulletColor: "#f7630c", items: dashboard?.coachTips ?? [] },
        { title: "Your Wins", icon: <Trophy20Regular />, iconBg: "#dff6dd", iconColor: "#107c41", bulletColor: "#107c41", items: dashboard?.wins ?? [] },
        { title: "Questions to Ask", icon: <QuestionCircle20Regular />, iconBg: "#fff4ce", iconColor: "#f7630c", bulletColor: "#f7630c", items: dashboard?.questionsToAsk ?? [] },
      ];

  if (isLoading && !usePrep) {
    return (
      <PageContainer>
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Spinner label="Loading prep..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="1000px">
      <PageHeader
        title="1:1 Prep Assistant"
        subtitle="Prepare for your next meeting with your team lead"
        actions={
          <Button
            appearance="primary"
            icon={<Sparkle20Regular />}
            onClick={handleGeneratePrep}
            disabled={prepLoading}
          >
            {prepLoading ? "Generating…" : "Generate prep"}
          </Button>
        }
      />
      {prepError && (
        <Text style={{ color: tokens.colorPaletteRedForeground1, display: "block", marginBottom: "16px" }}>{prepError}</Text>
      )}
      {usePrep && generatedPrep?.contextSummary && (
        <div className={styles.contextBlock}>
          <Text weight="semibold" size={200} style={{ display: "block", marginBottom: "8px" }}>Context</Text>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{generatedPrep.contextSummary}</Text>
        </div>
      )}
      <div className={styles.grid}>
        {sections.map((section) => (
          <Card key={section.title} className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon} style={{ backgroundColor: section.iconBg, color: section.iconColor }}>{section.icon}</span>
              <Text weight="bold" size={400}>{section.title}</Text>
            </div>
            {section.items.length === 0 ? (
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>No items</Text>
            ) : (
              section.items.map((item) => (
                <div key={item} className={styles.listItem}>
                  <span className={styles.bullet} style={{ backgroundColor: section.bulletColor }} />
                  <span>{item}</span>
                </div>
              ))
            )}
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default MemberPrep;
