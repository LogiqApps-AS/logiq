import {
  makeStyles,
  shorthands,
  tokens,
  Text,
} from "@fluentui/react-components";
import {
  CalendarLtr20Regular,
  Clock20Regular,
  Warning20Regular,
  CheckmarkCircle20Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    "@media (max-width: 500px)": {
      gridTemplateColumns: "1fr",
    },
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "8px",
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
  },
  iconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

interface PlannerKPICardsProps {
  upcoming: number;
  thisWeek: number;
  deferred: number;
  completed: number;
}

export const PlannerKPICards: React.FC<PlannerKPICardsProps> = ({
  upcoming,
  thisWeek,
  deferred,
  completed,
}) => {
  const styles = useStyles();

  const cards = [
    { icon: <CalendarLtr20Regular />, label: "Upcoming", value: upcoming, bg: "#e8ebf9", color: "#5b5fc7" },
    { icon: <Clock20Regular />, label: "This Week", value: thisWeek, bg: "#e1f5e8", color: "#107c41" },
    { icon: <Warning20Regular />, label: "Deferred Topics", value: deferred, bg: "#fff4ce", color: "#c4841d" },
    { icon: <CheckmarkCircle20Regular />, label: "Completed", value: completed, bg: "#e1f5e8", color: "#107c41" },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((c) => (
        <div key={c.label} className={styles.card}>
          <div className={styles.iconWrap} style={{ backgroundColor: c.bg }}>
            <span style={{ color: c.color }}>{c.icon}</span>
          </div>
          <div>
            <Text weight="bold" size={700} style={{ display: "block", lineHeight: 1 }}>
              {c.value}
            </Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              {c.label}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
};
