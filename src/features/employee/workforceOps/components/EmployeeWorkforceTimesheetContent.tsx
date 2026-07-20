// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceTimesheetContent.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceTimesheetContent.tsx

import { EmployeeWorkforceTimesheetEmptyState } from "./EmployeeWorkforceTimesheetEmptyState";
import { EmployeeWorkforceTimesheetGroups } from "./EmployeeWorkforceTimesheetGroups";
import { EmployeeWorkforceTimesheetHeader } from "./EmployeeWorkforceTimesheetHeader";
import { EmployeeWorkforceTimesheetSummary } from "./EmployeeWorkforceTimesheetSummary";
import type { TimesheetGroup, TimesheetMode } from "../types/timesheetForm.types";

export type { TimesheetMode, TimesheetEntry, TimesheetGroup } from "../types/timesheetForm.types";

type Props = {
  year: number;
  month: number;
  monthNames: string[];
  mode: TimesheetMode;
  primaryValue: number;
  primaryLabel: string;
  switchLabel: string;
  isCurrentMonth: boolean;
  groupedByGroup: TimesheetGroup[];
  onBack: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleMode: () => void;
};

export function EmployeeWorkforceTimesheetContent({
  year,
  month,
  monthNames,
  mode,
  primaryValue,
  primaryLabel,
  switchLabel,
  isCurrentMonth,
  groupedByGroup,
  onBack,
  onPrevMonth,
  onNextMonth,
  onToggleMode,
}: Props) {
  return (
    <div style={{ padding: "0 16px" }}>
      <EmployeeWorkforceTimesheetHeader
        year={year}
        month={month}
        monthNames={monthNames}
        isCurrentMonth={isCurrentMonth}
        onBack={onBack}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />

      <EmployeeWorkforceTimesheetSummary
        year={year}
        month={month}
        monthNames={monthNames}
        primaryValue={primaryValue}
        primaryLabel={primaryLabel}
        switchLabel={switchLabel}
        onToggleMode={onToggleMode}
      />

      {groupedByGroup.length > 0 ? (
        <EmployeeWorkforceTimesheetGroups mode={mode} groupedByGroup={groupedByGroup} />
      ) : (
        <EmployeeWorkforceTimesheetEmptyState
          year={year}
          month={month}
          monthNames={monthNames}
          isCurrentMonth={isCurrentMonth}
        />
      )}
    </div>
  );
}
