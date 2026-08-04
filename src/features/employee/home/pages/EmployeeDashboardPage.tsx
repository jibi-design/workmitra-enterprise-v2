/** Job Mitra | EmployeeDashboardPage — My Dashboard (Wave 3 retention shell) */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { AvailabilityPulseWidget } from "../components/dashboard/AvailabilityPulseWidget";
import { ShiftEarningsEstimatorWidget } from "../components/dashboard/ShiftEarningsEstimatorWidget";
import { TodayIRestRitualWidget } from "../components/dashboard/TodayIRestRitualWidget";
import { UniversalCalendarLayerWidget } from "../components/dashboard/UniversalCalendarLayerWidget";

export function EmployeeDashboardPage() {
  const nav = useNavigate();

  return (
    <div className="wm-dashPage" data-testid="employee-dashboard-page">
      <header className="wm-dashHero">
        <button
          type="button"
          className="wm-dashHero__back"
          onClick={() => nav(ROUTE_PATHS.employeeHome)}
          aria-label="Back to home"
        >
          ← Home
        </button>
        <div className="wm-dashHero__kicker">Daily Work-Life OS</div>
        <h1 className="wm-dashHero__title">My Dashboard</h1>
        <p className="wm-dashHero__sub">
          Insights &amp; activity — availability, rest ritual, earnings estimate, and calendar. Work
          Diary stays private and separate.
        </p>
      </header>

      <div className="wm-dashStack">
        <AvailabilityPulseWidget />
        <TodayIRestRitualWidget />
        <ShiftEarningsEstimatorWidget />
        <UniversalCalendarLayerWidget />
      </div>
    </div>
  );
}
