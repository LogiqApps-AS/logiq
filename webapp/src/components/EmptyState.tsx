import { makeStyles, tokens, Text } from "@fluentui/react-components";
import {
  DocumentSearch20Regular,
} from "@fluentui/react-icons";
import type { ReactNode } from "react";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    textAlign: "center",
    gap: "12px",
    minHeight: "180px",
  },
  iconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: tokens.colorNeutralBackground3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: tokens.colorNeutralForeground3,
  },
  title: {
    color: tokens.colorNeutralForeground1,
    display: "block",
  },
  description: {
    color: tokens.colorNeutralForeground3,
    display: "block",
    maxWidth: "320px",
  },
});

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.iconWrap}>
        {icon || <DocumentSearch20Regular />}
      </div>
      <Text weight="semibold" size={400} className={styles.title}>{title}</Text>
      {description && (
        <Text size={300} className={styles.description}>{description}</Text>
      )}
    </div>
  );
};
