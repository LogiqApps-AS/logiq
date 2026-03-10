import {
  Text,
  Button,
  Card,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Person20Filled,
  People20Filled,
  ArrowLeft20Regular,
} from "@fluentui/react-icons";
import { Logo } from "../components/Logo";
import { useNavigate } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f0f6ff 0%, #e8eef7 50%, #fafafa 100%)",
  },
  container: {
    width: "500px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "40px 36px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e8e8e8",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "32px",
    gap: "12px",
  },
  roleCard: {
    padding: "24px",
    marginBottom: "16px",
    cursor: "pointer",
    border: "2px solid transparent",
    transition: "all 0.2s ease",
    ":hover": {
      borderColor: "#5b5fc7",
      backgroundColor: "#fafaff",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 16px rgba(91,95,199,0.15)",
    },
  },
  roleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  roleIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  leadIcon: {
    backgroundColor: "#e8ebf9",
    color: "#5b5fc7",
  },
  memberIcon: {
    backgroundColor: "#e0f2fe",
    color: "#0f6cbd",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "12px",
  },
  feature: {
    fontSize: "13px",
    color: tokens.colorNeutralForeground3,
    paddingLeft: "16px",
    position: "relative",
    "&::before": {
      content: '"•"',
      position: "absolute",
      left: "0",
      color: tokens.colorNeutralForeground3,
    },
  },
});


const DemoMode = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { setRole } = useRole();

  const handleRoleSelect = (role: "lead" | "member") => {
    setRole(role);
    navigate("/dashboard");
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <Button
          appearance="transparent"
          icon={<ArrowLeft20Regular />}
          onClick={() => navigate("/")}
          style={{ alignSelf: "flex-start", marginBottom: "8px", marginLeft: "-8px", color: "#616161" }}
        >
          Back to home
        </Button>
        
        <div className={styles.brand}>
          <Logo size={48} iconSize={24} />
          <Text weight="bold" size={600}>Choose Your Demo Role</Text>
          <Text size={300} style={{ color: "#616161", marginTop: "4px", textAlign: "center" }}>
            Select a role to explore LogIQ's features
          </Text>
        </div>

        <Card
          className={styles.roleCard}
          onClick={() => handleRoleSelect("lead")}
        >
          <div className={styles.roleHeader}>
            <div className={`${styles.roleIcon} ${styles.leadIcon}`}>
              <People20Filled />
            </div>
            <div>
              <Text weight="semibold" size={400}>Team Lead</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
                Magnus Lindqvist
              </Text>
            </div>
          </div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Manage your team, monitor wellbeing, and access strategic insights
          </Text>
          <div className={styles.featureList}>
            <div className={styles.feature}>Team Dashboard & Analytics</div>
            <div className={styles.feature}>Wellbeing & Risk Monitoring</div>
            <div className={styles.feature}>1:1 Planning & Prep</div>
            <div className={styles.feature}>Team Member Profiles</div>
          </div>
        </Card>

        <Card
          className={styles.roleCard}
          onClick={() => handleRoleSelect("member")}
        >
          <div className={styles.roleHeader}>
            <div className={`${styles.roleIcon} ${styles.memberIcon}`}>
              <Person20Filled />
            </div>
            <div>
              <Text weight="semibold" size={400}>Team Member</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>
                Alex Chen
              </Text>
            </div>
          </div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            Track your growth, receive personalized insights, and manage development
          </Text>
          <div className={styles.featureList}>
            <div className={styles.feature}>Personal Dashboard & Signals</div>
            <div className={styles.feature}>Development Plan & Goals</div>
            <div className={styles.feature}>360° Feedback</div>
            <div className={styles.feature}>AI Coach & Recommendations</div>
          </div>
        </Card>

        <Text size={200} style={{ color: tokens.colorNeutralForeground3, textAlign: "center", marginTop: "24px" }}>
          Demo mode includes full access to all features with sample data
        </Text>
      </div>
    </div>
  );
};

export default DemoMode;
