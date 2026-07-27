import type { WorkDiaryCycleSetting } from "./workDiary.storage.internal";

export function clampStartDay(day: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(31, Math.max(1, Math.floor(day)));
}

export function dateKeyToDate(dateKey: string): Date | null {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return null;

  return new Date(y, m - 1, d);
}

export function isWithinRange(dateKey: string, start: Date, end: Date): boolean {
  const date = dateKeyToDate(dateKey);
  if (!date) return false;

  return date >= start && date <= end;
}

export function getCycleRangeForDate(
  referenceDate: Date,
  setting: WorkDiaryCycleSetting,
): { start: Date; end: Date } {
  const mode = setting.mode;
  const startDay = clampStartDay(setting.startDay);

  if (mode === "calendar_month" || startDay === 1) {
    return {
      start: new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
      end: new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0),
    };
  }

  const currentDay = referenceDate.getDate();
  const start =
    currentDay >= startDay
      ? new Date(referenceDate.getFullYear(), referenceDate.getMonth(), startDay)
      : new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, startDay);

  const nextMonthLastDay = new Date(start.getFullYear(), start.getMonth() + 2, 0).getDate();
  const safeNextStartDay = Math.min(startDay, nextMonthLastDay);
  const nextStart = new Date(start.getFullYear(), start.getMonth() + 1, safeNextStartDay);

  const end = new Date(nextStart);
  end.setDate(end.getDate() - 1);

  return { start, end };
}

export function getCycleRangeForMonth(
  year: number,
  month: number,
  setting: WorkDiaryCycleSetting,
): { start: Date; end: Date } {
  const mode = setting.mode;
  const startDay = clampStartDay(setting.startDay);
  const monthIndex = month - 1;

  if (mode === "calendar_month" || startDay === 1) {
    return {
      start: new Date(year, monthIndex, 1),
      end: new Date(year, monthIndex + 1, 0),
    };
  }

  const startMonthLastDay = new Date(year, monthIndex + 1, 0).getDate();
  const safeStartDay = Math.min(startDay, startMonthLastDay);
  const start = new Date(year, monthIndex, safeStartDay);

  const nextMonthLastDay = new Date(year, monthIndex + 2, 0).getDate();
  const safeNextStartDay = Math.min(startDay, nextMonthLastDay);
  const nextStart = new Date(year, monthIndex + 1, safeNextStartDay);

  const end = new Date(nextStart);
  end.setDate(end.getDate() - 1);

  return { start, end };
}
