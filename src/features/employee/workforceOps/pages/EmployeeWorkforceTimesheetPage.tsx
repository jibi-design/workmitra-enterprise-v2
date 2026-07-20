// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceTimesheetPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\pages\EmployeeWorkforceTimesheetPage.tsx

import { useCallback, useMemo, useState } from "react";
import { EmployeeWorkforceTimesheetContent } from "../components/EmployeeWorkforceTimesheetContent";
import type {
  TimesheetGroup,
  TimesheetMode,
} from "../components/EmployeeWorkforceTimesheetContent";
import { employeeWorkforceHelpers } from "../services/employeeWorkforceHelpers";

type Props = {
  onBack: () => void;
};

const PREF_KEY = "wm_employee_timesheet_mode_v1";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function readMode(): TimesheetMode {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw === "hours" ? "hours" : "days";
  } catch {
    return "days";
  }
}

function writeMode(mode: TimesheetMode): void {
  try {
    localStorage.setItem(PREF_KEY, mode);
  } catch {
    // Demo-safe: ignore localStorage write failure.
  }
}

export function EmployeeWorkforceTimesheetPage({ onBack }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [mode, setMode] = useState<TimesheetMode>(readMode);

  const timesheet = useMemo(
    () => employeeWorkforceHelpers.getMyTimesheet(year, month),
    [year, month],
  );

  const goToPrevMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear((currentYear) => currentYear - 1);
      return;
    }

    setMonth((currentMonth) => currentMonth - 1);
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear((currentYear) => currentYear + 1);
      return;
    }

    setMonth((currentMonth) => currentMonth + 1);
  }, [month]);

  const toggleMode = useCallback(() => {
    const next: TimesheetMode = mode === "days" ? "hours" : "days";
    setMode(next);
    writeMode(next);
  }, [mode]);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const groupedByGroup = useMemo<TimesheetGroup[]>(() => {
    const map = new Map<string, TimesheetGroup>();

    for (const entry of timesheet.entries) {
      const existing = map.get(entry.groupId);
      const dayKey = new Date(entry.signInAt).toDateString();

      if (existing) {
        existing.entries.push(entry);
        existing.totalHours += entry.hoursWorked ?? 0;
        existing.uniqueDays.add(dayKey);
        continue;
      }

      const days = new Set<string>();
      days.add(dayKey);

      map.set(entry.groupId, {
        groupName: entry.groupName,
        totalHours: entry.hoursWorked ?? 0,
        uniqueDays: days,
        entries: [entry],
      });
    }

    return Array.from(map.values()).sort((a, b) => b.totalHours - a.totalHours);
  }, [timesheet]);

  const primaryValue = mode === "days" ? timesheet.totalDays : timesheet.totalHours;
  const primaryLabel = mode === "days" ? "Days Worked" : "Total Hours";
  const switchLabel = mode === "days" ? "Switch to Hours" : "Switch to Days";

  return (
    <EmployeeWorkforceTimesheetContent
      year={year}
      month={month}
      monthNames={MONTH_NAMES}
      mode={mode}
      primaryValue={primaryValue}
      primaryLabel={primaryLabel}
      switchLabel={switchLabel}
      isCurrentMonth={isCurrentMonth}
      groupedByGroup={groupedByGroup}
      onBack={onBack}
      onPrevMonth={goToPrevMonth}
      onNextMonth={goToNextMonth}
      onToggleMode={toggleMode}
    />
  );
}
