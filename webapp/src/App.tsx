import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { FluentProvider, makeStyles } from "@fluentui/react-components";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { logiqLightTheme } from "./theme/logiqTheme";
import { RoleProvider, useRole } from "./contexts/RoleContext";
import { CopilotProvider, useCopilot } from "./contexts/CopilotContext";
import { AICoachProvider, useAICoach } from "./contexts/AICoachContext";
import Navigation from './components/Navigation';
import { AppHeader } from './components/AppHeader';
import { CopilotFAB } from './components/CopilotFAB';
import { CopilotPanel } from './components/CopilotPanel';
import { AICoachPanel } from './components/AICoachPanel';
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import DemoMode from "./pages/DemoMode";
import Index from "./pages/Index";
import MyTeam from "./pages/MyTeam";
import WellbeingRisks from "./pages/WellbeingRisks";
import PrepRouter from "./pages/PrepRouter";
import TeamMemberDetail from "./pages/TeamMemberDetail";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import MemberSignals from "./pages/MemberSignals";
import MemberDevPlan from "./pages/MemberDevPlan";
import MemberWellbeing from "./pages/MemberWellbeing";
import Feedback360 from "./pages/Feedback360";
import MemberPrep from "./pages/MemberPrep";

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { role } = useRole();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (!allowedRoles.includes(role)) {
      navigate('/dashboard', { replace: true });
    }
  }, [role, allowedRoles, navigate]);
  
  if (!allowedRoles.includes(role)) {
    return null;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const useStyles = makeStyles({
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  bodyContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#f5f5f5',
  },
});

const DashboardLayout: React.FC = () => {
  const styles = useStyles();
  const [searchParams] = useSearchParams();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const { isCopilotOpen, setIsCopilotOpen } = useCopilot();
  const { isAICoachOpen, setIsAICoachOpen } = useAICoach();
  
  const isEmbedMode = searchParams.get('embed') === 'true';

  return (
    <div className={styles.appContainer}>
      {!isEmbedMode && <AppHeader isNavOpen={isNavOpen} onToggleNav={() => setIsNavOpen(!isNavOpen)} />}
      <div className={styles.bodyContainer}>
        {!isEmbedMode && <Navigation isCollapsed={!isNavOpen} />}
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/wellbeing" element={<WellbeingRisks />} />
            <Route path="/team" element={<MyTeam />} />
            <Route path="/teams/1/members/:id" element={<TeamMemberDetail />} />
            <Route path="/prep" element={<PrepRouter />} />
            <Route path="/member-wellbeing" element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberWellbeing />
              </ProtectedRoute>
            } />
            <Route path="/signals" element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberSignals />
              </ProtectedRoute>
            } />
            <Route path="/devplan" element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberDevPlan />
              </ProtectedRoute>
            } />
            <Route path="/feedback360" element={
              <ProtectedRoute allowedRoles={['member']}>
                <Feedback360 />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        {isCopilotOpen && <CopilotPanel open={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />}
        {isAICoachOpen && <AICoachPanel open={isAICoachOpen} onClose={() => setIsAICoachOpen(false)} />}
      </div>
      {!isCopilotOpen && !isAICoachOpen && !isEmbedMode && <CopilotFAB onClick={() => setIsCopilotOpen(true)} />}
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/demo" element={<DemoMode />} />
      <Route path="/dashboard/*" element={<DashboardLayout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <FluentProvider theme={logiqLightTheme}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true }}>
            <RoleProvider>
              <CopilotProvider>
                <AICoachProvider>
                  <AppContent />
                </AICoachProvider>
              </CopilotProvider>
            </RoleProvider>
          </BrowserRouter>
        </TooltipProvider>
      </FluentProvider>
    </QueryClientProvider>
  );
};

export default App;
