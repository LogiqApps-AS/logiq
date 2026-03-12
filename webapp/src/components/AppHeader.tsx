import {
  makeStyles,
  tokens,
  Text,
  Persona,
  Button,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbButton,
  BreadcrumbDivider,
  Divider,
} from "@fluentui/react-components";
import {
  BrainCircuit24Regular,
  SignOut20Regular,
  Navigation20Regular,
  CheckmarkCircle20Filled,
  Location20Regular,
  ChatBubblesQuestion20Regular,
  ChevronRight20Regular,
  Open20Regular,
} from "@fluentui/react-icons";
import { Logo } from "./Logo";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";

const useStyles = makeStyles({
  header: {
    height: "56px",
    backgroundColor: tokens.colorBrandBackground,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `0 ${tokens.spacingHorizontalXL}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    zIndex: 1000,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalL,
  },
  hamburgerButton: {
    minWidth: "32px",
    color: "#fff",
    ":hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    userSelect: "none",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  popoverButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 0,
  },
  popoverContent: {
    display: "flex",
    flexDirection: "column",
    minWidth: "360px",
    padding: 0,
  },
  popoverHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  viewAccount: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "13px",
    color: tokens.colorBrandForeground1,
    cursor: "pointer",
    marginTop: "4px",
    ":hover": {
      textDecoration: "underline",
    },
  },
  signOutLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "14px",
    ":hover": {
      textDecoration: "underline",
    },
  },
  popoverItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    cursor: "pointer",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  roleSwitcher: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px 20px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  roleSwitcherButtons: {
    display: "flex",
    gap: "8px",
  },
  roleButton: {
    flex: 1,
    padding: "6px 12px",
    borderRadius: "6px",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    color: tokens.colorNeutralForeground2,
    textAlign: "center",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  roleButtonActive: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    borderColor: tokens.colorBrandBackground,
    ":hover": {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  signOutButton: {
    padding: "12px 16px",
    textAlign: "center",
    cursor: "pointer",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
});

interface BreadcrumbConfig {
  current: string;
  parent?: { label: string; path: string };
}

const pageTitles: Record<string, string> = {
  "/dashboard/": "Dashboard",
  "/dashboard": "Dashboard",
  "/dashboard/wellbeing": "Wellbeing & Risks",
  "/dashboard/team": "My Team",
  "/dashboard/prep": "1:1 Planner",
  "/dashboard/signals": "Signals",
  "/dashboard/devplan": "Dev Plan",
  "/dashboard/feedback360": "360 Feedback",
  "/dashboard/member-wellbeing": "Well-Being",
  "/dashboard/settings": "Settings",
};

interface AppHeaderProps {
  isNavOpen: boolean;
  onToggleNav: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ isNavOpen, onToggleNav }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, setRole } = useRole();

  const userName = role === "member" ? "Alex Chen" : "Magnus Lindqvist";
  const userTitle = role === "member" ? "Mid Developer" : "Team Lead";

  const getBreadcrumb = (): BreadcrumbConfig => {
    const path = location.pathname;
    
    if (path.startsWith("/dashboard/teams/1/members/")) {
      return {
        current: "Team Member",
        parent: { label: "My Team", path: "/dashboard/team" },
      };
    }
    
    return {
      current: pageTitles[path] || "Dashboard",
    };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          appearance="subtle"
          icon={<Navigation20Regular />}
          className={styles.hamburgerButton}
          aria-label="Toggle navigation"
          aria-expanded={isNavOpen}
          onClick={onToggleNav}
        />
        <div
          className={styles.logo}
          role="button"
          tabIndex={0}
          onClick={() => navigate("/dashboard")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/dashboard");
            }
          }}
        >
          <Logo size={32} iconSize={20} />
          <Text
            weight="semibold"
            size={400}
            style={{
              color: "#fff",
              letterSpacing: "-0.3px",
            }}
          >
            LogIQ
          </Text>
        </div>
        <Breadcrumb aria-label="Breadcrumb" size="small">
          <BreadcrumbDivider style={{ color: "rgba(255,255,255,0.4)" }} />
          {breadcrumb.parent ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbButton
                  onClick={() => navigate(breadcrumb.parent!.path)}
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {breadcrumb.parent.label}
                </BreadcrumbButton>
              </BreadcrumbItem>
              <BreadcrumbDivider style={{ color: "rgba(255,255,255,0.4)" }} />
              <BreadcrumbItem>
                <BreadcrumbButton current style={{ color: "#fff" }}>
                  {breadcrumb.current}
                </BreadcrumbButton>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbButton current style={{ color: "#fff" }}>
                {breadcrumb.current}
              </BreadcrumbButton>
            </BreadcrumbItem>
          )}
        </Breadcrumb>
      </div>
      <div className={styles.headerRight}>
        <Popover withArrow positioning="below-end">
          <PopoverTrigger disableButtonEnhancement>
            <button className={styles.popoverButton}>
              <Persona
                name={userName.split(" ")[0]}
                secondaryText={
                  {
                    children: userTitle,
                    style: { color: "rgba(255,255,255,0.7)" },
                  } as any
                }
                size="small"
                avatar={{ color: "platinum" }}
                style={{ color: "#fff" }}
                primaryText={{ style: { color: "#fff" } } as any}
              />
            </button>
          </PopoverTrigger>
          <PopoverSurface>
            <div className={styles.popoverContent}>
              <div className={styles.popoverHeader}>
                <Text weight="semibold" size={400}>LogIQ</Text>
                <div className={styles.signOutLink} onClick={() => navigate('/')}>
                  <SignOut20Regular />
                  <Text size={300}>Sign out</Text>
                </div>
              </div>

              <div className={styles.userInfo}>
                <Persona
                  name={userName}
                  secondaryText={role === "member" ? "alex.chen@logiq.com" : "magnus.lindqvist@logiq.com"}
                  size="extra-large"
                  avatar={{ color: "colorful" }}
                  textAlignment="start"
                />
                <div className={styles.viewAccount} style={{ marginLeft: 'auto', alignSelf: 'flex-start', marginTop: '8px' }}>
                  <Text size={300}>View account</Text>
                  <Open20Regular style={{ fontSize: "14px" }} />
                </div>
              </div>

              <div className={styles.roleSwitcher}>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Switch role</Text>
                <div className={styles.roleSwitcherButtons}>
                  <button
                    className={role === "lead" ? `${styles.roleButton} ${styles.roleButtonActive}` : styles.roleButton}
                    onClick={() => setRole("lead")}
                  >
                    Team Lead
                  </button>
                  <button
                    className={role === "member" ? `${styles.roleButton} ${styles.roleButtonActive}` : styles.roleButton}
                    onClick={() => setRole("member")}
                  >
                    Member
                  </button>
                </div>
              </div>

              <div className={styles.popoverItem}>
                <div className={styles.itemLeft}>
                  <Location20Regular style={{ fontSize: "20px", color: tokens.colorNeutralForeground3 }} />
                  <Text size={300}>Set work location</Text>
                </div>
                <ChevronRight20Regular style={{ fontSize: "16px", color: tokens.colorNeutralForeground3 }} />
              </div>
            </div>
          </PopoverSurface>
        </Popover>
      </div>
    </div>
  );
};
