import type { EmploymentRecord, EmployeeResignReason } from "./employmentTypes";
import { FORCE_COMPLETE_GRACE_DAYS } from "./employmentTypes";
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
  notifyEmployerResignation,
  notifyEmployerWithdrawal,
  notifyEmployerForceCompleted,
} from "./employmentNotifications";
import { recordCareerClosureInVault } from "../../features/employee/workVault/services/careerVaultHistory.service";
import {
  isValidEmployeeResignReason,
  maybeNotifyPleaseRate,
  normalizeExitNotes,
  requireDbEmploymentWhenAuthOn,
  syncEmploymentToDb,
} from "./employmentActions.helpers";

export const employmentEmployeeActions = {
  async resign(
    careerPostId: string,
    reason: EmployeeResignReason,
    notes: string,
  ): Promise<EmploymentRecord | null> {
    const all = readAll();
    const prior = all.map((r) => ({ ...r, timeline: [...r.timeline] }));
    const idx = findRecordIndex(all, careerPostId);

    if (idx === -1) return null;
    if (!requireDbEmploymentWhenAuthOn(all[idx])) return null;

    const safeNotes = normalizeExitNotes(notes);
    if (safeNotes === null) return null;
    if (!isValidEmployeeResignReason(reason)) return null;

    const rec = all[idx];
    const target = rec.noticePeriodDays > 0 ? "notice" : "resigned";
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
    if (!(await syncEmploymentToDb(rec, "employee", prior))) return null;

    notifyEmployerResignation(rec.employeeName, rec.jobTitle);
    return rec;
  },

  async withdrawResignation(careerPostId: string): Promise<EmploymentRecord | null> {
    const all = readAll();
    const prior = all.map((r) => ({ ...r, timeline: [...r.timeline] }));
    const idx = findRecordIndex(all, careerPostId);

    if (idx === -1) return null;
    if (!requireDbEmploymentWhenAuthOn(all[idx])) return null;

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
    if (!(await syncEmploymentToDb(rec, "employee", prior))) return null;

    notifyEmployerWithdrawal(rec.employeeName, rec.jobTitle);
    return rec;
  },

  async forceComplete(careerPostId: string): Promise<EmploymentRecord | null> {
    const all = readAll();
    const prior = all.map((r) => ({ ...r, timeline: [...r.timeline] }));
    const idx = findRecordIndex(all, careerPostId);

    if (idx === -1) return null;
    if (!requireDbEmploymentWhenAuthOn(all[idx])) return null;

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
    if (!(await syncEmploymentToDb(rec, "employee", prior))) return null;

    notifyEmployerForceCompleted(rec.employeeName, rec.jobTitle);
    maybeNotifyPleaseRate(rec);
    recordCareerClosureInVault(rec, "force_completed");
    return rec;
  },
} as const;
