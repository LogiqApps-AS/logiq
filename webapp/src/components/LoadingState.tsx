/**
 * Reusable loading and error state components.
 * Provides skeleton loaders for various dashboard patterns and a retry-able error card.
 */
import { makeStyles, mergeClasses, tokens, Text, Button, Card } from "@fluentui/react-components";
import { ArrowClockwise20Regular, ErrorCircle20Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  errorCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    gap: "12px",
    textAlign: "center",
  },
  skeleton: {
    borderRadius: "6px",
    backgroundColor: "#e8e8e8",
    overflow: "hidden",
    position: "relative",
  },
  shimmer: {
    "::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage:
        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
      animationName: {
        from: { transform: "translateX(-100%)" },
        to: { transform: "translateX(100%)" },
      },
      animationDuration: "1.5s",
      animationIterationCount: "infinite",
      animationTimingFunction: "ease-in-out",
    },
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "12px",
    marginBottom: "20px",
    "@media (max-width: 1200px)": { gridTemplateColumns: "repeat(3, 1fr)" },
    "@media (max-width: 768px)": { gridTemplateColumns: "repeat(2, 1fr)" },
    "@media (max-width: 480px)": { gridTemplateColumns: "1fr" },
  },
  financialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "24px",
    "@media (max-width: 640px)": { gridTemplateColumns: "1fr" },
  },
  signalList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    "@media (max-width: 1024px)": { gridTemplateColumns: "repeat(2, 1fr)" },
    "@media (max-width: 640px)": { gridTemplateColumns: "1fr" },
  },
});

// ─── Skeleton Block ────────────────────────────────────────────────
interface SkeletonBlockProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
  style,
}) => {
  const styles = useStyles();
  return (
    <div
      className={mergeClasses(styles.skeleton, styles.shimmer)}
      style={{ width, height, borderRadius, ...style }}
    />
  );
};

// ─── Error State ───────────────────────────────────────────────────
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}) => {
  const styles = useStyles();
  return (
    <Card className={styles.errorCard}>
      <ErrorCircle20Regular style={{ color: "#d13438", fontSize: "32px" }} />
      <Text size={400} weight="semibold">
        Failed to load data
      </Text>
      <Text size={300} style={{ color: tokens.colorNeutralForeground3, maxWidth: "360px" }}>
        {message}
      </Text>
      {onRetry && (
        <Button
          appearance="primary"
          icon={<ArrowClockwise20Regular />}
          onClick={onRetry}
          style={{ marginTop: "8px" }}
        >
          Retry
        </Button>
      )}
    </Card>
  );
};

// ─── KPI Cards Skeleton ────────────────────────────────────────────
export const KPICardsSkeleton: React.FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.kpiGrid}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} style={{ padding: "16px 18px", borderTop: "3px solid #e8e8e8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <SkeletonBlock width="80px" height="14px" />
            <SkeletonBlock width="48px" height="18px" borderRadius="10px" />
          </div>
          <SkeletonBlock width="60px" height="36px" style={{ marginBottom: "12px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid #f0f0f0", paddingTop: "10px" }}>
            <SkeletonBlock width="100%" height="12px" />
            <SkeletonBlock width="80%" height="12px" />
            <SkeletonBlock width="90%" height="12px" />
          </div>
        </Card>
      ))}
    </div>
  );
};

// ─── Financial Summary Skeleton ────────────────────────────────────
export const FinancialSummarySkeleton: React.FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.financialGrid}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <SkeletonBlock width="20px" height="20px" borderRadius="4px" />
            <SkeletonBlock width="100px" height="14px" />
          </div>
          <SkeletonBlock width="80px" height="32px" />
        </Card>
      ))}
    </div>
  );
};

// ─── Signals Skeleton ──────────────────────────────────────────────
export const SignalsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  const styles = useStyles();
  return (
    <div className={styles.signalList}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ padding: "16px 20px", borderLeft: "3px solid #e8e8e8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <SkeletonBlock width="20px" height="20px" borderRadius="50%" />
            <SkeletonBlock width="180px" height="16px" />
          </div>
          <SkeletonBlock width="100%" height="12px" style={{ marginBottom: "4px" }} />
          <SkeletonBlock width="75%" height="12px" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
            <SkeletonBlock width="60px" height="12px" />
            <SkeletonBlock width="90px" height="14px" />
          </div>
        </Card>
      ))}
    </div>
  );
};

// ─── At-Risk Employees Skeleton ────────────────────────────────────
export const AtRiskSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
      <SkeletonBlock width="140px" height="20px" />
      <SkeletonBlock width="80px" height="14px" />
    </div>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <SkeletonBlock width="36px" height="36px" borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <SkeletonBlock width="120px" height="16px" style={{ marginBottom: "4px" }} />
            <SkeletonBlock width="160px" height="12px" />
          </div>
          <SkeletonBlock width="60px" height="20px" borderRadius="10px" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px" }}>
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} style={{ textAlign: "center" }}>
              <SkeletonBlock width="32px" height="22px" style={{ margin: "0 auto 4px" }} />
              <SkeletonBlock width="50px" height="10px" style={{ margin: "0 auto" }} />
            </div>
          ))}
        </div>
        <SkeletonBlock width="100%" height="14px" />
      </Card>
    ))}
  </div>
);

// ─── Team Grid Skeleton ────────────────────────────────────────────
export const TeamGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  const styles = useStyles();
  return (
    <div className={styles.teamGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <SkeletonBlock width="36px" height="36px" borderRadius="50%" />
            <div style={{ flex: 1 }}>
              <SkeletonBlock width="100px" height="16px" style={{ marginBottom: "4px" }} />
              <SkeletonBlock width="140px" height="12px" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} style={{ textAlign: "center" }}>
                <SkeletonBlock width="28px" height="20px" style={{ margin: "0 auto 4px" }} />
                <SkeletonBlock width="45px" height="10px" style={{ margin: "0 auto" }} />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
