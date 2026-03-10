import {
  makeStyles,
  tokens,
  Text,
  Card,
} from "@fluentui/react-components";
import {
  ArrowTrendingDown20Regular,
  ArrowTrending20Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import type { KPIStatus } from "@/types";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "12px",
    marginBottom: "20px",
    "@media (max-width: 1200px)": { gridTemplateColumns: "repeat(3, 1fr)" },
    "@media (max-width: 768px)": { gridTemplateColumns: "repeat(2, 1fr)" },
    "@media (max-width: 480px)": { gridTemplateColumns: "1fr" },
  },
  card: {
    padding: "16px 18px",
    borderTopWidth: "3px",
    borderTopStyle: "solid",
    minWidth: "0px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "box-shadow 0.15s, transform 0.15s",
    ":hover": {
      boxShadow: tokens.shadow8,
      transform: "translateY(-2px)",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  score: { fontSize: "36px", fontWeight: 700, lineHeight: "1" },
  trendChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    fontSize: "12px",
    fontWeight: 600,
  },
  subMetrics: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: tokens.colorNeutralStroke2,
    paddingTop: "10px",
  },
  subRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

const statusColors: Record<KPIStatus, string> = { green: "#107c10", yellow: "#f7630c", red: "#d13438" };
const statusBorderColors = statusColors;
const badgeBg: Record<KPIStatus, string> = { green: "#dff6dd", yellow: "#fff4ce", red: "#fde7e9" };
const badgeLabel: Record<KPIStatus, string> = { green: "GREEN", yellow: "YELLOW", red: "RED" };

interface KPICardData {
  label: string;
  score: number;
  status: KPIStatus;
  trend: number;
  subMetrics?: { label: string; value: string }[];
}

const kpiRoutes: Record<string, { path: string; filter?: string }> = {
  "Well-being Index": { path: "/dashboard/wellbeing" },
  "Skills & Development": { path: "/dashboard/team", filter: "low-skills" },
  "Motivation Index": { path: "/dashboard/team", filter: "low-wellbeing" },
  "Churn & Retention": { path: "/dashboard/team", filter: "at-risk" },
  "Delivery & Workload": { path: "/dashboard/team", filter: "low-performers" },
};

const KPICard: React.FC<{ data: KPICardData }> = ({ data }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const trendDown = data.trend < 0;
  const trendColor = trendDown ? "#d13438" : "#107c10";
  const route = kpiRoutes[data.label];

  const handleClick = () => {
    if (route) {
      const url = route.filter ? `${route.path}?filter=${route.filter}` : route.path;
      navigate(url);
    }
  };

  return (
    <Card className={styles.card} style={{ borderTopColor: statusBorderColors[data.status] }} onClick={handleClick}>
      <div className={styles.header}>
        <Text size={300} weight="semibold">{data.label}</Text>
        <span style={{ display: "inline-flex", alignItems: "center", fontSize: "12px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: badgeBg[data.status], color: statusColors[data.status] }}>
          {badgeLabel[data.status]}
        </span>
      </div>
      <div className={styles.scoreRow}>
        <span className={styles.score} style={{ color: statusColors[data.status] }}>{data.score}</span>
        <span className={styles.trendChip} style={{ color: trendColor }}>
          {trendDown ? <ArrowTrendingDown20Regular /> : <ArrowTrending20Regular />}
          {Math.abs(data.trend)}%
        </span>
      </div>
      <div className={styles.subMetrics}>
        {(data.subMetrics ?? []).map((m) => (
          <div key={m.label} className={styles.subRow}>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{m.label}</Text>
            <Text size={200} weight="semibold">{m.value}</Text>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface KPICardsProps {
  data?: {
    wellbeing: KPICardData;
    skills: KPICardData;
    motivation: KPICardData;
    churn: KPICardData;
    delivery: KPICardData;
  };
}

function toKPICardData(raw: { label?: string; score?: number; status?: string; trend?: number; description?: string; subMetrics?: { label: string; value: string }[] } | null | undefined): KPICardData | null {
  if (!raw) return null;
  const status = (raw.status === "green" || raw.status === "yellow" || raw.status === "red" ? raw.status : "yellow") as KPIStatus;
  const subMetrics = Array.isArray(raw.subMetrics) ? raw.subMetrics : (raw.description ? [{ label: "Summary", value: raw.description }] : []);
  return {
    label: raw.label ?? "",
    score: Number(raw.score) ?? 0,
    status,
    trend: Number(raw.trend) ?? 0,
    subMetrics,
  };
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const styles = useStyles();
  if (!data) return null;
  const cards = [
    toKPICardData(data.wellbeing),
    toKPICardData(data.skills),
    toKPICardData(data.motivation),
    toKPICardData(data.churn),
    toKPICardData(data.delivery),
  ].filter((c): c is KPICardData => c !== null);
  return (
    <div className={styles.grid}>
      {cards.map((c) => <KPICard key={c.label} data={c} />)}
    </div>
  );
};
