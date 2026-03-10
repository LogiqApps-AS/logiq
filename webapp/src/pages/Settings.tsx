import { PageHeader } from "../components/PageHeader";
import {
  Text,
  Card,
  Switch,
  Divider,
  Badge,
  tokens,
  makeStyles,
  shorthands,
  Button,
  Dropdown,
  Option,
} from "@fluentui/react-components";
import {
  Mail20Regular,
  People20Regular,
  BrainCircuit20Regular,
  Alert20Regular,
  CalendarLtr20Regular,
  ShieldCheckmark20Regular,
  DocumentBulletList20Regular,
  Chat20Regular,
  ArrowSync20Regular,
  Info16Regular,
} from "@fluentui/react-icons";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { useRole } from "../contexts/RoleContext";

const useStyles = makeStyles({
  container: {
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto",
  },
  section: {
    marginBottom: "28px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  sectionBadge: {
    fontSize: "10px",
    fontWeight: 600,
  },
  card: {
    padding: "0",
    ...shorthands.overflow("hidden"),
  },
  featureRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    gap: "16px",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  featureInfo: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    flex: 1,
    minWidth: 0,
  },
  featureIcon: {
    flexShrink: 0,
    marginTop: "2px",
    color: tokens.colorBrandForeground1,
  },
  featureText: {
    flex: 1,
    minWidth: 0,
  },
  featureDesc: {
    color: tokens.colorNeutralForeground3,
    display: "block",
    marginTop: "2px",
    lineHeight: "1.4",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke2),
  },
  syncInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: tokens.colorNeutralForeground3,
  },
  dropdownRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke2),
  },
});

interface FeatureToggle {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultOn: boolean;
  category: "ai-agents" | "communication" | "privacy";
}

const leadFeatures: FeatureToggle[] = [
  {
    id: "weekly-overview",
    label: "Proactive Weekly Team Overview",
    description: "AI generates a weekly summary of team health, risks, and recommended actions — delivered every Monday.",
    icon: <DocumentBulletList20Regular />,
    defaultOn: true,
    category: "ai-agents",
  },
  {
    id: "teams-channel",
    label: "Use Teams for Proactive Agent Communication",
    description: "AI agents send proactive alerts and nudges directly to your Teams channel instead of in-app only.",
    icon: <Chat20Regular />,
    defaultOn: false,
    category: "communication",
  },
  {
    id: "churn-alerts",
    label: "Real-Time Churn Risk Alerts",
    description: "Get notified immediately when an employee's churn probability crosses the 60% threshold.",
    icon: <Alert20Regular />,
    defaultOn: true,
    category: "ai-agents",
  },
  {
    id: "auto-prep",
    label: "Auto-Generate 1:1 Prep Notes",
    description: "AI pre-fills talking points, signals, and recommendations before each scheduled 1:1 meeting.",
    icon: <CalendarLtr20Regular />,
    defaultOn: true,
    category: "ai-agents",
  },
  {
    id: "wellbeing-digest",
    label: "Wellbeing Trend Digest",
    description: "Bi-weekly AI report on team wellbeing trends, overtime patterns, and burnout indicators.",
    icon: <BrainCircuit20Regular />,
    defaultOn: false,
    category: "ai-agents",
  },
  {
    id: "email-summaries",
    label: "Email Summary Notifications",
    description: "Receive critical signal summaries via email when you haven't checked LogIQ in 48+ hours.",
    icon: <Mail20Regular />,
    defaultOn: false,
    category: "communication",
  },
  {
    id: "skills-gap-alerts",
    label: "Skills Gap Detection",
    description: "AI monitors skill assessments and flags widening gaps with recommended learning paths.",
    icon: <People20Regular />,
    defaultOn: true,
    category: "ai-agents",
  },
  {
    id: "anonymous-signals",
    label: "Anonymous Signal Collection",
    description: "Allow team members to submit wellbeing and feedback signals anonymously. Identities are never revealed.",
    icon: <ShieldCheckmark20Regular />,
    defaultOn: true,
    category: "privacy",
  },
];

const memberFeatures: FeatureToggle[] = [
  {
    id: "coach-nudges",
    label: "AI Coach Weekly Nudges",
    description: "Receive personalized growth tips and wellbeing check-ins from your AI coach every week.",
    icon: <BrainCircuit20Regular />,
    defaultOn: true,
    category: "ai-agents",
  },
  {
    id: "teams-coach",
    label: "Coach Nudges via Teams",
    description: "Get AI coach messages and reminders as Teams chat messages instead of in-app notifications.",
    icon: <Chat20Regular />,
    defaultOn: false,
    category: "communication",
  },
  {
    id: "learning-reminders",
    label: "Learning Goal Reminders",
    description: "Weekly reminders about your dev plan progress and upcoming learning deadlines.",
    icon: <CalendarLtr20Regular />,
    defaultOn: true,
    category: "ai-agents",
  },
  {
    id: "prep-suggestions",
    label: "1:1 Prep Suggestions",
    description: "AI suggests talking points and questions before your 1:1 with your manager.",
    icon: <DocumentBulletList20Regular />,
    defaultOn: true,
    category: "ai-agents",
  },
  {
    id: "anonymous-feedback",
    label: "Anonymous Signal Submission",
    description: "Submit wellbeing and feedback signals anonymously. Your identity is never shared with your manager.",
    icon: <ShieldCheckmark20Regular />,
    defaultOn: true,
    category: "privacy",
  },
];

