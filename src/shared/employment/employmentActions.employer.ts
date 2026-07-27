import type { EmploymentRecord, EmployerTerminateReason } from "./employmentTypes";
import {
  readAll,
  writeAllChecked,
  addTimeline,
  calcDuration,
  isValidTransition,
  findRecordIndex,
  appendExitLog,
} from "./employmentStorageHelpers";
import {
  notifyEmployeeJoined,
  notifyEmployeeResignConfirmed,
  notifyEmployeeTerminated,
} from "./employmentNotifications";
import { recordCareerClosureInVault } from "../../features/employee/workVault/services/careerVaultHistory.service";
import {
  isValidEmployerTerminateReason,
  maybeNotifyPleaseRate,
  normalizeExitNotes,
  requireDbEmploymentWhenAuthOn,
  syncEmploymentToDb,
} from "./employmentActions.helpers";

export const employmentEmployerActions = {
  async markAsJoined(careerPostId: string, joinedAt: number): Promise<EmploymentRecord | null> {
    const all = readAll();
    const prior = all.map((r) => ({ ...r, timeline: [...r.timeline] }));
    const idx = findRecordIndex(all, careerPostId);
    const now = Date.now();

    if (idx === -1 || !isValidTransition(all[idx].status, "working")) return null;
    if (!requireDbEmploymentWhenAuthOn(all[idx])) return null;
    if (!Number.isFinite(joinedAt) || joinedAt <= 0 || joinedAt > now) return null;

    all[idx].status = "working";
    all[idx].joinedAt = joinedAt;
    addTimeline(all[idx], "working", "employer", "Marked as joined", joinedAt);

    const write = writeAllChecked(all);
    if (!write.ok) return null;
    if (!(await syncEmploymentToDb(all[idx], "employer", prior))) return null;

    notifyEmployeeJoined(all[idx].jobTitle, all[idx].companyName);
    return all[idx];
  },

  async confirmResignation(careerPostId: string): Promise<EmploymentRecord | null> {
    const all = readAll();
    const prior = all.map((r) => ({ ...r, timeline: [...r.timeline] }));
    const idx = findRecordIndex(all, careerPostId);

    if (idx === -1 || !isValidTransition(all[idx].status, "completed")) return null;
    if (!requireDbEmploymentWhenAuthOn(all[idx])) return null;

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
    if (!(await syncEmploymentToDb(rec, "employer", prior))) return null;

    notifyEmployeeResignConfirmed(rec.jobTitle, rec.companyName);
    maybeNotifyPleaseRate(rec);
    recordCareerClosureInVault(rec, "resigned");
    return rec;
  },

  async terminate(
    careerPostId: string,
    reason: EmployerTerminateReason,
    notes: string,
  ): Promise<EmploymentRecord | null> {
    const all = readAll();
    const prior = all.map((r) => ({ ...r, timeline: [...r.timeline] }));
    const idx = findRecordIndex(all, careerPostId);
    const safeNotes = normalizeExitNotes(notes);

    if (safeNotes === null) return null;
    if (!isValidEmployerTerminateReason(reason)) return null;
    if (idx === -1 || !isValidTransition(all[idx].status, "completed")) return null;
    if (!requireDbEmploymentWhenAuthOn(all[idx])) return null;

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
    if (!(await syncEmploymentToDb(rec, "employer", prior))) return null;

    notifyEmployeeTerminated(rec.jobTitle, rec.companyName);
    maybeNotifyPleaseRate(rec);
    recordCareerClosureInVault(rec, "terminated");
    return rec;
  },
} as const;
