import {
} from "@fluentui/react-components";
import { PageHeader } from "../components/PageHeader";
import { AppShell } from "../components/AppShell";
import { SignalBanner } from "../components/SignalBanner";
import { KPICards } from "../components/KPICards";
import { FinancialSummary } from "../components/FinancialSummary";
import { RecentSignals } from "../components/RecentSignals";
import { AtRiskEmployees } from "../components/AtRiskEmployees";
import { InsightsRecommendations } from "../components/InsightsRecommendations";
import { useSignals, useTeamKPIs, useTeamFinancials, useEmployees } from "../hooks/useApiData";
import {
  KPICardsSkeleton,
  FinancialSummarySkeleton,
  SignalsSkeleton,
  AtRiskSkeleton,
  ErrorState,
  SkeletonBlock,
} from "../components/LoadingState";
import { useRole } from "../contexts/RoleContext";
import MemberDashboardWidgets from "../components/MemberDashboardWidgets";

const Index = () => {
  const { role } = useRole();
  const signalsQuery = useSignals();
  const kpisQuery = useTeamKPIs();
  const financialsQuery = useTeamFinancials();
  const employeesQuery = useEmployees();

  const urgentCount = signalsQuery.data
    ? signalsQuery.data.filter((s) => s.type === "critical").length + 1
    : 0;

  return (
    <AppShell>
      <div style={{ maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        {role === "member" ? (
          <MemberDashboardWidgets />
        ) : (
          <>
            <PageHeader title="Team Dashboard" subtitle="Intelligence overview for your team of 10" />

            {signalsQuery.isLoading ? (
              <SkeletonBlock width="100%" height="44px" style={{ marginBottom: "16px", borderRadius: "8px" }} />
            ) : signalsQuery.isError ? null : (
              <SignalBanner count={urgentCount} />
            )}

            {kpisQuery.isLoading ? (
              <KPICardsSkeleton />
            ) : kpisQuery.isError ? (
              <ErrorState message="Failed to load KPIs." onRetry={() => kpisQuery.refetch()} />
            ) : (
              <KPICards data={kpisQuery.data} />
            )}

            {financialsQuery.isLoading ? (
              <FinancialSummarySkeleton />
            ) : financialsQuery.isError ? (
              <ErrorState message="Failed to load financials." onRetry={() => financialsQuery.refetch()} />
            ) : (
              <FinancialSummary data={financialsQuery.data} />
            )}

            <InsightsRecommendations />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: "24px" }}>
              {signalsQuery.isLoading ? (
                <SignalsSkeleton />
              ) : signalsQuery.isError ? (
                <ErrorState message="Failed to load signals." onRetry={() => signalsQuery.refetch()} />
              ) : (
                <RecentSignals signals={signalsQuery.data!} />
              )}

              {employeesQuery.isLoading ? (
                <AtRiskSkeleton />
              ) : employeesQuery.isError ? (
                <ErrorState message="Failed to load employees." onRetry={() => employeesQuery.refetch()} />
              ) : (
                <AtRiskEmployees employees={employeesQuery.data!} />
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default Index;
