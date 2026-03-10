import { makeStyles, tokens, Text, Card, Persona, Button, ProgressBar } from "@fluentui/react-components";
import { Warning16Filled, ArrowRight16Regular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import type { Employee } from "@/types";

const useStyles = makeStyles({
  container: { display: "flex", flexDirection: "column", gap: "12px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  card: { paddingTop: "16px", paddingBottom: "16px", paddingLeft: "20px", paddingRight: "20px", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s", ":hover": { boxShadow: tokens.shadow8, transform: "translateY(-2px)" } },
  empHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  empInfo: { display: "flex", alignItems: "center", gap: "12px" },
  scoresRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    textAlign: "center",
    marginBottom: "12px",
    "@media (max-width: 480px)": { gridTemplateColumns: "repeat(2, 1fr)" },
  },
  scoreLabel: {
    fontSize: "10px",
    textTransform: "uppercase",
    color: tokens.colorNeutralForeground3,
    letterSpacing: "0.5px",
  },
  scoreValue: { fontSize: "22px", fontWeight: 700, lineHeight: "1.2" },
  churnRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
  prepSection: { marginTop: "16px" },
  prepItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "10px",
    paddingBottom: "10px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: tokens.colorNeutralStroke2,
  },
});

const getScoreColor = (score: number) => {
  if (score >= 70) return "#107c10";
  if (score >= 50) return "#f7630c";
  return "#d13438";
};

interface AtRiskEmployeesProps {
  employees: Employee[];
}

export const AtRiskEmployees: React.FC<AtRiskEmployeesProps> = ({ employees }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const atRisk = employees.filter((e) => e.churnRisk === "At risk");

  return (
    <div>
      <div className={styles.header} style={{ marginBottom: "12px" }}>
        <Text size={500} weight="bold">
          Employees that require attention
        </Text>
        <Button
          appearance="transparent"
          size="small"
          icon={<ArrowRight16Regular />}
          iconPosition="after"
          style={{ color: "#0f6cbd" }}
          onClick={() => navigate("/team")}
        >
          View Team
        </Button>
      </div>
      <div className={styles.container}>
        {atRisk.map((emp) => (
          <Card key={emp.id} className={styles.card} onClick={() => navigate(`/dashboard/teams/1/members/${emp.id}`)}>
            <div className={styles.empHeader}>
              <Persona
                name={emp.name}
                secondaryText={`${emp.role} · ${emp.tenure}`}
                size="medium"
                avatar={{ color: "cranberry" }}
              />
              <span
                title="At Risk"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  backgroundColor: "#fde7e9",
                  color: "#d13438",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <Warning16Filled style={{ fontSize: "12px" }} /> Risk
              </span>
            </div>
            <div className={styles.scoresRow}>
              {(["wellbeing", "skills", "motivation", "delivery"] as const).map((key) => (
                <div key={key}>
                  <div className={styles.scoreValue} style={{ color: getScoreColor(emp[key].score) }}>
                    {emp[key].score}
                  </div>
                  <div className={styles.scoreLabel}>
                    {key === "wellbeing" ? "Well-being" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.churnRow}>
              <Text size={200}>Churn Risk</Text>
              <div style={{ flex: 1 }}>
                <ProgressBar value={emp.churnPercent / 100} thickness="large" color="error" />
              </div>
              <Text size={300} weight="bold" style={{ color: "#d13438" }}>
                {emp.churnPercent}%
              </Text>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.prepSection}>
        <Text size={400} weight="semibold" style={{ display: "block", marginBottom: "4px" }}>
          Upcoming 1:1 Prep Available
        </Text>
        {atRisk.map((emp) => (
          <div key={emp.id} className={styles.prepItem}>
            <Text size={300}>{emp.name}</Text>
            <Button
              appearance="transparent"
              size="small"
              icon={<ArrowRight16Regular />}
              iconPosition="after"
              style={{ color: "#0f6cbd" }}
              onClick={() => navigate("/prep")}
            >
              Prepare 1:1
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
