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
function pickMlId(rec: Record<string, unknown>, mlKey: string, legacyWmKey: string): string {
  // Dual-read: prefer *MlId; accept legacy *WmId from older localStorage JSON.
  const ml = rec[mlKey];
  if (typeof ml === "string" && ml.trim()) return ml;
  const legacy = rec[legacyWmKey];
  return typeof legacy === "string" ? legacy : "";
}

function normalizeEmploymentRecord(raw: unknown): EmploymentRecord | null {
  if (typeof raw !== "object" || raw === null) return null;
  const rec = raw as Record<string, unknown> & EmploymentRecord;
  if (typeof rec.careerPostId !== "string" || !rec.careerPostId.trim()) return null;
  if (typeof rec.id !== "string" || !rec.id.trim()) return null;

  const employeeMlId = pickMlId(rec as Record<string, unknown>, "employeeMlId", "employeeWmId");
  const employerMlId = pickMlId(rec as Record<string, unknown>, "employerMlId", "employerWmId");

  // Do not drop records with empty ML ids — demo/E2E may create before uniqueId is set.
  return {
    ...(rec as EmploymentRecord),
    employeeMlId: employeeMlId || (typeof rec.employeeId === "string" ? rec.employeeId : ""),
    employerMlId: employerMlId || (typeof rec.employerId === "string" ? rec.employerId : ""),
  };
}

export function readAll(): EmploymentRecord[] {
  try {
    const raw = localStorage.getItem(EMPLOYMENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEmploymentRecord).filter((r): r is EmploymentRecord => r !== null);
  } catch {
    return [];
  }
}

export type EmploymentStorageWriteResult = { ok: true } | { ok: false; reason: "storage_error" };

export function writeAllChecked(records: EmploymentRecord[]): EmploymentStorageWriteResult {
  try {
    localStorage.setItem(EMPLOYMENT_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

export function writeAll(records: EmploymentRecord[]): void {
  writeAllChecked(records);
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
  timestamp?: number,
): void {
  record.timeline.push({ status, timestamp: timestamp ?? Date.now(), actor, note });
}

/* ── Duration Calculator ── */
export function calcDuration(startMs: number, endMs: number): { days: number; display: string } {
  const diffMs = Math.max(0, endMs - startMs);
  const totalDays = Math.floor(diffMs / 86_400_000);
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  let display: string;
  if (months > 0 && days > 0)
    display = `${months} month${months > 1 ? "s" : ""}, ${days} day${days > 1 ? "s" : ""}`;
  else if (months > 0) display = `${months} month${months > 1 ? "s" : ""}`;
  else display = `${days} day${days > 1 ? "s" : ""}`;

  return { days: totalDays, display };
}

/* ── Last Working Day Calculator ── */
export function calcLastWorkingDay(
  resignedAt: number,
  noticePeriodDays: NoticePeriodDays,
): number | null {
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
