import type { HRCandidateRecord } from "../types/hrManagement.types";
import { readAll, pushStatusChange, hrGetById, hrUpdate } from "./hrStorage.core";
import { notifyEmployeeProbationConfirmed } from "./hrEmploymentNotifications";

export function hrGetProbationReminders(withinDays: number = 14): HRCandidateRecord[] {
  const now = Date.now();
  const threshold = now + withinDays * 86400000;
  return readAll().filter(
    (r) =>
      r.status === "active" &&
      r.employmentPhase === "probation" &&
      r.probationEndDate &&
      r.probationEndDate <= threshold &&
      r.probationEndDate > now,
  );
}

export function hrGetProbationOverdue(): HRCandidateRecord[] {
  const now = Date.now();
  return readAll().filter(
    (r) =>
      r.status === "active" &&
      r.employmentPhase === "probation" &&
      r.probationEndDate &&
      r.probationEndDate <= now,
  );
}

export function hrUpdateProbationPeriod(id: string, newDurationDays: number): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active" || rec.employmentPhase !== "probation") return false;

  const joiningDate = rec.offerLetter?.joiningDate ?? rec.movedToHRAt;
  const newEndDate = joiningDate + newDurationDays * 86400000;

  return hrUpdate(id, {
    probationDurationDays: newDurationDays,
    probationEndDate: newEndDate,
    statusHistory: pushStatusChange(
      rec,
      "probation",
      "probation (updated)",
      "employer",
      `Probation period changed to ${newDurationDays} days`,
    ),
  });
}

export function hrConfirmEmployee(id: string, note?: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active" || rec.employmentPhase !== "probation") return false;

  const updated = hrUpdate(id, {
    employmentPhase: "confirmed",
    confirmedAt: Date.now(),
    statusHistory: pushStatusChange(
      rec,
      "active (probation)",
      "active (confirmed)",
      "employer",
      note || "Employee confirmed after probation",
    ),
  });

  if (updated) {
    notifyEmployeeProbationConfirmed(rec.jobTitle, rec.location, note);
  }

  return updated;
}

export function hrRevertToProbation(id: string, durationDays: number, note: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active" || rec.employmentPhase !== "confirmed") return false;

  const joiningDate = rec.offerLetter?.joiningDate ?? rec.movedToHRAt;
  const newEndDate = joiningDate + durationDays * 86400000;

  return hrUpdate(id, {
    employmentPhase: "probation",
    confirmedAt: undefined,
    probationDurationDays: durationDays,
    probationEndDate: newEndDate,
    statusHistory: pushStatusChange(
      rec,
      "active (confirmed)",
      "active (probation)",
      "employer",
      note,
    ),
  });
}
