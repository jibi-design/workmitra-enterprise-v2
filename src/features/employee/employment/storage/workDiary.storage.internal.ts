import type { WorkDiaryEntry, WorkDiaryMonthlySummary } from "../helpers/workDiary.types";

export type WorkDiaryCycleMode = "calendar_month" | "custom_start_day";

export type WorkDiaryCycleSetting = {
  mode: WorkDiaryCycleMode;
  startDay: number;
};

export const STORAGE_KEY = "wm_work_diary_v1";
export const SETTINGS_KEY = "wm_work_diary_settings_v1";
export const CHANGED_EVENT = "wm:work-diary-changed";

export function read(): WorkDiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkDiaryEntry[]) : [];
  } catch {
    return [];
  }
}

export function write(entries: WorkDiaryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function readSettings(): Record<string, WorkDiaryCycleSetting> {
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

export function writeSettings(settings: Record<string, WorkDiaryCycleSetting>): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function genId(): string {
  return `wd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function calculateHours(signIn: string, signOut: string): number | undefined {
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

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export function nowTimeString(): string {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function summarizeEntries(entries: WorkDiaryEntry[]): WorkDiaryMonthlySummary {
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
