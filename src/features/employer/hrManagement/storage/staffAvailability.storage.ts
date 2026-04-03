// src/features/employer/hrManagement/storage/staffAvailability.storage.ts
//
// CRUD service for Staff Availability Request (Root Map Section 7.4.13).
// Two modes: Simple (all at once) + Batch (priority-based).
// Employer creates → employees respond → auto-fill / advance batches.

import type {
  StaffAvailabilityRequest,
  StaffAvailabilityFormData,
  AvailabilityEmployeeResponse,
  AvailabilityBatch,
} from "../types/staffAvailability.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_staff_availability_v1";
const CHANGED_EVENT = "wm:staff-availability-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): StaffAvailabilityRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StaffAvailabilityRequest[]) : [];
  } catch {
    return [];
  }
}

function write(entries: StaffAvailabilityRequest[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "sar_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function makeResponse(emp: { hrCandidateId: string; employeeName: string }): AvailabilityEmployeeResponse {
  return {
    hrCandidateId: emp.hrCandidateId,
    employeeName: emp.employeeName,
    status: "pending",
    note: "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-status check: determine if request should be filled / unfilled
// ─────────────────────────────────────────────────────────────────────────────

function resolveStatus(req: StaffAvailabilityRequest): StaffAvailabilityRequest {
  if (req.status === "cancelled") return req;

  const accepted = countAccepted(req);

  // Filled: enough employees accepted
  if (accepted >= req.requiredCount) {
    return { ...req, acceptedCount: accepted, status: "filled", updatedAt: Date.now() };
  }

  if (req.mode === "simple") {
    // Check if all have responded (no pending left)
    const allResponded = req.employees.every((e) => e.status !== "pending");
    if (allResponded && accepted < req.requiredCount) {
      return { ...req, acceptedCount: accepted, status: "unfilled", updatedAt: Date.now() };
    }
  }

  if (req.mode === "batch") {
    // Check if current batch is exhausted
    const activeBatch = req.batches.find((b) => b.isActive);
    if (activeBatch) {
      const batchAllResponded = activeBatch.employees.every((e) => e.status !== "pending");
      if (batchAllResponded && accepted < req.requiredCount) {
        // Try advance to next batch
        return advanceBatch(req);
      }
    }
  }

  return { ...req, acceptedCount: accepted };
}

function countAccepted(req: StaffAvailabilityRequest): number {
  if (req.mode === "simple") {
    return req.employees.filter((e) => e.status === "accepted").length;
  }
  return req.batches.reduce(
    (sum, b) => sum + b.employees.filter((e) => e.status === "accepted").length,
    0,
  );
}

function advanceBatch(req: StaffAvailabilityRequest): StaffAvailabilityRequest {
  const now = Date.now();
  const currentIdx = req.batches.findIndex((b) => b.isActive);
  if (currentIdx === -1) return { ...req, status: "unfilled", updatedAt: now };

  // Deactivate current batch
  const updated = [...req.batches];
  updated[currentIdx] = { ...updated[currentIdx], isActive: false };

  // Find next batch
  const nextIdx = currentIdx + 1;
  if (nextIdx >= updated.length) {
    // No more batches — unfilled
    return { ...req, batches: updated, status: "unfilled", updatedAt: now };
  }

  // Activate next batch
  updated[nextIdx] = { ...updated[nextIdx], isActive: true, activatedAt: now };

  return {
    ...req,
    batches: updated,
    activeBatchNumber: updated[nextIdx].batchNumber,
    updatedAt: now,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const staffAvailabilityStorage = {

  // ── Read ──

  /** Get all requests (newest first) */
  getAll(): StaffAvailabilityRequest[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get open requests only */
  getOpen(): StaffAvailabilityRequest[] {
    return read()
      .filter((r) => r.status === "open")
      .sort((a, b) => a.dateNeeded - b.dateNeeded);
  },

  /** Get a single request by ID */
  getById(id: string): StaffAvailabilityRequest | null {
    return read().find((r) => r.id === id) ?? null;
  },

  /** Get pending requests for a specific employee (across all open requests) */
  getPendingForEmployee(hrCandidateId: string): StaffAvailabilityRequest[] {
    return read().filter((r) => {
      if (r.status !== "open") return false;
      if (r.mode === "simple") {
        return r.employees.some(
          (e) => e.hrCandidateId === hrCandidateId && e.status === "pending",
        );
      }
      // Batch mode — only active batch
      const activeBatch = r.batches.find((b) => b.isActive);
      if (!activeBatch) return false;
      return activeBatch.employees.some(
        (e) => e.hrCandidateId === hrCandidateId && e.status === "pending",
      );
    });
  },

  /** Get all requests involving a specific employee (for history) */
  getForEmployee(hrCandidateId: string): StaffAvailabilityRequest[] {
    return read()
      .filter((r) => {
        if (r.mode === "simple") {
          return r.employees.some((e) => e.hrCandidateId === hrCandidateId);
        }
        return r.batches.some((b) =>
          b.employees.some((e) => e.hrCandidateId === hrCandidateId),
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Count open requests */
  countOpen(): number {
    return read().filter((r) => r.status === "open").length;
  },

  // ── Create ──

  /** Create a new availability request */
  createRequest(form: StaffAvailabilityFormData): string {
    const now = Date.now();
    const id = genId();

    const employees: AvailabilityEmployeeResponse[] =
      form.mode === "simple"
        ? form.selectedEmployees.map(makeResponse)
        : [];

    const batches: AvailabilityBatch[] =
      form.mode === "batch"
        ? form.batches.map((b, idx) => ({
            batchNumber: b.batchNumber,
            employees: b.employees.map(makeResponse),
            isActive: idx === 0,
            activatedAt: idx === 0 ? now : undefined,
          }))
        : [];

    const request: StaffAvailabilityRequest = {
      id,
      title: form.title.trim(),
      description: form.description.trim(),
      dateNeeded: new Date(form.dateNeeded).getTime(),
      timeNeeded: form.timeNeeded.trim(),
      location: form.location.trim(),
      mode: form.mode,
      requiredCount: form.requiredCount,
      acceptedCount: 0,
      status: "open",
      employees,
      batches,
      activeBatchNumber: form.mode === "batch" ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    };

    const all = read();
    write([request, ...all]);
    return id;
  },

  // ── Employee Response ──

  /** Employee responds to a request (accept or decline) */
  respond(
    requestId: string,
    hrCandidateId: string,
    response: "accepted" | "declined",
    note: string = "",
  ): boolean {
    const all = read();
    const idx = all.findIndex((r) => r.id === requestId);
    if (idx === -1) return false;

    let req = { ...all[idx] };
    if (req.status !== "open") return false;

    const now = Date.now();

    const updateEmployee = (emp: AvailabilityEmployeeResponse): AvailabilityEmployeeResponse => {
      if (emp.hrCandidateId !== hrCandidateId) return emp;
      if (emp.status !== "pending") return emp;
      return { ...emp, status: response, note: note.trim(), respondedAt: now };
    };

    if (req.mode === "simple") {
      // Check if already filled (for simple mode, first N to accept)
      if (response === "accepted") {
        const currentAccepted = req.employees.filter((e) => e.status === "accepted").length;
        if (currentAccepted >= req.requiredCount) return false;
      }
      req.employees = req.employees.map(updateEmployee);
    } else {
      // Batch mode — only update in active batch
      req.batches = req.batches.map((b) => {
        if (!b.isActive) return b;
        return { ...b, employees: b.employees.map(updateEmployee) };
      });
    }

    req.updatedAt = now;

    // Resolve status (filled / unfilled / advance batch)
    req = resolveStatus(req);

    all[idx] = req;
    write(all);
    return true;
  },

  // ── Employer Actions ──

  /** Cancel a request */
  cancelRequest(id: string): boolean {
    const all = read();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    all[idx] = {
      ...all[idx],
      status: "cancelled",
      updatedAt: Date.now(),
    };

    write(all);
    return true;
  },

  /** Delete a request permanently */
  deleteRequest(id: string): boolean {
    const all = read();
    const filtered = all.filter((r) => r.id !== id);
    if (filtered.length === all.length) return false;
    write(filtered);
    return true;
  },

  /** Manually advance to next batch (employer override) */
  forceAdvanceBatch(id: string): boolean {
    const all = read();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const req = all[idx];
    if (req.mode !== "batch" || req.status !== "open") return false;

    all[idx] = advanceBatch({ ...req, updatedAt: Date.now() });
    write(all);
    return true;
  },

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
};