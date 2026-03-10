import {
  Text,
  Button,
  Input,
  Label,
  Checkbox,
  Divider,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Person20Regular,
  LockClosed20Regular,
  Rocket20Regular,
  ArrowRight16Regular,
  People20Regular,
  ShieldCheckmark20Regular,
  ArrowLeft20Regular,
} from "@fluentui/react-icons";
import { Logo } from "../components/Logo";
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
    width: "400px",
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
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  link: {
    color: "#0f6cbd",
    fontSize: "13px",
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline",
    },
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
  },
});

const SignIn = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { setRole: setGlobalRole } = useRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState<"lead" | "member">("lead");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalRole(role);
    navigate("/dashboard");
  };

  return (
    <div className={styles.root}>
        <div className={styles.card}>
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
            <Text weight="bold" size={600}>Sign in to LogIQ</Text>
            <Text size={200} style={{ color: "#616161", marginTop: "4px" }}>
              People Partner Intelligence
            </Text>
          </div>


          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@logiq.com"
                contentBefore={<Person20Regular />}
                value={email}
                onChange={(_, d) => setEmail(d.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                contentBefore={<LockClosed20Regular />}
                value={password}
                onChange={(_, d) => setPassword(d.value)}
                required
              />
            </div>

            <div className={styles.row}>
              <Checkbox label="Remember me" />
              <button onClick={(e) => { e.preventDefault(); /* TODO: implement forgot password */ }} className={styles.link} style={{ background: "none", border: "none", cursor: "pointer" }}>Forgot password?</button>
            </div>

            <Button appearance="primary" type="submit" style={{ width: "100%" }} size="large">
              Sign In
            </Button>
          </form>

          <Divider style={{ margin: "24px 0" }}>or</Divider>

          <Button
            appearance="outline"
            style={{ width: "100%", marginBottom: "8px" }}
            icon={
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
            }
          >
            Sign in with Microsoft
          </Button>

          <div className={styles.footer}>
            <Text size={300} style={{ color: "#616161" }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: "#0f6cbd", textDecoration: "none" }}>
                Sign up
              </Link>
            </Text>
          </div>

          <div
            className="hover-scale"
            role="button"
            tabIndex={0}
            style={{
              marginTop: "24px",
              padding: "20px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #5b5fc7 0%, #7b7fda 100%)",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              boxShadow: "0 2px 8px rgba(91,95,199,0.15)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(91,95,199,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(91,95,199,0.15)"; }}
            onClick={() => navigate("/demo")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("/demo"); } }}
          >
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "absolute", bottom: "-15px", left: "-15px", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)" }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", position: "relative" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Rocket20Regular style={{ color: "#fff" }} />
              </div>
              <div>
                <Text weight="bold" size={400} style={{ color: "#fff", display: "block" }}>
                  Try Demo Mode
                </Text>
                <Text size={200} style={{ color: "rgba(255,255,255,0.8)" }}>
                  No account needed
                </Text>
              </div>
              <ArrowRight16Regular style={{ color: "rgba(255,255,255,0.8)", marginLeft: "auto" }} />
            </div>
            
            <div style={{ display: "flex", gap: "12px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <People20Regular style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }} />
                <Text size={100} style={{ color: "rgba(255,255,255,0.7)" }}>10 team members</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheckmark20Regular style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }} />
                <Text size={100} style={{ color: "rgba(255,255,255,0.7)" }}>Full features</Text>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default SignIn;
