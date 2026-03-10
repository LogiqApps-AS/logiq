import {
  makeStyles,
  tokens,
  Text,
  Card,
  Button,
} from "@fluentui/react-components";
import {
  Warning20Filled,
  HeartPulse20Filled,
  ArrowTrendingLines20Filled,
  PersonAlert20Filled,
  Shield20Filled,
  ArrowRight16Regular,
  Circle12Filled,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import type { Signal } from "../data/sampleData";

const useStyles = makeStyles({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: { paddingTop: "16px", paddingBottom: "16px", paddingLeft: "20px", paddingRight: "20px" },
  cardCritical: { borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#d13438" },
  cardWarning: { borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#f7630c" },
  cardInfo: { borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#0078d4" },
  titleRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" },
});

const iconMap: Record<string, React.ReactNode> = {
  HeartPulse: <HeartPulse20Filled />,
  Warning: <Warning20Filled />,
  ArrowTrending: <ArrowTrendingLines20Filled />,
  PersonAlert: <PersonAlert20Filled />,
  Shield: <Shield20Filled />,
};

const typeColors: Record<string, string> = { critical: "#d13438", warning: "#f7630c", info: "#0078d4" };

interface RecentSignalsProps {
  signals: Signal[];
}

export const RecentSignals: React.FC<RecentSignalsProps> = ({ signals }) => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div>
      <div className={styles.header}>
        <Text size={500} weight="bold">Recent Signals</Text>
        <Button appearance="transparent" size="small" icon={<ArrowRight16Regular />} iconPosition="after" style={{ color: "#0f6cbd" }} onClick={() => navigate("/wellbeing")}>
          View All
        </Button>
      </div>
      <div className={styles.list}>
        {signals.map((signal) => {
          const borderClass =
            signal.type === "critical" ? styles.cardCritical :
            signal.type === "warning" ? styles.cardWarning : styles.cardInfo;
          return (
            <Card key={signal.id} className={`${styles.card} ${borderClass}`}>
              <div className={styles.titleRow}>
                <span style={{ color: typeColors[signal.type] }}>
                  {iconMap[signal.icon] || <Warning20Filled />}
                </span>
                <Text weight="bold" size={400}>{signal.title}</Text>
                <Circle12Filled style={{ color: "#0078d4", fontSize: "8px" }} />
              </div>
              <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: "1.5" }}>
                {signal.message}
              </Text>
              <div className={styles.footer}>
                <Text size={200} style={{ color: tokens.colorNeutralForeground4 }}>{signal.time}</Text>
                {signal.actionLabel && (
                  <Button appearance="transparent" size="small" icon={<ArrowRight16Regular />} iconPosition="after" style={{ color: "#0f6cbd" }}
                    onClick={() => {
                      if (signal.action === "profile" && signal.employeeId) navigate(`/teams/1/members/${signal.employeeId}`);
                      else if (signal.action === "prep") navigate("/prep");
                      else if (signal.action === "rebalance" && signal.employeeId) navigate(`/teams/1/members/${signal.employeeId}`);
                    }}
                  >
                    {signal.actionLabel}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
