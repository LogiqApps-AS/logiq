import React from "react";
import { makeStyles } from "@fluentui/react-components";
import { BrainCircuit24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  logoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    backgroundColor: "#6264A7",
  },
});

interface LogoProps {
  size?: number;
  iconSize?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 36, iconSize = 20 }) => {
  const styles = useStyles();
  
  return (
    <div 
      className={styles.logoIcon} 
      style={{ 
        width: `${size}px`, 
        height: `${size}px` 
      }}
    >
      <BrainCircuit24Regular style={{ fontSize: `${iconSize}px`, color: "#fff" }} />
    </div>
  );
};
