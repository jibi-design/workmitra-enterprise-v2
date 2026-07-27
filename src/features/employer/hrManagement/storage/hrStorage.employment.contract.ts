import type { HRCandidateRecord } from "../types/hrManagement.types";
import { readAll, genId, pushStatusChange, hrGetById, hrUpdate } from "./hrStorage.core";
import { notifyEmployeeContractRenewed } from "./hrEmploymentNotifications";

export function hrSetContractDetails(
  id: string,
  contractType: "permanent" | "fixed_term",
  contractEndDate?: number,
): boolean {
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
  if (!rec || rec.status !== "active" || rec.contractType !== "fixed_term" || !rec.contractEndDate)
    return false;

  const renewalEntry = {
    id: genId(),
    previousEndDate: rec.contractEndDate,
    newEndDate,
    renewedAt: Date.now(),
    note: note.trim(),
  };

  const updated = hrUpdate(id, {
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

  if (updated) {
    notifyEmployeeContractRenewed(rec.location, newEndDate);
  }

  return updated;
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
