import { makeStyles, tokens } from "@fluentui/react-components";
import copilotIcon from "@/assets/copilot-icon.png";

const useStyles = makeStyles({
  fab: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(91, 95, 199, 0.4)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    zIndex: 998,
    borderTopWidth: "0px",
    borderRightWidth: "0px",
    borderBottomWidth: "0px",
    borderLeftWidth: "0px",
    ":hover": {
      transform: "scale(1.1)",
      boxShadow: "0 6px 24px rgba(91, 95, 199, 0.5)",
    },
  },
});

interface CopilotFABProps {
  onClick: () => void;
}

export const CopilotFAB: React.FC<CopilotFABProps> = ({ onClick }) => {
  const styles = useStyles();

  return (
    <button
      className={styles.fab}
      onClick={onClick}
      title="Open Copilot"
      aria-label="Open Copilot"
    >
      <img src={copilotIcon} alt="Copilot" style={{ width: "32px", height: "32px" }} />
    </button>
  );
};
