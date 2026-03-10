import { Text, tokens } from "@fluentui/react-components";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional right-aligned actions */
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
    <div>
      <Text size={700} weight="bold" as="h1" style={{ margin: 0 }}>
        {title}
      </Text>
      {subtitle && (
        <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: "4px" }}>
          {subtitle}
        </Text>
      )}
    </div>
    {actions && <div style={{ marginLeft: "16px" }}>{actions}</div>}
  </div>
);
