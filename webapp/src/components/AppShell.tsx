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
  Tooltip,
  Divider,
  useRestoreFocusTarget,
} from "@fluentui/react-components";
import {
  AppItem,
  Hamburger,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavDrawerFooter,
  NavItem,
  NavDivider,
  NavSectionHeader,
} from "@fluentui/react-nav-preview";
import {
  Board20Filled,
  Board20Regular,
  HeartPulse20Filled,
  HeartPulse20Regular,
  People20Filled,
  People20Regular,
  PersonSearch20Filled,
  PersonSearch20Regular,
  Alert20Filled,
  Alert20Regular,
  TargetArrow20Filled,
  TargetArrow20Regular,
  ClipboardTask20Filled,
  ClipboardTask20Regular,
  Chat20Filled,
  Chat20Regular,
  Settings20Filled,
  Settings20Regular,
  PersonCircle32Regular,
  SignOut20Regular,
  BrainCircuit24Regular,
  bundleIcon,
} from "@fluentui/react-icons";
import { useState, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { CopilotFAB } from "./CopilotFAB";
import { CopilotPanel } from "./CopilotPanel";
import { AICoachPanel } from "./AICoachPanel";
import { useRole } from "../contexts/RoleContext";
import { useCopilot } from "../contexts/CopilotContext";
import { useAICoach } from "../contexts/AICoachContext";
import { useEmployees } from "../hooks/useApiData";
import type { Employee } from "@/lib/api";

const DashboardIcon = bundleIcon(Board20Filled, Board20Regular);
const WellbeingRisks = bundleIcon(HeartPulse20Filled, HeartPulse20Regular);
const MyTeam = bundleIcon(People20Filled, People20Regular);
const PlannerIcon = bundleIcon(PersonSearch20Filled, PersonSearch20Regular);
const SignalsIcon = bundleIcon(Alert20Filled, Alert20Regular);
const DevPlanIcon = bundleIcon(TargetArrow20Filled, TargetArrow20Regular);
const DeliveryIcon = bundleIcon(ClipboardTask20Filled, ClipboardTask20Regular);
const PrepIcon = bundleIcon(Chat20Filled, Chat20Regular);
const SettingsIcon = bundleIcon(Settings20Filled, Settings20Regular);

const useStyles = makeStyles({
  root: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    '& nav': {
      width: "240px",
      minWidth: "240px",
    },
  },
  contentWithCopilot: {
    display: "flex",
    flexGrow: 1,
    minWidth: "0px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "48px",
    paddingLeft: "16px",
    paddingRight: "16px",
    backgroundColor: tokens.colorBrandBackground,
    color: "#fff",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: "0px",
    overflow: "hidden",
  },
  main: {
    flexGrow: 1,
    overflow: "auto",
    padding: "24px",
    backgroundColor: tokens.colorNeutralBackground2,
    "@media (max-width: 768px)": {
      padding: "16px",
    },
    "@media (max-width: 480px)": {
      padding: "12px",
    },
  },
  memberLabel: {
    display: "block",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: tokens.colorNeutralForeground3,
    padding: "16px 16px 0",
  },
  memberName: {
    display: "block",
    padding: "2px 16px 12px",
    fontWeight: 600,
    fontSize: "14px",
  },
  signalBadge: {
    backgroundColor: "#d13438",
    color: "#fff",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: 700,
    padding: "1px 7px",
    marginLeft: "auto",
  },
});

interface NavItemConfig {
  icon: ReturnType<typeof bundleIcon>;
  label: string;
  value: string;
  path: string;
  badge?: number;
}

const leadNavItems: NavItemConfig[] = [
  { icon: DashboardIcon, label: "Dashboard", value: "dashboard", path: "/dashboard" },
  { icon: WellbeingRisks, label: "Wellbeing & Risks", value: "wellbeing", path: "/wellbeing" },
  { icon: MyTeam, label: "My Team", value: "team", path: "/team" },
  { icon: PlannerIcon, label: "1:1 Planner", value: "prep", path: "/prep" },
];

const memberNavItems: NavItemConfig[] = [
  { icon: DashboardIcon, label: "Dashboard", value: "dashboard", path: "/dashboard" },
  { icon: SignalsIcon, label: "Signals", value: "signals", path: "/signals", badge: 2 },
  { icon: DevPlanIcon, label: "Dev Plan", value: "devplan", path: "/devplan" },
  { icon: WellbeingRisks, label: "Well-Being", value: "member-wellbeing", path: "/member-wellbeing" },
  { icon: PlannerIcon, label: "360 Feedback", value: "feedback360", path: "/feedback360" },
  { icon: PrepIcon, label: "1:1 Prep", value: "memberprep", path: "/prep" },
];

const leadPageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/wellbeing": "Wellbeing & Risks",
  "/team": "My Team",
  "/prep": "1:1 Planner",
  "/settings": "Settings",
};

const memberPageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/signals": "Signals",
  "/devplan": "Dev Plan",
  "/member-wellbeing": "Well-Being",
  "/feedback360": "360 Feedback",
  "/prep": "1:1 Prep",
  "/settings": "Settings",
};

function resolveNav(pathname: string, items: NavItemConfig[]) {
  const exact = items.find((i) => i.path === pathname);
  if (exact) return exact;
  if (pathname.startsWith("/teams/")) return items.find((i) => i.path === "/team");
  return items.find((i) => pathname.startsWith(i.path + "/"));
}

