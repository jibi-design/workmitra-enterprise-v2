// src/features/employee/home/helpers/employeeHomeHelpers.ts

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type EmployeeHomeDemoState = {
  flags?: {
    shiftEnabled?: boolean;
    careerEnabled?: boolean;
    workforceAssigned?: boolean;
  };
  counts?: {
    upcomingShifts7d?: number;
    applicationsOpen?: number;
    alerts?: number;
    shiftApplied?: number;
    shiftAssigned?: number;
    careerApplied?: number;
    careerInterviews?: number;
    workforceRoster?: number;
    workforceAlerts?: number;
    earningsMonth?: number;
    completedShifts?: number;
    responseRatePct?: number;
  };
};

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const DEMO_KEY = "wm_employee_home_demo_v1";

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
export function readDemo(): EmployeeHomeDemoState {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as EmployeeHomeDemoState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function n(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function formatNumber(value: number): string {
  try {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
  } catch {
    return String(value);
  }
}