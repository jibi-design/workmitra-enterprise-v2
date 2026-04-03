// src/features/employer/hrManagement/storage/attendanceLog.storage.ts
//
// CRUD service for Employer Attendance Log (Root Map Section 5.3.A).
// Employer-controlled attendance tracking — replaces Excel-based systems.
// NOT connected to employee's personal Work Diary — completely separate system.
// Employer controls everything — employee cannot see or edit.

import type {
  AttendanceDayEntry,
  AttendanceDayFormData,
  AttendanceDayStatus,
  AttendanceMonthlySummary,
} from "../types/attendanceLog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_attendance_log_v1";
const CHANGED_EVENT = "wm:attendance-log-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): AttendanceDayEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AttendanceDayEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: AttendanceDayEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "att_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

/**
 * Calculate total hours from sign in/out times.
 * Returns decimal hours (e.g. 8.5) or undefined if times are invalid/missing.
 */
function calculateHours(signIn: string, signOut: string): number | undefined {
  if (!signIn || !signOut) return undefined;

  const [inH, inM] = signIn.split(":").map(Number);
  const [outH, outM] = signOut.split(":").map(Number);

  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return undefined;

  const inMinutes = inH * 60 + inM;
  const outMinutes = outH * 60 + outM;

  if (outMinutes <= inMinutes) return undefined;

  const diff = outMinutes - inMinutes;
  return Math.round((diff / 60) * 100) / 100;
}

/**
 * Build a YYYY-MM-DD date key from a Date object.
 */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const attendanceLogStorage = {

  // ── Read ──

  /** Get all entries for a specific HR candidate */
  getAllForCandidate(hrCandidateId: string): AttendanceDayEntry[] {
    return read()
      .filter((e) => e.hrCandidateId === hrCandidateId)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  },

  /** Get entries for a specific month (year + month) */
  getMonthEntries(hrCandidateId: string, year: number, month: number): AttendanceDayEntry[] {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return read()
      .filter((e) => e.hrCandidateId === hrCandidateId && e.dateKey.startsWith(prefix))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  },

  /** Get a single day entry */
  getDayEntry(hrCandidateId: string, dateKey: string): AttendanceDayEntry | null {
    return read().find(
      (e) => e.hrCandidateId === hrCandidateId && e.dateKey === dateKey,
    ) ?? null;
  },

  /** Calculate monthly summary (simple counts only — NO averages, NO percentages) */
  getMonthlySummary(hrCandidateId: string, year: number, month: number): AttendanceMonthlySummary {
    const entries = this.getMonthEntries(hrCandidateId, year, month);

    let daysPresent = 0;
    let daysAbsent = 0;
    let daysLeave = 0;
    let daysOff = 0;
    let totalHours = 0;

    for (const entry of entries) {
      switch (entry.status) {
        case "present":
          daysPresent++;
          break;
        case "absent":
          daysAbsent++;
          break;
        case "leave":
          daysLeave++;
          break;
        case "off":
          daysOff++;
          break;
      }
      if (entry.totalHours) {
        totalHours += entry.totalHours;
      }
    }

    return {
      year,
      month,
      daysPresent,
      daysAbsent,
      daysLeave,
      daysOff,
      totalHours: Math.round(totalHours * 100) / 100,
    };
  },

  /** Calculate summary for a custom date range (any start to any end) */
  getRangeSummary(
    hrCandidateId: string,
    startDateKey: string,
    endDateKey: string,
  ): Omit<AttendanceMonthlySummary, "year" | "month"> {
    const entries = read().filter(
      (e) =>
        e.hrCandidateId === hrCandidateId &&
        e.dateKey >= startDateKey &&
        e.dateKey <= endDateKey,
    );

    let daysPresent = 0;
    let daysAbsent = 0;
    let daysLeave = 0;
    let daysOff = 0;
    let totalHours = 0;

    for (const entry of entries) {
      switch (entry.status) {
        case "present":
          daysPresent++;
          break;
        case "absent":
          daysAbsent++;
          break;
        case "leave":
          daysLeave++;
          break;
        case "off":
          daysOff++;
          break;
      }
      if (entry.totalHours) {
        totalHours += entry.totalHours;
      }
    }

    return {
      daysPresent,
      daysAbsent,
      daysLeave,
      daysOff,
      totalHours: Math.round(totalHours * 100) / 100,
    };
  },

  // ── Create / Update ──

  /** Quick mark — tap date, select status (one tap operation) */
  quickMark(hrCandidateId: string, dateKey: string, status: AttendanceDayStatus): boolean {
    const all = read();
    const existingIdx = all.findIndex(
      (e) => e.hrCandidateId === hrCandidateId && e.dateKey === dateKey,
    );

    const now = Date.now();

    if (existingIdx !== -1) {
      // Update existing entry status
      all[existingIdx] = {
        ...all[existingIdx],
        status,
        updatedAt: now,
      };
    } else {
      // Create new entry with status only
      all.push({
        id: genId(),
        hrCandidateId,
        dateKey,
        status,
        createdAt: now,
        updatedAt: now,
      });
    }

    write(all);
    return true;
  },

  /** Full detail save — edit sign in/out, location, note */
  saveDayDetail(hrCandidateId: string, dateKey: string, form: AttendanceDayFormData): boolean {
    const all = read();
    const existingIdx = all.findIndex(
      (e) => e.hrCandidateId === hrCandidateId && e.dateKey === dateKey,
    );

    const now = Date.now();
    const hours = calculateHours(form.signInTime, form.signOutTime);

    const entry: AttendanceDayEntry = {
      id: existingIdx !== -1 ? all[existingIdx].id : genId(),
      hrCandidateId,
      dateKey,
      status: form.status,
      signInTime: form.signInTime || undefined,
      signOutTime: form.signOutTime || undefined,
      totalHours: hours,
      location: form.location.trim() || undefined,
      note: form.note.trim() || undefined,
      createdAt: existingIdx !== -1 ? all[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx !== -1) {
      all[existingIdx] = entry;
    } else {
      all.push(entry);
    }

    write(all);
    return true;
  },

  /** Delete a day entry (undo/correction) */
  deleteDayEntry(hrCandidateId: string, dateKey: string): boolean {
    const all = read();
    const filtered = all.filter(
      (e) => !(e.hrCandidateId === hrCandidateId && e.dateKey === dateKey),
    );

    if (filtered.length === all.length) return false;

    write(filtered);
    return true;
  },

  // ── Utility ──

  toDateKey,
  calculateHours,

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
};
