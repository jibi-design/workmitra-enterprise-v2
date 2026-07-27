// src/features/employer/hrManagement/storage/staffAvailability.storage.ts — facade

import type {
  AvailabilityEmployeeResponse,
  StaffAvailabilityRequest,
  StaffAvailabilityFormData,
} from "../types/staffAvailability.types";
import {
  advanceBatch,
  CHANGED_EVENT,
  genId,
  makeResponse,
  readRequests,
  resolveStatus,
  writeRequests,
} from "./staffAvailability.storage.internal";

export const staffAvailabilityStorage = {
  getAll(): StaffAvailabilityRequest[] {
    return readRequests().sort((a, b) => b.createdAt - a.createdAt);
  },

  getOpen(): StaffAvailabilityRequest[] {
    return readRequests()
      .filter((r) => r.status === "open")
      .sort((a, b) => a.dateNeeded - b.dateNeeded);
  },

  getById(id: string): StaffAvailabilityRequest | null {
    return readRequests().find((r) => r.id === id) ?? null;
  },

  getPendingForEmployee(hrCandidateId: string): StaffAvailabilityRequest[] {
    return readRequests().filter((r) => {
      if (r.status !== "open") return false;
      if (r.mode === "simple") {
        return r.employees.some((e) => e.hrCandidateId === hrCandidateId && e.status === "pending");
      }
      const activeBatch = r.batches.find((b) => b.isActive);
      if (!activeBatch) return false;
      return activeBatch.employees.some(
        (e) => e.hrCandidateId === hrCandidateId && e.status === "pending",
      );
    });
  },

  getForEmployee(hrCandidateId: string): StaffAvailabilityRequest[] {
    return readRequests()
      .filter((r) => {
        if (r.mode === "simple") {
          return r.employees.some((e) => e.hrCandidateId === hrCandidateId);
        }
        return r.batches.some((b) => b.employees.some((e) => e.hrCandidateId === hrCandidateId));
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  countOpen(): number {
    return readRequests().filter((r) => r.status === "open").length;
  },

  createRequest(form: StaffAvailabilityFormData): string {
    const now = Date.now();
    const id = genId();

    const employees = form.mode === "simple" ? form.selectedEmployees.map(makeResponse) : [];

    const batches =
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

    const all = readRequests();
    writeRequests([request, ...all]);
    return id;
  },

  respond(
    requestId: string,
    hrCandidateId: string,
    response: "accepted" | "declined",
    note: string = "",
  ): boolean {
    const all = readRequests();
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
      if (response === "accepted") {
        const currentAccepted = req.employees.filter((e) => e.status === "accepted").length;
        if (currentAccepted >= req.requiredCount) return false;
      }
      req.employees = req.employees.map(updateEmployee);
    } else {
      req.batches = req.batches.map((b) => {
        if (!b.isActive) return b;
        return { ...b, employees: b.employees.map(updateEmployee) };
      });
    }

    req.updatedAt = now;
    req = resolveStatus(req);

    all[idx] = req;
    writeRequests(all);
    return true;
  },

  cancelRequest(id: string): boolean {
    const all = readRequests();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    all[idx] = {
      ...all[idx],
      status: "cancelled",
      updatedAt: Date.now(),
    };

    writeRequests(all);
    return true;
  },

  deleteRequest(id: string): boolean {
    const all = readRequests();
    const filtered = all.filter((r) => r.id !== id);
    if (filtered.length === all.length) return false;
    writeRequests(filtered);
    return true;
  },

  forceAdvanceBatch(id: string): boolean {
    const all = readRequests();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const req = all[idx];
    if (req.mode !== "batch" || req.status !== "open") return false;

    all[idx] = advanceBatch({ ...req, updatedAt: Date.now() });
    writeRequests(all);
    return true;
  },

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
};
