import type {
  StaffAvailabilityRequest,
  AvailabilityEmployeeResponse,
} from "../types/staffAvailability.types";
import { hrEmployerScopedKey } from "./hrStorageKeys";

export const CHANGED_EVENT = "wm:staff-availability-changed";

export function storageKey(): string {
  return hrEmployerScopedKey("staff_availability_v1");
}

export function readRequests(): StaffAvailabilityRequest[] {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StaffAvailabilityRequest[]) : [];
  } catch {
    return [];
  }
}

export function writeRequests(entries: StaffAvailabilityRequest[]): void {
  localStorage.setItem(storageKey(), JSON.stringify(entries));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function genId(): string {
  return "sar_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function makeResponse(emp: {
  hrCandidateId: string;
  employeeName: string;
}): AvailabilityEmployeeResponse {
  return {
    hrCandidateId: emp.hrCandidateId,
    employeeName: emp.employeeName,
    status: "pending",
    note: "",
  };
}

export function resolveStatus(req: StaffAvailabilityRequest): StaffAvailabilityRequest {
  if (req.status === "cancelled") return req;

  const accepted = countAccepted(req);

  if (accepted >= req.requiredCount) {
    return { ...req, acceptedCount: accepted, status: "filled", updatedAt: Date.now() };
  }

  if (req.mode === "simple") {
    const allResponded = req.employees.every((e) => e.status !== "pending");
    if (allResponded && accepted < req.requiredCount) {
      return { ...req, acceptedCount: accepted, status: "unfilled", updatedAt: Date.now() };
    }
  }

  if (req.mode === "batch") {
    const activeBatch = req.batches.find((b) => b.isActive);
    if (activeBatch) {
      const batchAllResponded = activeBatch.employees.every((e) => e.status !== "pending");
      if (batchAllResponded && accepted < req.requiredCount) {
        return advanceBatch(req);
      }
    }
  }

  return { ...req, acceptedCount: accepted };
}

export function countAccepted(req: StaffAvailabilityRequest): number {
  if (req.mode === "simple") {
    return req.employees.filter((e) => e.status === "accepted").length;
  }
  return req.batches.reduce(
    (sum, b) => sum + b.employees.filter((e) => e.status === "accepted").length,
    0,
  );
}

export function advanceBatch(req: StaffAvailabilityRequest): StaffAvailabilityRequest {
  const now = Date.now();
  const currentIdx = req.batches.findIndex((b) => b.isActive);
  if (currentIdx === -1) return { ...req, status: "unfilled", updatedAt: now };

  const updated = [...req.batches];
  updated[currentIdx] = { ...updated[currentIdx], isActive: false };

  const nextIdx = currentIdx + 1;
  if (nextIdx >= updated.length) {
    return { ...req, batches: updated, status: "unfilled", updatedAt: now };
  }

  updated[nextIdx] = { ...updated[nextIdx], isActive: true, activatedAt: now };

  return {
    ...req,
    batches: updated,
    activeBatchNumber: updated[nextIdx].batchNumber,
    updatedAt: now,
  };
}
