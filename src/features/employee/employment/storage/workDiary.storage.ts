// App name: Job Mitra
// File name: workDiary.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\storage\workDiary.storage.ts

import type {
  WorkDiaryEntry,
  WorkDiaryFormData,
  WorkDiaryMonthlySummary,
} from "../helpers/workDiary.types";

export type WorkDiaryCycleMode = "calendar_month" | "custom_start_day";

export type WorkDiaryCycleSetting = {
  mode: WorkDiaryCycleMode;
  startDay: number;
};

const STORAGE_KEY = "wm_work_diary_v1";
const SETTINGS_KEY = "wm_work_diary_settings_v1";
const CHANGED_EVENT = "wm:work-diary-changed";

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

function readSettings(): Record<string, WorkDiaryCycleSetting> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);

    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, WorkDiaryCycleSetting>)
      : {};
  } catch {
    return {};
  }
}

function writeSettings(settings: Record<string, WorkDiaryCycleSetting>): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return `wd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function calculateHours(signIn: string, signOut: string): number | undefined {
  if (!signIn || !signOut) return undefined;

  const [inH, inM] = signIn.split(":").map(Number);
  const [outH, outM] = signOut.split(":").map(Number);

  if (Number.isNaN(inH) || Number.isNaN(inM) || Number.isNaN(outH) || Number.isNaN(outM)) {
    return undefined;
  }

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

function clampStartDay(day: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(31, Math.max(1, Math.floor(day)));
}

function dateKeyToDate(dateKey: string): Date | null {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return null;

  return new Date(y, m - 1, d);
}

function isWithinRange(dateKey: string, start: Date, end: Date): boolean {
  const date = dateKeyToDate(dateKey);
  if (!date) return false;

  return date >= start && date <= end;
}

function getCycleRangeForDate(
  referenceDate: Date,
  setting: WorkDiaryCycleSetting,
): { start: Date; end: Date } {
  const mode = setting.mode;
  const startDay = clampStartDay(setting.startDay);

  if (mode === "calendar_month" || startDay === 1) {
    return {
      start: new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
      end: new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0),
    };
  }

  const currentDay = referenceDate.getDate();
  const start =
    currentDay >= startDay
      ? new Date(referenceDate.getFullYear(), referenceDate.getMonth(), startDay)
      : new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, startDay);

  const nextMonthLastDay = new Date(start.getFullYear(), start.getMonth() + 2, 0).getDate();
  const safeNextStartDay = Math.min(startDay, nextMonthLastDay);
  const nextStart = new Date(start.getFullYear(), start.getMonth() + 1, safeNextStartDay);

  const end = new Date(nextStart);
  end.setDate(end.getDate() - 1);

  return { start, end };
}

function getCycleRangeForMonth(
  year: number,
  month: number,
  setting: WorkDiaryCycleSetting,
): { start: Date; end: Date } {
  const mode = setting.mode;
  const startDay = clampStartDay(setting.startDay);
  const monthIndex = month - 1;

  if (mode === "calendar_month" || startDay === 1) {
    return {
      start: new Date(year, monthIndex, 1),
      end: new Date(year, monthIndex + 1, 0),
    };
  }

  const startMonthLastDay = new Date(year, monthIndex + 1, 0).getDate();
  const safeStartDay = Math.min(startDay, startMonthLastDay);
  const start = new Date(year, monthIndex, safeStartDay);

  const nextMonthLastDay = new Date(year, monthIndex + 2, 0).getDate();
  const safeNextStartDay = Math.min(startDay, nextMonthLastDay);
  const nextStart = new Date(year, monthIndex + 1, safeNextStartDay);

  const end = new Date(nextStart);
  end.setDate(end.getDate() - 1);

  return { start, end };
}

function summarizeEntries(entries: WorkDiaryEntry[]): WorkDiaryMonthlySummary {
  let daysWorked = 0;
  let totalHours = 0;
  let daysLeave = 0;
  let daysOff = 0;

  for (const entry of entries) {
    switch (entry.status) {
      case "worked":
        daysWorked++;
        break;
      case "leave":
        daysLeave++;
        break;
      case "off":
        daysOff++;
        break;
    }

    if (entry.totalHours) totalHours += entry.totalHours;
  }

  return {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    daysWorked,
    totalHours: Math.round(totalHours * 100) / 100,
    daysLeave,
    daysOff,
  };
}

export const workDiaryStorage = {
  getAllEntries(): WorkDiaryEntry[] {
    return read();
  },

  getRangeEntries(employmentId: string, startDate: string, endDate: string): WorkDiaryEntry[] {
    return read()
      .filter(
        (entry) =>
          entry.employmentId === employmentId &&
          entry.dateKey >= startDate &&
          entry.dateKey <= endDate,
      )
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  },

  getMonthEntries(employmentId: string, year: number, month: number): WorkDiaryEntry[] {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;

    return read()
      .filter((entry) => entry.employmentId === employmentId && entry.dateKey.startsWith(prefix))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  },

  getDayEntry(employmentId: string, dateKey: string): WorkDiaryEntry | null {
    return (
      read().find((entry) => entry.employmentId === employmentId && entry.dateKey === dateKey) ??
      null
    );
  },

  getActivePunch(employmentId: string): WorkDiaryEntry | null {
    return (
      read().find((entry) => entry.employmentId === employmentId && entry.isPunchActive) ?? null
    );
  },

  getAnyActivePunch(): WorkDiaryEntry | null {
    return read().find((entry) => entry.isPunchActive) ?? null;
  },

  getActivePunchForOtherEmployment(employmentId: string): WorkDiaryEntry | null {
    return (
      read().find((entry) => entry.employmentId !== employmentId && entry.isPunchActive) ?? null
    );
  },

  getMonthlySummary(employmentId: string, year: number, month: number): WorkDiaryMonthlySummary {
    const entries = this.getMonthEntries(employmentId, year, month);
    const summary = summarizeEntries(entries);

    return { ...summary, year, month };
  },

  getCycleSetting(employmentId: string): WorkDiaryCycleSetting {
    const settings = readSettings();
    const saved = settings[employmentId];

    if (!saved) return { mode: "calendar_month", startDay: 1 };

    return {
      mode: saved.mode === "custom_start_day" ? "custom_start_day" : "calendar_month",
      startDay: clampStartDay(saved.startDay),
    };
  },

  saveCycleSetting(employmentId: string, setting: WorkDiaryCycleSetting): void {
    const settings = readSettings();

    settings[employmentId] = {
      mode: setting.mode,
      startDay: setting.mode === "custom_start_day" ? clampStartDay(setting.startDay) : 1,
    };

    writeSettings(settings);
  },

  getCurrentCycleSummary(employmentId: string): WorkDiaryMonthlySummary {
    const setting = this.getCycleSetting(employmentId);
    const range = getCycleRangeForDate(new Date(), setting);

    const entries = read()
      .filter(
        (entry) =>
          entry.employmentId === employmentId &&
          isWithinRange(entry.dateKey, range.start, range.end),
      )
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    const summary = summarizeEntries(entries);

    return {
      ...summary,
      year: range.start.getFullYear(),
      month: range.start.getMonth() + 1,
    };
  },

  getCycleSummaryForMonth(
    employmentId: string,
    year: number,
    month: number,
  ): WorkDiaryMonthlySummary {
    const setting = this.getCycleSetting(employmentId);
    const range = getCycleRangeForMonth(year, month, setting);

    const entries = read()
      .filter(
        (entry) =>
          entry.employmentId === employmentId &&
          isWithinRange(entry.dateKey, range.start, range.end),
      )
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    const summary = summarizeEntries(entries);

    return {
      ...summary,
      year: range.start.getFullYear(),
      month: range.start.getMonth() + 1,
    };
  },

  getCurrentCycleLabel(employmentId: string): string {
    const setting = this.getCycleSetting(employmentId);

    if (setting.mode === "calendar_month" || setting.startDay === 1) return "Calendar month";

    return `${setting.startDay} to next ${setting.startDay - 1 || "month end"}`;
  },

  punchIn(employmentId: string): boolean {
    const todayKey = toDateKey(new Date());
    const activePunch = this.getAnyActivePunch();

    if (activePunch) return false;

    const all = read();
    const existingIdx = all.findIndex(
      (entry) => entry.employmentId === employmentId && entry.dateKey === todayKey,
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

  punchOut(employmentId: string): boolean {
    const all = read();
    const idx = all.findIndex(
      (entry) => entry.employmentId === employmentId && entry.isPunchActive,
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

  saveDayDetail(employmentId: string, dateKey: string, form: WorkDiaryFormData): boolean {
    const all = read();
    const existingIdx = all.findIndex(
      (entry) => entry.employmentId === employmentId && entry.dateKey === dateKey,
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
      (entry) => !(entry.employmentId === employmentId && entry.dateKey === dateKey),
    );

    if (filtered.length === all.length) return false;

    write(filtered);
    return true;
  },

  toDateKey,
  calculateHours,

  subscribe(callback: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, callback);
    return () => window.removeEventListener(CHANGED_EVENT, callback);
  },

  CHANGED_EVENT,
};
