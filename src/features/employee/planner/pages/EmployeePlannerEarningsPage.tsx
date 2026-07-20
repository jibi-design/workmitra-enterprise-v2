// Job Mitra | EmployeePlannerEarningsPage.tsx | Gig project earnings only

import { EmployeeEarningsBreakdownSections } from "../../shiftJobs/components/EmployeeEarningsBreakdownSections";
import { EmployeeEarningsEmptyState } from "../../shiftJobs/components/EmployeeEarningsEmptyState";
import { EmployeeEarningsHeader } from "../../shiftJobs/components/EmployeeEarningsHeader";
import { EmployeeEarningsShiftList } from "../../shiftJobs/components/EmployeeEarningsShiftList";
import { EmployeeEarningsSummaryTiles } from "../../shiftJobs/components/EmployeeEarningsSummaryTiles";
import { useEmployeeEarningsSummary } from "../../shiftJobs/hooks/useEmployeeEarningsSummary";

export function EmployeePlannerEarningsPage() {
  const summary = useEmployeeEarningsSummary("planner");
  const isEmpty = summary.totalShifts === 0;

  return (
    <div className="wm-ee-vPlanner wm-planner-page">
      <EmployeeEarningsHeader />

      {isEmpty ? (
        <EmployeeEarningsEmptyState domain="planner" />
      ) : (
        <>
          <EmployeeEarningsSummaryTiles summary={summary} />
          <EmployeeEarningsBreakdownSections summary={summary} />
          <EmployeeEarningsShiftList entries={summary.entries} />
        </>
      )}
    </div>
  );
}
