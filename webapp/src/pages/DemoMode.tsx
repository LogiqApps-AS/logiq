import {
  Text,
  Button,
  makeStyles,
  Label,
} from "@fluentui/react-components";
import {
  BrainCircuit24Regular,
  People20Regular,
  Person20Regular,
  ArrowRight20Regular,
} from "@fluentui/react-icons";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f0f6ff 0%, #e8eef7 50%, #fafafa 100%)",
  },
  card: {
    width: "440px",
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
  },
  brandIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#0f6cbd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    marginBottom: "12px",
  },
  roleCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    transitionProperty: "all",
    transitionDuration: "0.15s",
  },
  roleCardSelected: {
    border: "2px solid #0f6cbd",
    backgroundColor: "#f0f6ff",
  },
  roleIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
  },
});

const roles = [
  {
    key: "team_lead",
    label: "Team Lead",
    desc: "View team KPIs, signals, employee scores, and financial summary.",
    icon: <People20Regular />,
    color: "#0f6cbd",
    bg: "#e8f0fe",
  },
  {
    key: "team_member",
    label: "Team Member",
    desc: "View personal KPIs, skills, delivery stats, and well-being insights.",
    icon: <Person20Regular />,
    color: "#107c41",
    bg: "#e6f4ea",
  },
];

const DemoMode = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [selected, setSelected] = useState("team_lead");

  const handleLaunch = () => {
    setRole(selected === "team_member" ? "member" : "lead");
    navigate("/dashboard");
  };

  return (
    <div className={styles.root}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <BrainCircuit24Regular />
            </div>
            <Text weight="bold" size={600}>Demo Mode</Text>
            <Text size={300} style={{ color: "#616161", marginTop: "4px" }}>
              Explore LogIQ with sample data — no account needed
            </Text>
          </div>

          <Label style={{ marginBottom: "12px", display: "block" }} weight="semibold">
            Select your role
          </Label>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
            {roles.map((role) => (
              <div
                key={role.key}
                role="button"
                tabIndex={0}
                className={`${styles.roleCard} ${selected === role.key ? styles.roleCardSelected : ""}`}
                onClick={() => setSelected(role.key)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(role.key); } }}
              >
                <div className={styles.roleIcon} style={{ backgroundColor: role.bg, color: role.color }}>
                  {role.icon}
                </div>
                <div>
                  <Text weight="semibold" size={400} block>{role.label}</Text>
                  <Text size={200} style={{ color: "#616161" }}>{role.desc}</Text>
                </div>
              </div>
            ))}
          </div>

          <Button
            appearance="primary"
            size="large"
            style={{ width: "100%" }}
            icon={<ArrowRight20Regular />}
            iconPosition="after"
            onClick={handleLaunch}
          >
            Launch Demo
          </Button>

          <div className={styles.footer}>
            <Text size={300} style={{ color: "#616161" }}>
              Want full access?{" "}
              <Link to="/signup" style={{ color: "#0f6cbd", textDecoration: "none" }}>
                Create an account
              </Link>
              {" · "}
              <Link to="/signin" style={{ color: "#0f6cbd", textDecoration: "none" }}>
                Sign in
              </Link>
            </Text>
          </div>
        </div>
    </div>
  );
};

export default DemoMode;
