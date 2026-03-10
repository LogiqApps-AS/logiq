import { makeStyles, tokens } from "@fluentui/react-components";
import { ReactNode } from "react";

const useStyles = makeStyles({
  container: {
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
    "@media (max-width: 1024px)": {
      padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
    },
    "@media (max-width: 768px)": {
      padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    },
    "@media (max-width: 480px)": {
      padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    },
  },
});

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  maxWidth = "1280px" 
}) => {
  const styles = useStyles();

  return (
    <div className={styles.container} style={{ maxWidth }}>
      {children}
    </div>
  );
};