const categoryLabels: Record<string, { label: string; color: "brand" | "informative" | "success" }> = {
  "ai-agents": { label: "AI Agents", color: "brand" },
  "communication": { label: "Channels", color: "informative" },
  "privacy": { label: "Privacy", color: "success" },
};

const Settings = () => {
  const styles = useStyles();
  const { role } = useRole();
  const features = role === "lead" ? leadFeatures : memberFeatures;

  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(features.map((f) => [f.id, f.defaultOn]))
  );

  // Reset toggles when role changes
  const [prevRole, setPrevRole] = useState(role);
  if (role !== prevRole) {
    setPrevRole(role);
    setToggles(Object.fromEntries(features.map((f) => [f.id, f.defaultOn])));
  }
  const [teamsChannel, setTeamsChannel] = useState("general");
  const [digestFrequency, setDigestFrequency] = useState("weekly");

  const toggle = (id: string) => setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  const grouped = features.reduce<Record<string, FeatureToggle[]>>((acc, f) => {
    (acc[f.category] = acc[f.category] || []).push(f);
    return acc;
  }, {});

  return (
    <AppShell>
      <div className={styles.container}>
        <PageHeader title="Settings" subtitle="Configure AI agents, notification channels, and privacy preferences." />

        {Object.entries(grouped).map(([category, items]) => {
          const cat = categoryLabels[category];
          return (
            <div key={category} className={styles.section}>
              <div className={styles.sectionHeader}>
                <Text weight="semibold" size={400}>
                  {cat.label}
                </Text>
                <Badge appearance="filled" color={cat.color} className={styles.sectionBadge}>
                  {items.filter((i) => toggles[i.id]).length}/{items.length} active
                </Badge>
              </div>

              <Card className={styles.card}>
                {items.map((feature, idx) => (
                  <div key={feature.id}>
                    {idx > 0 && <Divider style={{ margin: 0 }} />}
                    <div className={styles.featureRow}>
                      <div className={styles.featureInfo}>
                        <span className={styles.featureIcon}>{feature.icon}</span>
                        <div className={styles.featureText}>
                          <Text weight="semibold" size={300}>
                            {feature.label}
                          </Text>
                          <Text size={200} className={styles.featureDesc}>
                            {feature.description}
                          </Text>
                        </div>
                      </div>
                      <Switch
                        checked={toggles[feature.id]}
                        onChange={() => toggle(feature.id)}
                      />
                    </div>

                    {/* Extra config for Teams channel */}
                    {feature.id === "teams-channel" && toggles["teams-channel"] && (
                      <div className={styles.dropdownRow}>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, whiteSpace: "nowrap" }}>
                          Teams Channel:
                        </Text>
                        <Dropdown
                          size="small"
                          value={teamsChannel}
                          onOptionSelect={(_, d) => setTeamsChannel(d.optionValue || "general")}
                          style={{ minWidth: "180px" }}
                        >
                          <Option value="general">General</Option>
                          <Option value="leadership">Leadership</Option>
                          <Option value="hr-alerts">HR Alerts</Option>
                          <Option value="custom">Custom Channel...</Option>
                        </Dropdown>
                      </div>
                    )}

                    {/* Extra config for wellbeing digest frequency */}
                    {feature.id === "wellbeing-digest" && toggles["wellbeing-digest"] && (
                      <div className={styles.dropdownRow}>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, whiteSpace: "nowrap" }}>
                          Frequency:
                        </Text>
                        <Dropdown
                          size="small"
                          value={digestFrequency}
                          onOptionSelect={(_, d) => setDigestFrequency(d.optionValue || "weekly")}
                          style={{ minWidth: "180px" }}
                        >
                          <Option value="weekly">Weekly</Option>
                          <Option value="biweekly">Bi-weekly</Option>
                          <Option value="monthly">Monthly</Option>
                        </Dropdown>
                      </div>
                    )}
                  </div>
                ))}

                {/* Sync status footer */}
                {category === "communication" && (
                  <div className={styles.statusRow}>
                    <div className={styles.syncInfo}>
                      <ArrowSync20Regular style={{ fontSize: "14px" }} />
                      <Text size={200}>Last synced: Today, 09:14 AM</Text>
                    </div>
                    <Button size="small" appearance="subtle" icon={<Info16Regular />}>
                      Connection Status
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
};

export default Settings;
