// src/features/employee/employment/storage/workDiary.storage.ts
//
// CRUD service for Work Diary (Root Map Section 5.5.A).
// Employee's personal work log — 100% private.
// Employer CANNOT see — completely separate from Employer Attendance Log.
// Entries timestamped — cannot be backdated.

import type {
  WorkDiaryEntry,
  WorkDiaryFormData,
  WorkDiaryMonthlySummary,
} from "../helpers/workDiary.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_work_diary_v1";
const CHANGED_EVENT = "wm:work-diary-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): WorkDiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkDiaryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: WorkDiaryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "wd_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function calculateHours(signIn: string, signOut: string): number | undefined {
  if (!signIn || !signOut) return undefined;
  const [inH, inM] = signIn.split(":").map(Number);
  const [outH, outM] = signOut.split(":").map(Number);
  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return undefined;
  const inMinutes = inH * 60 + inM;
  const outMinutes = outH * 60 + outM;
  if (outMinutes <= inMinutes) return undefined;
  return Math.round(((outMinutes - inMinutes) / 60) * 100) / 100;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nowTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const workDiaryStorage = {

  // ── Read ──

  getMonthEntries(employmentId: string, year: number, month: number): WorkDiaryEntry[] {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return read()
      .filter((e) => e.employmentId === employmentId && e.dateKey.startsWith(prefix))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  },

  getDayEntry(employmentId: string, dateKey: string): WorkDiaryEntry | null {
    return read().find(
      (e) => e.employmentId === employmentId && e.dateKey === dateKey,
    ) ?? null;
  },

  /** Check if there's an active punch (punched in, not out yet) */
  getActivePunch(employmentId: string): WorkDiaryEntry | null {
    return read().find(
      (e) => e.employmentId === employmentId && e.isPunchActive,
    ) ?? null;
  },

  getMonthlySummary(employmentId: string, year: number, month: number): WorkDiaryMonthlySummary {
    const entries = this.getMonthEntries(employmentId, year, month);
    let daysWorked = 0;
    let totalHours = 0;
    let daysLeave = 0;
    let daysOff = 0;

    for (const entry of entries) {
      switch (entry.status) {
        case "worked": daysWorked++; break;
        case "leave": daysLeave++; break;
        case "off": daysOff++; break;
      }
      if (entry.totalHours) totalHours += entry.totalHours;
    }

    return {
      year, month, daysWorked, totalHours: Math.round(totalHours * 100) / 100, daysLeave, daysOff,
    };
  },

  // ── Punch In / Punch Out ──

  /** Start Work — punch in */
  punchIn(employmentId: string): boolean {
    const todayKey = toDateKey(new Date());
    const existing = this.getActivePunch(employmentId);
    if (existing) return false; // Already punched in

    const all = read();
    const existingIdx = all.findIndex(
      (e) => e.employmentId === employmentId && e.dateKey === todayKey,
    );

    const now = Date.now();
    const timeStr = nowTimeString();

    if (existingIdx !== -1) {
      all[existingIdx] = {
        ...all[existingIdx],
        status: "worked",
        punchInTime: timeStr,
        punchOutTime: undefined,
        totalHours: undefined,
        isPunchActive: true,
        updatedAt: now,
      };
    } else {
      all.push({
        id: genId(),
        employmentId,
        dateKey: todayKey,
        status: "worked",
        punchInTime: timeStr,
        isPunchActive: true,
        photoCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    write(all);
    return true;
  },

  /** End Work — punch out */
  punchOut(employmentId: string): boolean {
    const all = read();
    const idx = all.findIndex(
      (e) => e.employmentId === employmentId && e.isPunchActive,
    );
    if (idx === -1) return false;

    const timeStr = nowTimeString();
    const hours = calculateHours(all[idx].punchInTime ?? "", timeStr);

    all[idx] = {
      ...all[idx],
      punchOutTime: timeStr,
      totalHours: hours,
      isPunchActive: false,
      updatedAt: Date.now(),
    };

    write(all);
    return true;
  },

  // ── Manual Entry / Edit ──

  saveDayDetail(employmentId: string, dateKey: string, form: WorkDiaryFormData): boolean {
    const all = read();
    const existingIdx = all.findIndex(
      (e) => e.employmentId === employmentId && e.dateKey === dateKey,
    );

    const now = Date.now();
    const hours = calculateHours(form.punchInTime, form.punchOutTime);

    const entry: WorkDiaryEntry = {
      id: existingIdx !== -1 ? all[existingIdx].id : genId(),
      employmentId,
      dateKey,
      status: form.status,
      punchInTime: form.punchInTime || undefined,
      punchOutTime: form.punchOutTime || undefined,
      totalHours: hours,
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
      photoCount: existingIdx !== -1 ? all[existingIdx].photoCount : 0,
      isPunchActive: false,
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

  deleteDayEntry(employmentId: string, dateKey: string): boolean {
    const all = read();
    const filtered = all.filter(
      (e) => !(e.employmentId === employmentId && e.dateKey === dateKey),
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