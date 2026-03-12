import {
  makeStyles,
  tokens,
  Text,
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import { Sparkle20Filled, Dismiss20Regular } from "@fluentui/react-icons";
import type { ReactNode } from "react";

const useStyles = makeStyles({
  surface: {
    maxWidth: "640px",
    width: "95vw",
    maxHeight: "85vh",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    maxHeight: "calc(85vh - 32px)",
  },
  content: {
    paddingTop: "8px",
    overflowY: "auto",
    flex: "1 1 auto",
    minHeight: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: "1 1 auto",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  copilotIcon: {
    color: "#5b5fc7",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "4px",
    backgroundColor: "#e8ebf9",
    color: "#5b5fc7",
  },
});

interface LogiqDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  maxWidth?: string;
  primaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  closeLabel?: string;
  children: ReactNode;
}

export const LogiqDialog: React.FC<LogiqDialogProps> = ({
  open,
  onClose,
  title,
  badge = "AI Generated",
  maxWidth,
  primaryAction,
  closeLabel = "Close",
  children,
}) => {
  const styles = useStyles();

  return (
    <Dialog open={open} onOpenChange={(_, d) => { if (!d.open) onClose(); }}>
      <DialogSurface className={styles.surface} style={maxWidth ? { maxWidth } : undefined}>
        <DialogBody className={styles.body}>
          <DialogTitle
            action={
              <Button appearance="subtle" icon={<Dismiss20Regular />} onClick={onClose} aria-label="Close" style={{ position: "absolute", top: "12px", right: "12px" }} />
            }
          >
            <div className={styles.header}>
              <Sparkle20Filled className={styles.copilotIcon} />
              <Text weight="semibold" size={500}>{title}</Text>
              {badge && <span className={styles.badge}>{badge}</span>}
            </div>
          </DialogTitle>

          <DialogContent className={styles.content}>
            {children}
          </DialogContent>

          <DialogActions style={{ justifyContent: "flex-end" }}>
            <Button appearance="secondary" onClick={onClose}>{closeLabel}</Button>
            {primaryAction && (
              <Button appearance="primary" icon={primaryAction.icon as any} onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
