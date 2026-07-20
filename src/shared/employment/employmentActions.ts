// src/shared/employment/employmentActions.ts

// Session 17: Employment status transition actions + notification triggers.

import type {
  EmploymentRecord,
  EmploymentStatus,
  EmployeeResignReason,
  EmployerTerminateReason,
} from "./employmentTypes";

import {
  EMPLOYEE_RESIGN_REASONS,
  EMPLOYER_TERMINATE_REASONS,
  FORCE_COMPLETE_GRACE_DAYS,
} from "./employmentTypes";

import {
  readAll,
  writeAllChecked,
  addTimeline,
  calcDuration,
  calcLastWorkingDay,
  isValidTransition,
  findRecordIndex,
  appendExitLog,
} from "./employmentStorageHelpers";

import {
  notifyEmployeeJoined,
  notifyEmployerResignation,
  notifyEmployerWithdrawal,
  notifyEmployeeResignConfirmed,
  notifyEmployeeTerminated,
  notifyBothPleaseRate,
  notifyEmployerForceCompleted,
} from "./employmentNotifications";

import { recordCareerClosureInVault } from "../../features/employee/workVault/services/careerVaultHistory.service";

const MAX_EXIT_NOTES_LENGTH = 240;

const VALID_EMPLOYEE_RESIGN_REASONS = new Set<EmployeeResignReason>(
  EMPLOYEE_RESIGN_REASONS.map((item) => item.value),
);

const VALID_EMPLOYER_TERMINATE_REASONS = new Set<EmployerTerminateReason>(
  EMPLOYER_TERMINATE_REASONS.map((item) => item.value),
);

function normalizeExitNotes(notes: string): string | null {
  const safeNotes = notes.trim();

  if (safeNotes.length > MAX_EXIT_NOTES_LENGTH) return null;

  return safeNotes;
}

function isValidEmployeeResignReason(reason: EmployeeResignReason): boolean {
  return VALID_EMPLOYEE_RESIGN_REASONS.has(reason);
}

function isValidEmployerTerminateReason(reason: EmployerTerminateReason): boolean {
  return VALID_EMPLOYER_TERMINATE_REASONS.has(reason);
}

function maybeNotifyPleaseRate(rec: EmploymentRecord): void {
  if (rec.employeeRated && rec.employerRated) return;

  notifyBothPleaseRate(rec.employeeName, rec.companyName, rec.jobTitle, rec.careerPostId);
}

/* ── Action Methods ── */

