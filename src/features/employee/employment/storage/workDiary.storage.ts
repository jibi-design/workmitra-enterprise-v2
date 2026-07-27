// App name: Job Mitra
// File name: workDiary.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\storage\workDiary.storage.ts

import type {
  WorkDiaryEntry,
  WorkDiaryFormData,
  WorkDiaryMonthlySummary,
} from "../helpers/workDiary.types";
import {
  clampStartDay,
  getCycleRangeForDate,
  getCycleRangeForMonth,
  isWithinRange,
} from "./workDiary.cycle.helpers";
import {
  calculateHours,
  CHANGED_EVENT,
  genId,
  nowTimeString,
  read,
  readSettings,
  summarizeEntries,
  toDateKey,
  write,
  writeSettings,
  type WorkDiaryCycleSetting,
} from "./workDiary.storage.internal";

export type { WorkDiaryCycleMode, WorkDiaryCycleSetting } from "./workDiary.storage.internal";

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
