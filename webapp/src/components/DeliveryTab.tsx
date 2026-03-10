import {
  Text,
  Card,
  Persona,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useState, useMemo } from "react";
import { ArrowSortDown20Regular, ArrowSortUp20Regular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import type { Employee } from "@/lib/api";
import { useEmployees } from "../hooks/useApiData";
import { AIOverviewDialog } from "./AIOverviewDialog";

const useStyles = makeStyles({
  sprintRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "20px",
    "@media (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
  sprintCard: {
    padding: "20px",
  },
  sprintLabel: {
    display: "block",
    marginBottom: "8px",
  },
  sprintValues: {
    display: "flex",
    alignItems: "baseline",
    gap: "16px",
  },
  completion: {
    fontSize: "36px",
    fontWeight: 700,
    lineHeight: "1",
  },
  storyPoints: {
    fontSize: "28px",
    fontWeight: 700,
    lineHeight: "1",
    color: tokens.colorNeutralForeground1,
  },
  chartCard: {
    padding: "24px",
  },
  barRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  barName: {
    width: "180px",
    flexShrink: 0,
    cursor: "pointer",
  },
  barTrack: {
    flex: 1,
    height: "14px",
    borderRadius: "7px",
    backgroundColor: "#e8e8e8",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "7px",
  },
  barValue: {
    width: "36px",
    textAlign: "right",
    fontSize: "14px",
    fontWeight: 700,
    flexShrink: 0,
  },
});

const sprintData = [
  { name: "Sprint 10", completion: 92, points: 48 },
  { name: "Sprint 11", completion: 85, points: 44 },
  { name: "Sprint 12", completion: 78, points: 39 },
];

const getBarColor = (score: number) => {
  if (score >= 80) return "#36b37e";
  if (score >= 60) return "#f7b928";
  return "#d13438";
};

type SortKey = "score" | "name";
type SortDir = "asc" | "desc";

const DeliveryTab: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [aiEmployee, setAiEmployee] = useState<Employee | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const { data: employees = [] } = useEmployees("team1");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "score" ? "desc" : "asc");
    }
  };

  const sorted = useMemo(() => {
    const list = [...employees];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "score") cmp = (a.delivery?.score ?? 0) - (b.delivery?.score ?? 0);
      else cmp = a.name.localeCompare(b.name);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [employees, sortKey, sortDir]);

  return (
    <div>
      <div className={styles.sprintRow}>
        {sprintData.map((s) => (
          <Card key={s.name} className={styles.sprintCard}>
            <Text size={300} style={{ color: tokens.colorNeutralForeground3 }} className={styles.sprintLabel}>
              {s.name}
            </Text>
            <div className={styles.sprintValues}>
              <span className={styles.completion} style={{ color: getBarColor(s.completion) }}>
                {s.completion}%
              </span>
              <span className={styles.storyPoints}>{s.points}</span>
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Completion</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Story Points</Text>
            </div>
          </Card>
        ))}
      </div>

      <Card className={styles.chartCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Text size={500} weight="bold">Individual Delivery Scores</Text>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => toggleSort("name")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontFamily: "inherit",
                border: sortKey === "name" ? "1px solid #0f6cbd" : "1px solid #e0e0e0",
                backgroundColor: sortKey === "name" ? "#e8f0fe" : "#fff",
                color: sortKey === "name" ? "#0f6cbd" : tokens.colorNeutralForeground1,
                cursor: "pointer", fontWeight: sortKey === "name" ? 600 : 400,
              }}
            >
              Name {sortKey === "name" && (sortDir === "asc" ? <ArrowSortUp20Regular style={{ fontSize: 14 }} /> : <ArrowSortDown20Regular style={{ fontSize: 14 }} />)}
            </button>
            <button
              onClick={() => toggleSort("score")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontFamily: "inherit",
                border: sortKey === "score" ? "1px solid #0f6cbd" : "1px solid #e0e0e0",
                backgroundColor: sortKey === "score" ? "#e8f0fe" : "#fff",
                color: sortKey === "score" ? "#0f6cbd" : tokens.colorNeutralForeground1,
                cursor: "pointer", fontWeight: sortKey === "score" ? 600 : 400,
              }}
            >
              Score {sortKey === "score" && (sortDir === "asc" ? <ArrowSortUp20Regular style={{ fontSize: 14 }} /> : <ArrowSortDown20Regular style={{ fontSize: 14 }} />)}
            </button>
          </div>
        </div>
        {sorted.map((emp) => {
          const score = emp.delivery.score;
          const color = getBarColor(score);
          return (
            <div key={emp.id} className={styles.barRow}>
              <div
                className={styles.barName}
                role="button"
                tabIndex={0}
                onClick={() => setAiEmployee(emp)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAiEmployee(emp); } }}
                title="View AI Overview"
              >
                <Persona
                  name={emp.name}
                  secondaryText={emp.role}
                  size="small"
                  avatar={{ color: emp.churnRisk === "At risk" ? "cranberry" : "brand" }}
                />
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${score}%`, backgroundColor: color }}
                />
              </div>
              <span className={styles.barValue} style={{ color }}>{score}</span>
            </div>
          );
        })}
      </Card>

      <AIOverviewDialog
        open={!!aiEmployee}
        onClose={() => setAiEmployee(null)}
        employee={aiEmployee}
      />
    </div>
  );
};

export default DeliveryTab;
