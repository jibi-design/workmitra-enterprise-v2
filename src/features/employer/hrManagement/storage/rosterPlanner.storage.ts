// src/features/employer/hrManagement/storage/rosterPlanner.storage.ts
//
// CRUD service for Team Calendar / Roster Planner (Root Map Section 7.4.15).
// Assign staff to sites/shifts per day. Conflict detection built-in.

import type {
  RosterAssignment,
  RosterAssignmentFormData,
} from "../types/rosterPlanner.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_roster_planner_v1";
const CHANGED_EVENT = "wm:roster-planner-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): RosterAssignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RosterAssignment[]) : [];
  } catch {
    return [];
  }
}

function write(entries: RosterAssignment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "rst_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const rosterPlannerStorage = {

  // ── Read ──

  /** Get all assignments */
  getAll(): RosterAssignment[] {
    return read().sort((a, b) => a.date.localeCompare(b.date));
  },

  /** Get assignments for a date range (inclusive) */
  getForDateRange(startDate: string, endDate: string): RosterAssignment[] {
    return read()
      .filter((a) => a.date >= startDate && a.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date) || a.shiftStart.localeCompare(b.shiftStart));
  },

  /** Get assignments for a specific date */
  getForDate(date: string): RosterAssignment[] {
    return read()
      .filter((a) => a.date === date)
      .sort((a, b) => a.shiftStart.localeCompare(b.shiftStart));
  },

  /** Get assignments for a specific employee */
  getForEmployee(hrCandidateId: string): RosterAssignment[] {
    return read()
      .filter((a) => a.hrCandidateId === hrCandidateId)
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  /** Get upcoming assignments for an employee (from today onwards) */
  getUpcomingForEmployee(hrCandidateId: string): RosterAssignment[] {
    const today = new Date();
    const todayStr =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    return read()
      .filter((a) => a.hrCandidateId === hrCandidateId && a.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.shiftStart.localeCompare(b.shiftStart));
  },

  /** Get a single assignment by ID */
  getById(id: string): RosterAssignment | null {
    return read().find((a) => a.id === id) ?? null;
  },

  /** Get unique sites from all assignments */
  getUniqueSites(): string[] {
    const sites = new Set<string>();
    for (const a of read()) {
      if (a.site.trim()) sites.add(a.site.trim());
    }
    return [...sites].sort();
  },

  /** Check if employee has assignment on a specific date (for conflict warning) */
  hasAssignmentOnDate(hrCandidateId: string, date: string, excludeId?: string): boolean {
    return read().some(
      (a) => a.hrCandidateId === hrCandidateId && a.date === date && a.id !== excludeId,
    );
  },

  // ── Create ──

  /** Create a new roster assignment */
  createAssignment(form: RosterAssignmentFormData): string {
    const now = Date.now();
    const assignment: RosterAssignment = {
      id: genId(),
      hrCandidateId: form.hrCandidateId,
      employeeName: form.employeeName,
      date: form.date,
      site: form.site.trim(),
      shiftStart: form.shiftStart,
      shiftEnd: form.shiftEnd,
      note: form.note.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const all = read();
    write([...all, assignment]);
    return assignment.id;
  },

   /** Bulk assign multiple employees to same site/date/shift */
  createBulkAssignments(data: {
    date: string;
    site: string;
    shiftStart: string;
    shiftEnd: string;
    note: string;
    employees: { hrCandidateId: string; employeeName: string }[];
  }): string[] {
    const now = Date.now();
    const all = read();
    const ids: string[] = [];

    for (const emp of data.employees) {
      const assignment: RosterAssignment = {
        id: genId(),
        hrCandidateId: emp.hrCandidateId,
        employeeName: emp.employeeName,
        date: data.date,
        site: data.site.trim(),
        shiftStart: data.shiftStart,
        shiftEnd: data.shiftEnd,
        note: data.note.trim(),
        createdAt: now,
        updatedAt: now,
      };
      all.push(assignment);
      ids.push(assignment.id);
    }

    write(all);
    return ids;
  },

  // ── Update ──

  /** Update an existing assignment */
  updateAssignment(id: string, form: Partial<RosterAssignmentFormData>): boolean {
    const all = read();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    all[idx] = {
      ...all[idx],
      ...(form.site !== undefined && { site: form.site.trim() }),
      ...(form.shiftStart !== undefined && { shiftStart: form.shiftStart }),
      ...(form.shiftEnd !== undefined && { shiftEnd: form.shiftEnd }),
      ...(form.note !== undefined && { note: form.note.trim() }),
      ...(form.date !== undefined && { date: form.date }),
      updatedAt: Date.now(),
    };

    write(all);
    return true;
  },

  // ── Delete ──

  /** Delete an assignment */
  deleteAssignment(id: string): boolean {
    const all = read();
    const filtered = all.filter((a) => a.id !== id);
    if (filtered.length === all.length) return false;
    write(filtered);
    return true;
  },

  /** Delete all assignments for a specific date (bulk clear) */
  clearDate(date: string): number {
    const all = read();
    const filtered = all.filter((a) => a.date !== date);
    const removed = all.length - filtered.length;
    if (removed > 0) write(filtered);
    return removed;
  },

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
};