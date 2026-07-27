import { employmentStorage } from "../../../../../shared/employment/employmentStorage";
import type { EmploymentRecord } from "../../../../../shared/employment/employmentTypes";

export const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
export const CAREER_BLUE_DEEP = "#1e3a8a";
export const CAREER_TEXT = "var(--wm-career-text, #111827)";
export const CAREER_MUTED = "var(--wm-career-muted, #6b7280)";
export const DANGER = "var(--wm-error, #dc2626)";
export const WARNING = "#b45309";
export const DAY_MS = 86_400_000;

let cachedRecords: EmploymentRecord[] = [];

export function getEmploymentSnapshot(): EmploymentRecord[] {
  const fresh = employmentStorage.getAll();
  if (JSON.stringify(fresh) !== JSON.stringify(cachedRecords)) cachedRecords = fresh;
  return cachedRecords;
}

function isRepairTimelineEntry(note: string): boolean {
  const normalized = note.toLowerCase();
  return (
    normalized.includes("repaired") || normalized.includes("corrected to active joined employment")
  );
}

export function makeVisibleTimelineRecord(record: EmploymentRecord): EmploymentRecord {
  return {
    ...record,
    timeline: record.timeline.filter((entry) => !isRepairTimelineEntry(entry.note)),
  };
}

export function formatDateLabel(timestamp: number | null | undefined): string {
  if (!timestamp) return "Not set";
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Not set";
  }
}

export function getNoticeDaysLeft(lastWorkingDay: number | null | undefined): number | null {
  if (!lastWorkingDay) return null;
  return Math.max(0, Math.ceil((lastWorkingDay - Date.now()) / DAY_MS));
}
