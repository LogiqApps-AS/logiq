import {
  Text,
  Button,
  Input,
  Label,
  Checkbox,
  Divider,
  makeStyles,
} from "@fluentui/react-components";
import {
  BrainCircuit24Regular,
  Mail20Regular,
  LockClosed20Regular,
  Rocket20Regular,
  ArrowRight16Regular,
  People20Regular,
  ShieldCheckmark20Regular,
  ArrowLeft20Regular,
} from "@fluentui/react-icons";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f0f6ff 0%, #e8eef7 50%, #fafafa 100%)",
  },
  card: {
    width: "420px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "36px 36px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e8e8e8",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "28px",
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
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },
  nameRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "14px",
  },
  footer: {
    textAlign: "center",
    marginTop: "20px",
  },
  demoBox: {
    marginTop: "24px",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#f0f6ff",
    border: "1px solid #d0e2f7",
    textAlign: "center",
  },
});

const SignUp = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first: "", last: "", email: "", password: "" });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <div className={styles.brandIcon}>
              <BrainCircuit24Regular />
            </div>
            <Text weight="bold" size={600}>Create your account</Text>
            <Text size={200} style={{ color: "#616161", marginTop: "4px" }}>
              Get started with LogIQ
            </Text>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <Label htmlFor="first">First Name</Label>
              <Input
                id="first"
                placeholder="First name"
                value={form.first}
                onChange={(_, d) => update("first", d.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="last">Last Name</Label>
              <Input
                id="last"
                placeholder="Last name"
                value={form.last}
                onChange={(_, d) => update("last", d.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                contentBefore={<Mail20Regular />}
                value={form.email}
                onChange={(_, d) => update("email", d.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                contentBefore={<LockClosed20Regular />}
                value={form.password}
                onChange={(_, d) => update("password", d.value)}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Checkbox label="I agree to the Terms of Service and Privacy Policy" required />
            </div>

            <Button appearance="primary" type="submit" style={{ width: "100%" }} size="large">
              Create Account
            </Button>
          </form>

          <Divider style={{ margin: "20px 0" }}>or</Divider>

          <Button
            appearance="outline"
            style={{ width: "100%" }}
            icon={
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
            }
          >
            Sign up with Microsoft
          </Button>

          <div className={styles.footer}>
            <Text size={300} style={{ color: "#616161" }}>
              Already have an account?{" "}
              <Link to="/signin" style={{ color: "#0f6cbd", textDecoration: "none" }}>
                Sign in
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

export default SignUp;
