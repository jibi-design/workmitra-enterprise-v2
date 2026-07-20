// App name: Job Mitra
// File name: EmployeeEarningsPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\pages\EmployeeEarningsPage.tsx

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
    <div className="wm-ee-vShift">
      <EmployeeEarningsHeader />

      {isEmpty ? (
        <EmployeeEarningsEmptyState />
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
