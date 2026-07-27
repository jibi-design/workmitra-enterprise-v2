// App name: Job Mitra
// File name: currentEmploymentCardHelpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\home\helpers\currentEmploymentCardHelpers.ts

import { workDiaryStorage } from "../../employment/storage/workDiary.storage";

export type EmploymentKpiSummary = {
  attendance: number;
  tasks: number;
  notices: number;
};

export type PersonalDiaryDisplayMetrics = {
  trackedHours: number;
  tasks: number;
  notes: number;
};

export function getWorkedCountForCurrentCycle(employmentId: string): number {
  const now = new Date();

  return workDiaryStorage.getCycleSummaryForMonth(
    employmentId,
    now.getFullYear(),
    now.getMonth() + 1,
  ).daysWorked;
}

export function getActiveTasksCount(hrId: string): number {
  try {
    const raw = localStorage.getItem("wm_task_assignment_v1");
    if (!raw) return 0;

    const all = JSON.parse(raw) as { employeeId: string; status: string }[];

    return all.filter(
      (task) =>
        task.employeeId === hrId && (task.status === "pending" || task.status === "in_progress"),
    ).length;
  } catch {
    return 0;
  }
}

export function getUnreadNoticesCount(): number {
  try {
    const raw = localStorage.getItem("wm_company_notices_v1");
    if (!raw) return 0;

    return (JSON.parse(raw) as { readReceipts?: string[] }[]).filter(
      (notice) => !notice.readReceipts || notice.readReceipts.length === 0,
    ).length;
  } catch {
    return 0;
  }
}

export function getEmploymentKpiSummary(employmentId: string): EmploymentKpiSummary {
  return {
    attendance: getWorkedCountForCurrentCycle(employmentId),
    tasks: getActiveTasksCount(employmentId),
    notices: getUnreadNoticesCount(),
  };
}

function getNotesCountForCurrentCycle(employmentId: string): number {
  const cycle = workDiaryStorage.getCurrentCycleSummary(employmentId);
  const entries = workDiaryStorage.getMonthEntries(employmentId, cycle.year, cycle.month);

  return entries.filter((entry) => (entry.notes?.trim().length ?? 0) > 0).length;
}

/** Display metrics for Personal Work Diary home card (private employee tracking). */
export function getPersonalDiaryDisplayMetrics(employmentId: string): PersonalDiaryDisplayMetrics {
  const cycle = workDiaryStorage.getCurrentCycleSummary(employmentId);
  const summary = getEmploymentKpiSummary(employmentId);

  return {
    trackedHours: Math.round(cycle.totalHours * 10) / 10,
    tasks: summary.tasks,
    notes: getNotesCountForCurrentCycle(employmentId),
  };
}

export function formatEmploymentDuration(nowMs: number, joinedAt: number): string {
  const totalDays = Math.floor(Math.max(0, nowMs - joinedAt) / 86400000);
  const years = Math.floor(totalDays / 365);
  const months = Math.floor(totalDays / 30);

  if (years > 0) return `${years} year${years === 1 ? "" : "s"}+`;
  if (months > 0) return `${months} month${months === 1 ? "" : "s"}+`;

  return "Just started";
}
