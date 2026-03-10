import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FluentProvider } from "@fluentui/react-components";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { logiqLightTheme } from "./theme/logiqTheme";
import { RoleProvider } from "./contexts/RoleContext";
import { CopilotProvider } from "./contexts/CopilotContext";
import { AICoachProvider } from "./contexts/AICoachContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FluentProvider theme={logiqLightTheme}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RoleProvider>
          <CopilotProvider>
          <AICoachProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/demo" element={<DemoMode />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/team" element={<MyTeam />} />
              <Route path="/teams/1/members/:id" element={<TeamMemberDetail />} />
              <Route path="/wellbeing" element={<WellbeingRisks />} />
            <Route path="/prep" element={<PrepRouter />} />
            <Route path="/signals" element={<MemberSignals />} />
            <Route path="/devplan" element={<MemberDevPlan />} />
            <Route path="/member-wellbeing" element={<MemberWellbeing />} />
            <Route path="/feedback360" element={<Feedback360 />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </AICoachProvider>
          </CopilotProvider>
        </RoleProvider>
      </TooltipProvider>
    </FluentProvider>
  </QueryClientProvider>
);

export default App;
