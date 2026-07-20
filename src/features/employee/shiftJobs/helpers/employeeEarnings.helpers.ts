// App name: Job Mitra
// File name: employeeEarnings.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\helpers\employeeEarnings.helpers.ts

export const EARNINGS_GREEN = "#16a34a";

export function formatEarningsDateRange(startAt: number, endAt: number): string {
  try {
    const start = new Date(startAt);
    const end = new Date(endAt);

    const startText = start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    if (start.toDateString() === end.toDateString()) {
      return startText;
    }

    const endText = end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return `${startText} - ${endText}`;
  } catch {
    return "";
  }
}

export function getBreakdownPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}
