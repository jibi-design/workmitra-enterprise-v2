/** Candidate Pro Daily OS — Career + Shift + Planner insights hub. */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { useEmployeeUrgentPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployeeUrgentPendingHubItems";
import { useCandidateDashboardModel } from "../hooks/useCandidateDashboardModel";
import { useDailyOsShiftModel } from "../hooks/useDailyOsShiftModel";
import { countCriticalActions, pickNeedsYouItems } from "../helpers/dailyOs.helpers";
import { careerFunnelStageRoute, criticalTapRoute } from "../helpers/dailyOs.routes.helpers";
import { DailyOsHeroBar } from "../components/dailyOs/DailyOsHeroBar";
import { DailyOsCareerFunnel } from "../components/dailyOs/DailyOsCareerFunnel";
import { DailyOsPlannerCard } from "../components/dailyOs/DailyOsPlannerCard";
import { DailyOsInsightsGauge } from "../components/dailyOs/DailyOsInsightsGauge";
import { DailyOsTrendCard } from "../components/dailyOs/DailyOsTrendCard";
import { DailyOsShiftHeat } from "../components/dailyOs/DailyOsShiftHeat";
import { DailyOsActivityStream } from "../components/dailyOs/DailyOsActivityStream";
import { DailyOsCvChip } from "../components/dailyOs/DailyOsCvChip";
import { useDailyOsPlannerModel } from "../hooks/useDailyOsPlannerModel";
import { useDailyOsActivityModel } from "../hooks/useDailyOsActivityModel";
import { useDailyOsReady } from "../hooks/useDailyOsReady";
import { EmployeeHomeBanners } from "../components/EmployeeHomeTopTiles";

export type DailyOsDashboardProps = {
  readonly showBackToHome?: boolean;
};

export function DailyOsDashboard({ showBackToHome = true }: DailyOsDashboardProps) {
  const nav = useNavigate();
  const ready = useDailyOsReady();
  const [retryTick, setRetryTick] = useState(0);
  const retry = () => setRetryTick((value) => value + 1);
  const career = useCandidateDashboardModel();
  const shift = useDailyOsShiftModel();
  const planner = useDailyOsPlannerModel();
  const activity = useDailyOsActivityModel();
  const urgent = useEmployeeUrgentPendingHubItems(nav);
  const topAction = pickNeedsYouItems(urgent, 1)[0] ?? null;

  return (
    <div
      className="wm-dashPage wm-dailyOs"
      data-testid="employee-dashboard-page"
      data-candidate-dashboard="daily-os"
      data-retry={retryTick}
    >
      <header className="wm-dashHero wm-dailyOsHead">
        {showBackToHome ? (
          <button
            type="button"
            className="wm-dashHero__back"
            onClick={() => nav(ROUTE_PATHS.employeeHome)}
            aria-label="Back to home"
          >
            ← Home
          </button>
        ) : null}
        <div className="wm-dashHero__kicker">Candidate Pro</div>
        <h1 className="wm-dashHero__title">Insights & activity</h1>
      </header>

      <EmployeeHomeBanners />

      <DailyOsHeroBar
        todayKey={shift.todayKey}
        nextShift={shift.nextShift}
        criticalCount={countCriticalActions(urgent)}
        criticalLabel={topAction?.label ?? null}
        earningsTotal={shift.earningsTotal}
        earningsShifts={shift.earningsShifts}
        onOpenCritical={() => nav(criticalTapRoute(topAction))}
      />

      <DailyOsCvChip />

      <div className="wm-dailyOsBentoGrid" key={retryTick}>
        <DailyOsCareerFunnel
          counts={career.funnel}
          ready={ready}
          error={career.error}
          onRetry={retry}
          onOpenStage={(stage) => nav(careerFunnelStageRoute(stage))}
        />
        <DailyOsPlannerCard hours={planner.hours} ready={ready} error={planner.error} onRetry={retry} />
        <DailyOsInsightsGauge
          strengthPercent={career.completeness.percent}
          matchScores={career.recommendations.map((item) => item.matchPercent)}
          ready={ready}
          error={career.error}
          onRetry={retry}
          onOpenProfile={() => nav(ROUTE_PATHS.employeeProfile)}
        />
        <DailyOsTrendCard points={shift.spark} ready={ready} error={shift.error} onRetry={retry} />
      </div>

      <DailyOsShiftHeat cells={shift.heat} ready={ready} error={shift.error} onRetry={retry} />
      <DailyOsActivityStream
        items={activity.items}
        ready={ready}
        error={activity.error}
        onRetry={retry}
        onOpenItem={(route) => nav(route)}
      />
    </div>
  );
}
