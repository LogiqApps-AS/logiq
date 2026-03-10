import {
  Text,
  Card,
  Button,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { BookOpen20Regular, Play16Regular, Dismiss16Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  card: { padding: "12px 16px", marginBottom: "8px" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" },
  left: { display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 },
  icon: { width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0ff", color: "#5b5fc7", flexShrink: 0 },
  badge: { fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", whiteSpace: "nowrap", flexShrink: 0 },
  actions: { display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 },
});

const priorityColors: Record<string, { color: string; bg: string }> = {
  HIGH: { color: "#d13438", bg: "#fde7e9" },
  MEDIUM: { color: "#f7630c", bg: "#fff4ce" },
  LOW: { color: "#107c41", bg: "#dff6dd" },
};

export interface LearningItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  priority: string;
}

interface Props {
  items: LearningItem[];
  onStart?: (item: LearningItem) => void;
  onDismiss?: (itemId: string) => void;
}

const LearningCardList: React.FC<Props> = ({ items, onStart, onDismiss }) => {
  const styles = useStyles();
  return (
    <>
      {items.map((item) => {
        const pc = priorityColors[item.priority] ?? { color: "#666", bg: "#eee" };
        return (
          <Card key={item.id} className={styles.card}>
            <div className={styles.row}>
              <div className={styles.left}>
                <span className={styles.icon}><BookOpen20Regular /></span>
                <div style={{ minWidth: 0 }}>
                  <Text weight="semibold" size={300} style={{ display: "block" }}>{item.title}</Text>
                  <Text size={200} style={{ display: "block", color: tokens.colorNeutralForeground3 }}>{item.category} · {item.duration}</Text>
                </div>
              </div>
              <span className={styles.badge} style={{ backgroundColor: pc.bg, color: pc.color }}>{item.priority}</span>
              <div className={styles.actions}>
                {onStart && (
                  <Button
                    size="small"
                    appearance="subtle"
                    icon={<Play16Regular />}
                    onClick={() => onStart(item)}
                    title="Start course"
                  />
                )}
                {onDismiss && (
                  <Button
                    size="small"
                    appearance="subtle"
                    icon={<Dismiss16Regular />}
                    onClick={() => onDismiss(item.id)}
                    title="Dismiss"
                  />
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </>
  );
};

export default LearningCardList;
