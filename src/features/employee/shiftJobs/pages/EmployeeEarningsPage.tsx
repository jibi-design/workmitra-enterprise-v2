// App name: Job Mitra | EmployeeEarningsPage.tsx — Wave B stack

import { EmployeeEarningsBreakdownSections } from "../components/EmployeeEarningsBreakdownSections";
import { EmployeeEarningsEmptyState } from "../components/EmployeeEarningsEmptyState";
import { EmployeeEarningsHeader } from "../components/EmployeeEarningsHeader";
import { EmployeeEarningsShiftList } from "../components/EmployeeEarningsShiftList";
import { EmployeeEarningsSummaryTiles } from "../components/EmployeeEarningsSummaryTiles";
import { useEmployeeEarningsSummary } from "../hooks/useEmployeeEarningsSummary";

export function EmployeeEarningsPage() {
  const summary = useEmployeeEarningsSummary("shift");
  const isEmpty = summary.totalShifts === 0;

  return (
    <div
      className="wm-ee-vShift wm-stackGrid"
      data-testid="shift-earnings-page"
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      <EmployeeEarningsHeader />

      {isEmpty ? (
        <div className="wm-animateIn" style={{ animationDelay: "60ms" }}>
          <EmployeeEarningsEmptyState />
        </div>
      ) : (
        <>
          <EmployeeEarningsSummaryTiles summary={summary} />
          <div className="wm-animateIn" style={{ animationDelay: "90ms" }}>
            <EmployeeEarningsBreakdownSections summary={summary} />
          </div>
          <EmployeeEarningsShiftList entries={summary.entries} />
        </>
      )}
    </div>
  );
}