export const employmentActions = {
  /* ── Employer: Mark as Joined ── */

  markAsJoined(careerPostId: string, joinedAt: number): EmploymentRecord | null {
    const all = readAll();

    const idx = findRecordIndex(all, careerPostId);

    const now = Date.now();

    if (idx === -1 || !isValidTransition(all[idx].status, "working")) return null;

    if (!Number.isFinite(joinedAt) || joinedAt <= 0 || joinedAt > now) return null;

    all[idx].status = "working";

    all[idx].joinedAt = joinedAt;

    addTimeline(all[idx], "working", "employer", "Marked as joined", joinedAt);

    const write = writeAllChecked(all);

    if (!write.ok) return null;

    notifyEmployeeJoined(all[idx].jobTitle, all[idx].companyName);

    return all[idx];
  },

  /* ── Employee: Resign ── */

  resign(
    careerPostId: string,

    reason: EmployeeResignReason,

    notes: string,
  ): EmploymentRecord | null {
    const all = readAll();

    const idx = findRecordIndex(all, careerPostId);

    if (idx === -1) return null;

    const safeNotes = normalizeExitNotes(notes);

    if (safeNotes === null) return null;

    if (!isValidEmployeeResignReason(reason)) return null;

    const rec = all[idx];

    const target: EmploymentStatus = rec.noticePeriodDays > 0 ? "notice" : "resigned";

    if (!isValidTransition(rec.status, target)) return null;

    const now = Date.now();

    rec.status = target;

    rec.resignedAt = now;

    rec.exitType = "resigned";

    rec.exitReason = reason;

    rec.exitNotes = safeNotes;

    rec.lastWorkingDay = calcLastWorkingDay(now, rec.noticePeriodDays);

    const label =
      target === "notice"
        ? `Resigned with ${rec.noticePeriodDays}-day notice — ${reason}`
        : `Resigned — ${reason}`;

    addTimeline(rec, target, "employee", label, now);

    appendExitLog({
      employmentId: rec.id,
      exitType: "resigned",
      reason,
      notes: safeNotes,
      timestamp: now,
    });

    const write = writeAllChecked(all);

    if (!write.ok) return null;

    notifyEmployerResignation(rec.employeeName, rec.jobTitle);

    return rec;
  },

  /* ── Employee: Withdraw Resignation ── */

  withdrawResignation(careerPostId: string): EmploymentRecord | null {
    const all = readAll();

    const idx = findRecordIndex(all, careerPostId);

    if (idx === -1) return null;

    const rec = all[idx];

    if (rec.status !== "notice" && rec.status !== "resigned") return null;

    const now = Date.now();

    rec.status = "working";

    rec.resignedAt = null;

    rec.exitType = null;

    rec.exitReason = null;

    rec.exitNotes = "";

    rec.lastWorkingDay = null;

    rec.wasWithdrawn = true;

    rec.withdrawnAt = now;

    addTimeline(rec, "withdrawn", "employee", "Resignation withdrawn", now);

    const write = writeAllChecked(all);

    if (!write.ok) return null;

    notifyEmployerWithdrawal(rec.employeeName, rec.jobTitle);

    return rec;
  },

  /* ── Employer: Confirm Resignation ── */

  confirmResignation(careerPostId: string): EmploymentRecord | null {
    const all = readAll();

    const idx = findRecordIndex(all, careerPostId);

    if (idx === -1 || !isValidTransition(all[idx].status, "completed")) return null;

    const now = Date.now();

    const rec = all[idx];

    rec.status = "completed";

    rec.completedAt = now;

    if (rec.joinedAt) {
      const dur = calcDuration(rec.joinedAt, now);

      rec.workDurationDays = dur.days;

      rec.workDurationDisplay = dur.display;
    }

    addTimeline(rec, "completed", "employer", "Resignation confirmed", now);

    const write = writeAllChecked(all);

    if (!write.ok) return null;

    notifyEmployeeResignConfirmed(rec.jobTitle, rec.companyName);

    maybeNotifyPleaseRate(rec);

    recordCareerClosureInVault(rec, "resigned");

    return rec;
  },

  /* ── Employer: Terminate ── */

  terminate(
    careerPostId: string,

    reason: EmployerTerminateReason,

    notes: string,
  ): EmploymentRecord | null {
    const all = readAll();

    const idx = findRecordIndex(all, careerPostId);

    const safeNotes = normalizeExitNotes(notes);

    if (safeNotes === null) return null;

    if (!isValidEmployerTerminateReason(reason)) return null;

    if (idx === -1 || !isValidTransition(all[idx].status, "completed")) return null;

    const now = Date.now();

    const rec = all[idx];

    rec.status = "completed";

    rec.completedAt = now;

    rec.exitType = "terminated";

    rec.exitReason = reason;

    rec.exitNotes = safeNotes;

    if (rec.joinedAt) {
      const dur = calcDuration(rec.joinedAt, now);

      rec.workDurationDays = dur.days;

      rec.workDurationDisplay = dur.display;
    }

    addTimeline(rec, "completed", "employer", `Terminated — ${reason}`, now);

    appendExitLog({
      employmentId: rec.id,
      exitType: "terminated",
      reason,
      notes: safeNotes,
      timestamp: now,
    });

    const write = writeAllChecked(all);

    if (!write.ok) return null;

    notifyEmployeeTerminated(rec.jobTitle, rec.companyName);

    maybeNotifyPleaseRate(rec);

    recordCareerClosureInVault(rec, "terminated");

    return rec;
  },

  /* ── Employee: Force Complete (employer unresponsive) ── */

  forceComplete(careerPostId: string): EmploymentRecord | null {
    const all = readAll();

    const idx = findRecordIndex(all, careerPostId);

    if (idx === -1) return null;

    const rec = all[idx];

    if (rec.status !== "notice" && rec.status !== "resigned") return null;

    const GRACE_MS = FORCE_COMPLETE_GRACE_DAYS * 86_400_000;

    let eligibleAfter: number | null = null;

    if (rec.lastWorkingDay) {
      eligibleAfter = rec.lastWorkingDay + GRACE_MS;
    } else if (rec.resignedAt) {
      eligibleAfter = rec.resignedAt + GRACE_MS;
    }

    if (!eligibleAfter || Date.now() < eligibleAfter) return null;

    const now = Date.now();

    rec.status = "completed";

    rec.completedAt = now;

    rec.forceCompleted = true;

    if (rec.joinedAt) {
      const dur = calcDuration(rec.joinedAt, now);

      rec.workDurationDays = dur.days;

      rec.workDurationDisplay = dur.display;
    }

    addTimeline(rec, "completed", "employee", "Force completed — employer did not respond", now);

    const write = writeAllChecked(all);

    if (!write.ok) return null;

    notifyEmployerForceCompleted(rec.employeeName, rec.jobTitle);

    maybeNotifyPleaseRate(rec);

    recordCareerClosureInVault(rec, "force_completed");

    return rec;
  },
} as const;
