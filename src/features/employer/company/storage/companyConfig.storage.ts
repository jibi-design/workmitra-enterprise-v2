// src/features/employer/company/storage/companyConfig.storage.ts — facade

export type {
  WeekDay,
  WorkingDaysPreset,
  CompanyHoliday,
  CompanyConfig,
} from "./companyConfig.storage.types";

export { DAY_LABELS, MONTH_OPTIONS } from "./companyConfig.storage.internal";

import type { CompanyHoliday, WeekDay, WorkingDaysPreset } from "./companyConfig.storage.types";
import {
  CHANGED_EVENT,
  deriveWeekendDays,
  genId,
  readConfig,
  writeConfig,
} from "./companyConfig.storage.internal";

export const companyConfigStorage = {
  get() {
    return readConfig();
  },

  isWeekend(dateKey: string): boolean {
    const config = readConfig();
    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayIndex = date.getDay();
    const dayMap: WeekDay[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return config.weekendDays.includes(dayMap[dayIndex]);
  },

  isHoliday(dateKey: string): boolean {
    const config = readConfig();
    return config.holidays.some((h) => h.date === dateKey);
  },

  isOffDay(dateKey: string): boolean {
    return this.isWeekend(dateKey) || this.isHoliday(dateKey);
  },

  getShiftTimes(): { start: string; end: string } {
    const config = readConfig();
    return { start: config.shiftStartTime, end: config.shiftEndTime };
  },

  setWorkingDays(preset: WorkingDaysPreset, customDays?: WeekDay[]): void {
    const config = readConfig();
    const days = customDays ?? config.customWorkingDays;
    writeConfig({
      ...config,
      workingDaysPreset: preset,
      customWorkingDays: preset === "custom" ? days : config.customWorkingDays,
      weekendDays: deriveWeekendDays(preset, days),
      updatedAt: Date.now(),
    });
  },

  setShiftTimings(startTime: string, endTime: string): void {
    const config = readConfig();
    writeConfig({
      ...config,
      shiftStartTime: startTime,
      shiftEndTime: endTime,
      updatedAt: Date.now(),
    });
  },

  setLeaveYearStart(month: number): void {
    const config = readConfig();
    writeConfig({ ...config, leaveYearStartMonth: month, updatedAt: Date.now() });
  },

  addHoliday(date: string, name: string): boolean {
    const config = readConfig();
    if (config.holidays.some((h) => h.date === date)) return false;
    const holiday: CompanyHoliday = { id: genId(), date, name: name.trim() };
    writeConfig({
      ...config,
      holidays: [...config.holidays, holiday].sort((a, b) => a.date.localeCompare(b.date)),
      updatedAt: Date.now(),
    });
    return true;
  },

  removeHoliday(id: string): boolean {
    const config = readConfig();
    const filtered = config.holidays.filter((h) => h.id !== id);
    if (filtered.length === config.holidays.length) return false;
    writeConfig({ ...config, holidays: filtered, updatedAt: Date.now() });
    return true;
  },

  getLocations(): string[] {
    return readConfig().locations;
  },

  addLocation(name: string): boolean {
    const config = readConfig();
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (config.locations.some((l) => l.toLowerCase() === trimmed.toLowerCase())) return false;
    writeConfig({
      ...config,
      locations: [...config.locations, trimmed].sort(),
      updatedAt: Date.now(),
    });
    return true;
  },

  removeLocation(name: string): boolean {
    const config = readConfig();
    const filtered = config.locations.filter((l) => l !== name);
    if (filtered.length === config.locations.length) return false;
    writeConfig({ ...config, locations: filtered, updatedAt: Date.now() });
    return true;
  },

  renameLocation(oldName: string, newName: string): boolean {
    const config = readConfig();
    const trimmed = newName.trim();
    if (!trimmed) return false;
    if (config.locations.some((l) => l.toLowerCase() === trimmed.toLowerCase() && l !== oldName))
      return false;
    const updated = config.locations.map((l) => (l === oldName ? trimmed : l)).sort();
    writeConfig({ ...config, locations: updated, updatedAt: Date.now() });
    return true;
  },

  getDepartments(): string[] {
    return readConfig().departments;
  },

  addDepartment(name: string): boolean {
    const config = readConfig();
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (config.departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) return false;
    writeConfig({
      ...config,
      departments: [...config.departments, trimmed].sort(),
      updatedAt: Date.now(),
    });
    return true;
  },

  removeDepartment(name: string): boolean {
    const config = readConfig();
    const filtered = config.departments.filter((d) => d !== name);
    if (filtered.length === config.departments.length) return false;
    writeConfig({ ...config, departments: filtered, updatedAt: Date.now() });
    return true;
  },

  renameDepartment(oldName: string, newName: string): boolean {
    const config = readConfig();
    const trimmed = newName.trim();
    if (!trimmed) return false;
    if (config.departments.some((d) => d.toLowerCase() === trimmed.toLowerCase() && d !== oldName))
      return false;
    const updated = config.departments.map((d) => (d === oldName ? trimmed : d)).sort();
    writeConfig({ ...config, departments: updated, updatedAt: Date.now() });
    return true;
  },

  autoDetectFromHR(records: { location?: string; department?: string }[]): {
    locationsAdded: number;
    departmentsAdded: number;
  } {
    const config = readConfig();
    let locationsAdded = 0;
    let departmentsAdded = 0;

    const existingLocs = new Set(config.locations.map((l) => l.toLowerCase()));
    const existingDepts = new Set(config.departments.map((d) => d.toLowerCase()));
    const newLocs = [...config.locations];
    const newDepts = [...config.departments];

    for (const r of records) {
      const loc = r.location?.trim();
      if (loc && !existingLocs.has(loc.toLowerCase())) {
        existingLocs.add(loc.toLowerCase());
        newLocs.push(loc);
        locationsAdded++;
      }
      const dept = r.department?.trim();
      if (dept && !existingDepts.has(dept.toLowerCase())) {
        existingDepts.add(dept.toLowerCase());
        newDepts.push(dept);
        departmentsAdded++;
      }
    }

    if (locationsAdded > 0 || departmentsAdded > 0) {
      writeConfig({
        ...config,
        locations: newLocs.sort(),
        departments: newDepts.sort(),
        updatedAt: Date.now(),
      });
    }

    return { locationsAdded, departmentsAdded };
  },

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
};
