import {
  makeStyles,
  tokens,
  Text,
  Card,
  Button,
} from "@fluentui/react-components";
import {
  Warning20Filled,
  ArrowRight16Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  banner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef7f0",
    border: "1px solid #f5d08e",
    borderRadius: "8px",
    padding: "14px 20px",
    marginBottom: "16px",
    gap: "12px",
    flexWrap: "wrap",
    "@media (max-width: 480px)": {
      padding: "10px 14px",
    },
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "0px",
  },
});

interface Props {
  count: number;
}

export const SignalBanner: React.FC<Props> = ({ count }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  if (count === 0) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <Warning20Filled style={{ color: "#f7630c" }} />
        <Text weight="semibold" size={400}>
          {count} urgent signals require attention
        </Text>
      </div>
      <Button appearance="transparent" size="small" icon={<ArrowRight16Regular />} iconPosition="after" style={{ color: "#0f6cbd" }} onClick={() => navigate("/wellbeing")}>
        View All
      </Button>
    </div>
  );
};
