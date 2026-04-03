// src/shared/employment/employmentActions.ts
// Session 17: Employment status transition actions + notification triggers.

import type {
  EmploymentRecord,
  EmploymentStatus,
  EmployeeResignReason,
  EmployerTerminateReason,
} from "./employmentTypes";
import {
  readAll,
  writeAll,
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
} from "./employmentNotifications";

/* ── Action Methods ── */
export const employmentActions = {

  /* ── Employer: Mark as Joined ── */
  markAsJoined(careerPostId: string, joinedAt: number): EmploymentRecord | null {
    const all = readAll();
    const idx = findRecordIndex(all, careerPostId);
    if (idx === -1 || !isValidTransition(all[idx].status, "working")) return null;

    all[idx].status = "working";
    all[idx].joinedAt = joinedAt;
    addTimeline(all[idx], "working", "employer", "Marked as joined");
    writeAll(all);

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
    const rec = all[idx];

    const target: EmploymentStatus = rec.noticePeriodDays > 0 ? "notice" : "resigned";
    if (!isValidTransition(rec.status, target)) return null;

    const now = Date.now();
    rec.status = target;
    rec.resignedAt = now;
    rec.exitType = "resigned";
    rec.exitReason = reason;
    rec.exitNotes = notes;
    rec.lastWorkingDay = calcLastWorkingDay(now, rec.noticePeriodDays);

    const label = target === "notice"
      ? `Resigned with ${rec.noticePeriodDays}-day notice — ${reason}`
      : `Resigned — ${reason}`;
    addTimeline(rec, target, "employee", label);
    appendExitLog({ employmentId: rec.id, exitType: "resigned", reason, notes, timestamp: now });

    writeAll(all);

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
    addTimeline(rec, "withdrawn", "employee", "Resignation withdrawn");

    writeAll(all);

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
    addTimeline(rec, "completed", "employer", "Resignation confirmed");

    writeAll(all);

    notifyEmployeeResignConfirmed(rec.jobTitle, rec.companyName);
    notifyBothPleaseRate(rec.employeeName, rec.companyName, rec.jobTitle);
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
    if (idx === -1 || !isValidTransition(all[idx].status, "completed")) return null;

    const now = Date.now();
    const rec = all[idx];
    rec.status = "completed";
    rec.completedAt = now;
    rec.exitType = "terminated";
    rec.exitReason = reason;
    rec.exitNotes = notes;

    if (rec.joinedAt) {
      const dur = calcDuration(rec.joinedAt, now);
      rec.workDurationDays = dur.days;
      rec.workDurationDisplay = dur.display;
    }
    addTimeline(rec, "completed", "employer", `Terminated — ${reason}`);
    appendExitLog({ employmentId: rec.id, exitType: "terminated", reason, notes, timestamp: now });

    writeAll(all);

    notifyEmployeeTerminated(rec.jobTitle, rec.companyName);
    notifyBothPleaseRate(rec.employeeName, rec.companyName, rec.jobTitle);
    return rec;
  },
} as const;