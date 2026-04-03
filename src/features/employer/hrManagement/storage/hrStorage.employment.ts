// src/features/employer/hrManagement/storage/hrStorage.employment.ts
//
// Employment transitions: probation, confirmation, promotion, transfer, contracts.

import type { HRCandidateRecord } from "../types/hrManagement.types";
import {
  readAll,
  writeAll,
  genId,
  pushStatusChange,
  hrGetById,
  hrUpdate,
  hrFindByApplication,
} from "./hrStorage.core";

/* ------------------------------------------------ */
/* Probation Management                             */
/* ------------------------------------------------ */
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
    statusHistory: pushStatusChange(rec, "probation", "probation (updated)", "employer", `Probation period changed to ${newDurationDays} days`),
  });
}

export function hrConfirmEmployee(id: string, note?: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active" || rec.employmentPhase !== "probation") return false;

  return hrUpdate(id, {
    employmentPhase: "confirmed",
    confirmedAt: Date.now(),
    statusHistory: pushStatusChange(rec, "active (probation)", "active (confirmed)", "employer", note || "Employee confirmed after probation"),
  });
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
    statusHistory: pushStatusChange(rec, "active (confirmed)", "active (probation)", "employer", note),
  });
}

/* ------------------------------------------------ */
/* Direct HR Record (manually added staff)          */
/* ------------------------------------------------ */
export function hrCreateDirectRecord(data: {
  careerPostId: string;
  applicationId: string;
  employeeUniqueId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  location: string;
}): string {
  const existing = hrFindByApplication(data.careerPostId, data.applicationId);
  if (existing) return existing.id;

  const now = Date.now();
  const record: HRCandidateRecord = {
    id: genId(),
    careerPostId: data.careerPostId,
    applicationId: data.applicationId,
    employeeUniqueId: data.employeeUniqueId,
    employeeName: data.employeeName,
    jobTitle: data.jobTitle,
    department: data.department,
    location: data.location,
    status: "active",
    employmentPhase: "confirmed",
    confirmedAt: now,
    statusHistory: [{
      id: genId(),
      from: "manually_added",
      to: "active (confirmed)",
      changedAt: now,
      changedBy: "employer",
      note: "Staff added manually – direct active status",
    }],
    movedToHRAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const all = readAll();
  writeAll([record, ...all]);
  return record.id;
}

/* ------------------------------------------------ */
/* Promotion & Transfer                             */
/* ------------------------------------------------ */
export function hrApplyPromotion(id: string, data: { newTitle: string; newDepartment?: string }): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active") return false;

  const patch: Partial<HRCandidateRecord> = {
    jobTitle: data.newTitle,
    statusHistory: pushStatusChange(
      rec,
      `title: ${rec.jobTitle}`,
      `title: ${data.newTitle}`,
      "employer",
      `Promoted to ${data.newTitle}`,
    ),
  };

  if (data.newDepartment) {
    patch.department = data.newDepartment;
  }

  return hrUpdate(id, patch);
}

export function hrApplyTransfer(id: string, data: { newLocation?: string; newDepartment?: string }): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active") return false;

  const changes: string[] = [];
  const patch: Partial<HRCandidateRecord> = {};

  if (data.newLocation) {
    patch.location = data.newLocation;
    changes.push(`location → ${data.newLocation}`);
  }
  if (data.newDepartment) {
    patch.department = data.newDepartment;
    changes.push(`department → ${data.newDepartment}`);
  }

  if (changes.length === 0) return false;

  patch.statusHistory = pushStatusChange(
    rec,
    `location: ${rec.location || "–"}`,
    changes.join(", "),
    "employer",
    `Transferred: ${changes.join(", ")}`,
  );

  return hrUpdate(id, patch);
}

/* ------------------------------------------------ */
/* Contract Management                              */
/* ------------------------------------------------ */
export function hrSetContractDetails(id: string, contractType: "permanent" | "fixed_term", contractEndDate?: number): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active") return false;

  const patch: Partial<HRCandidateRecord> = { contractType };

  if (contractType === "fixed_term" && contractEndDate) {
    patch.contractEndDate = contractEndDate;
  } else if (contractType === "permanent") {
    patch.contractEndDate = undefined;
  }

  patch.statusHistory = pushStatusChange(
    rec,
    `contract: ${rec.contractType || "not set"}`,
    `contract: ${contractType}${contractType === "fixed_term" && contractEndDate ? ` (ends ${new Date(contractEndDate).toLocaleDateString("en-GB")})` : ""}`,
    "employer",
    `Contract type set to ${contractType}`,
  );

  return hrUpdate(id, patch);
}

export function hrRenewContract(id: string, newEndDate: number, note: string): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active" || rec.contractType !== "fixed_term" || !rec.contractEndDate) return false;

  const renewalEntry = {
    id: genId(),
    previousEndDate: rec.contractEndDate,
    newEndDate,
    renewedAt: Date.now(),
    note: note.trim(),
  };

  return hrUpdate(id, {
    contractEndDate: newEndDate,
    contractRenewals: [...(rec.contractRenewals ?? []), renewalEntry],
    statusHistory: pushStatusChange(
      rec,
      `contract end: ${new Date(rec.contractEndDate).toLocaleDateString("en-GB")}`,
      `contract end: ${new Date(newEndDate).toLocaleDateString("en-GB")}`,
      "employer",
      `Contract renewed: ${note.trim()}`,
    ),
  });
}

export function hrGetContractReminders(withinDays: number = 30): HRCandidateRecord[] {
  const now = Date.now();
  const threshold = now + withinDays * 86400000;
  return readAll().filter(
    (r) =>
      r.status === "active" &&
      r.contractType === "fixed_term" &&
      r.contractEndDate &&
      r.contractEndDate <= threshold &&
      r.contractEndDate > now,
  );
}

export function hrGetContractOverdue(): HRCandidateRecord[] {
  const now = Date.now();
  return readAll().filter(
    (r) =>
      r.status === "active" &&
      r.contractType === "fixed_term" &&
      r.contractEndDate &&
      r.contractEndDate <= now,
  );
}