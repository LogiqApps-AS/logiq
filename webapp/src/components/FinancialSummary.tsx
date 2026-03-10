import { makeStyles, tokens, Text, Card } from "@fluentui/react-components";
import { PeopleTeam20Regular, Money20Regular, Warning20Regular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "24px",
    "@media (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
  card: {
    paddingTop: "16px",
    paddingBottom: "16px",
    paddingLeft: "20px",
    paddingRight: "20px",
    cursor: "pointer",
    transition: "box-shadow 0.15s, transform 0.15s",
    ":hover": {
      boxShadow: tokens.shadow8,
      transform: "translateY(-2px)",
    },
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  value: {
    fontSize: "32px",
    fontWeight: 700,
    lineHeight: "1",
  },
});

interface FinancialData {
  atRiskCount: number;
  totalEmployees: number;
  churnExposure: number;
  totalPeopleRisk: number;
}

interface FinancialSummaryProps {
  data?: FinancialData;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ data }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  if (!data) return null;

  return (
    <div className={styles.grid}>
      <Card className={styles.card} onClick={() => navigate("/team?filter=at-risk")}>
        <div className={styles.label}>
          <PeopleTeam20Regular style={{ color: tokens.colorNeutralForeground3 }} />
          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
            Employees that require attention
          </Text>
        </div>
        <span className={styles.value} style={{ color: "#d13438" }}>
          {data.atRiskCount}
        </span>
        <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
          {" "}
          of {data.totalEmployees}
        </Text>
      </Card>
      <Card className={styles.card} onClick={() => navigate("/team?filter=at-risk")}>
        <div className={styles.label}>
          <Money20Regular style={{ color: tokens.colorNeutralForeground3 }} />
          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
            Churn Exposure
          </Text>
        </div>
        <span className={styles.value} style={{ color: "#f7630c" }}>
          ${(data.churnExposure / 1000).toFixed(0)}k
        </span>
      </Card>
      <Card className={styles.card} onClick={() => navigate("/wellbeing")}>
        <div className={styles.label}>
          <Warning20Regular style={{ color: tokens.colorNeutralForeground3 }} />
          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
            Total Risk Cost
          </Text>
        </div>
        <span className={styles.value} style={{ color: "#d13438" }}>
          ${(data.totalPeopleRisk / 1000).toFixed(0)}k
        </span>
        <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
          {" "}
          /year
        </Text>
      </Card>
    </div>
  );
};