function resolveBreadcrumb(pathname: string, titles: Record<string, string>, employees: Employee[]): { parent?: { label: string; path: string }; current: string } {
  if (pathname.startsWith("/teams/1/members/")) {
    const id = pathname.split("/teams/1/members/")[1]?.split("/")[0];
    const emp = employees.find((e) => e.id === id);
    return { parent: { label: "My Team", path: "/team" }, current: emp?.name ?? "Team Member" };
  }
  const title = titles[pathname] || "Dashboard";
  return { current: title };
}

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const styles = useStyles();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const { isCopilotOpen, setIsCopilotOpen } = useCopilot();
  const { isAICoachOpen, setIsAICoachOpen } = useAICoach();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { role, userName, userTitle } = useRole();
  const { data: employees = [] } = useEmployees("team1");

  const isEmbedded = searchParams.get("embed") === "true" || searchParams.get("chromeless") === "true";

  const restoreFocusTargetAttributes = useRestoreFocusTarget();

  const navItems = role === "member" ? memberNavItems : leadNavItems;
  const pageTitles = role === "member" ? memberPageTitles : leadPageTitles;

  const matchedNav = resolveNav(location.pathname, navItems);
  const activeValue = matchedNav?.value || "dashboard";
  const breadcrumb = resolveBreadcrumb(location.pathname, pageTitles, employees);

  const handleNavSelect = useCallback((_: unknown, data: { value: string }) => {
    const items = role === "member" ? memberNavItems : leadNavItems;
    const item = items.find((i) => i.value === data.value);
    if (item) navigate(item.path);
  }, [navigate, role]);


  return (
    <div className={styles.root}>
      {!isEmbedded && (
      <NavDrawer
        open={isNavOpen}
        type="inline"
        selectedValue={activeValue}
        onNavItemSelect={handleNavSelect}
        onOpenChange={(_, data) => setIsNavOpen(data.open)}
      >
        <NavDrawerHeader>
          <Tooltip content="Navigation" relationship="label">
            <Hamburger onClick={() => setIsNavOpen(!isNavOpen)} />
          </Tooltip>
        </NavDrawerHeader>

        <NavDrawerBody>
          <AppItem icon={<PersonCircle32Regular />} as="button">
            LogIQ
          </AppItem>

          <NavSectionHeader>Overview</NavSectionHeader>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavItem key={item.value} icon={<Icon />} value={item.value}>
                <span style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  {item.label}
                  {item.badge && <span className={styles.signalBadge}>{item.badge}</span>}
                </span>
              </NavItem>
            );
          })}
        </NavDrawerBody>

        <NavDrawerFooter>
          <NavDivider />
          <NavItem icon={<SettingsIcon />} value="settings" onClick={() => navigate("/settings")}>
            Settings
          </NavItem>
        </NavDrawerFooter>
      </NavDrawer>
      )}

      <div className={styles.content}>
        {!isEmbedded && (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Tooltip content="Navigation" relationship="label">
              <Hamburger
                onClick={() => setIsNavOpen(!isNavOpen)}
                {...restoreFocusTargetAttributes}
                aria-expanded={isNavOpen}
                style={{ color: "#fff" }}
              />
            </Tooltip>
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate("/dashboard")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("/dashboard"); } }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "rgba(255,255,255,0.15)",
              }}>
                <BrainCircuit24Regular style={{ fontSize: "18px", color: "#fff" }} />
              </div>
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
                    <BreadcrumbButton onClick={() => navigate(breadcrumb.parent!.path)} style={{ color: "rgba(255,255,255,0.8)" }}>
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
                <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                  <Persona
                    name={userName.split(" ")[0]}
                    secondaryText={{ children: userTitle, style: { color: "rgba(255,255,255,0.7)" } } as any}
                    size="small"
                    avatar={{ color: "platinum" }}
                    style={{ color: "#fff" }}
                    primaryText={{ style: { color: "#fff" } }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverSurface style={{ padding: 0, minWidth: "280px", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                  <Text weight="semibold" size={300}>LogIQ Platform</Text>
                  <Button
                    appearance="transparent"
                    size="small"
                    icon={<SignOut20Regular />}
                    onClick={() => navigate("/")}
                    style={{ color: tokens.colorNeutralForeground2, minWidth: "auto" }}
                  >
                    Sign out
                  </Button>
                </div>
                <div style={{ padding: "16px" }}>
                  <Persona
                    name={userName}
                    secondaryText={userTitle}
                    tertiaryText={role === "member" ? "alex.chen@logiqapps.com" : "magnus@logiqapps.com"}
                    size="large"
                    avatar={{ color: "brand" }}
                    style={{ marginBottom: "12px" }}
                  />
                </div>
                <Divider style={{ margin: 0 }} />
                <div style={{ padding: "4px 0" }}>
                  <Button appearance="transparent" style={{ width: "100%", justifyContent: "flex-start", padding: "8px 16px", fontWeight: 400 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#107c10", display: "inline-block" }} />
                      Available
                    </span>
                  </Button>
                  <Button appearance="transparent" style={{ width: "100%", justifyContent: "flex-start", padding: "8px 16px", fontWeight: 400 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px" }}>📍</span>
                      Set work location
                    </span>
                  </Button>
                  <Button appearance="transparent" style={{ width: "100%", justifyContent: "flex-start", padding: "8px 16px", fontWeight: 400 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px" }}>✏️</span>
                      Set status message
                    </span>
                  </Button>
                </div>
              </PopoverSurface>
            </Popover>
          </div>
        </div>
        )}
        <div className={`${styles.main} page-animate stagger-children`} key={location.pathname}>
          {children}
        </div>
      </div>
      {isCopilotOpen && <CopilotPanel open={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />}
      {isAICoachOpen && <AICoachPanel open={isAICoachOpen} onClose={() => setIsAICoachOpen(false)} />}
      {!isCopilotOpen && !isAICoachOpen && <CopilotFAB onClick={() => setIsCopilotOpen(true)} />}
    </div>
  );
};
