// src/shared/employment/employmentStorageHelpers.ts
// Session 17: Internal helpers for employment storage.
// Not consumed directly — used by employmentStorage.ts only.

import type {
  EmploymentRecord,
  EmploymentStatus,
  ExitType,
  NoticePeriodDays,
  EmployeeResignReason,
  EmployerTerminateReason,
  TimelineEntry,
} from "./employmentTypes";
import { VALID_TRANSITIONS } from "./employmentTypes";

/* ── Storage Keys ── */
export const EMPLOYMENT_KEY = "wm_career_employment_v1";
export const EXIT_LOG_KEY = "wm_career_exit_log_v1";
export const CHANGE_EVENT = "wm:employment-changed";

/* ── Read / Write ── */
export function readAll(): EmploymentRecord[] {
  try {
    const raw = localStorage.getItem(EMPLOYMENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EmploymentRecord[]) : [];
  } catch {
    return [];
  }
}

export function writeAll(records: EmploymentRecord[]): void {
  localStorage.setItem(EMPLOYMENT_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/* ── Exit Log ── */
export type ExitLogEntry = {
  employmentId: string;
  exitType: ExitType;
  reason: EmployeeResignReason | EmployerTerminateReason | null;
  notes: string;
  timestamp: number;
};

export function appendExitLog(entry: ExitLogEntry): void {
  try {
    const raw = localStorage.getItem(EXIT_LOG_KEY);
    const log: ExitLogEntry[] = raw ? (JSON.parse(raw) as ExitLogEntry[]) : [];
    log.push(entry);
    localStorage.setItem(EXIT_LOG_KEY, JSON.stringify(log));
  } catch {
    /* silent — non-critical audit log */
  }
}

/* ── Timeline Helper ── */
export function addTimeline(
  record: EmploymentRecord,
  status: EmploymentStatus | "withdrawn",
  actor: TimelineEntry["actor"],
  note: string,
): void {
  record.timeline.push({ status, timestamp: Date.now(), actor, note });
}

/* ── Duration Calculator ── */
export function calcDuration(startMs: number, endMs: number): { days: number; display: string } {
  const diffMs = Math.max(0, endMs - startMs);
  const totalDays = Math.floor(diffMs / 86_400_000);
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  let display: string;
  if (months > 0 && days > 0) display = `${months} month${months > 1 ? "s" : ""}, ${days} day${days > 1 ? "s" : ""}`;
  else if (months > 0) display = `${months} month${months > 1 ? "s" : ""}`;
  else display = `${days} day${days > 1 ? "s" : ""}`;

  return { days: totalDays, display };
}

/* ── Last Working Day Calculator ── */
export function calcLastWorkingDay(resignedAt: number, noticePeriodDays: NoticePeriodDays): number | null {
  if (noticePeriodDays === 0) return null;
  return resignedAt + noticePeriodDays * 86_400_000;
}

/* ── Transition Validator ── */
export function isValidTransition(from: EmploymentStatus, to: EmploymentStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

/* ── Find Record Index ── */
export function findRecordIndex(all: EmploymentRecord[], careerPostId: string): number {
  return all.findIndex((r) => r.careerPostId === careerPostId);
}