// src/features/employer/company/storage/companyConfig.storage.ts
//
// Company Settings / Customization (Root Map 7.4.16).
// Working days, holidays, shift timings, weekends, leave year.
// Auto-applies to attendance calendar — weekends/holidays auto-marked Off.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type WorkingDaysPreset = "mon_fri" | "mon_sat" | "custom";

export type CompanyHoliday = {
  id: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Holiday name */
  name: string;
};

export type CompanyConfig = {
  /** Working days preset */
  workingDaysPreset: WorkingDaysPreset;
  /** Custom working days (used when preset = "custom") */
  customWorkingDays: WeekDay[];
  /** Weekend days (auto-derived from working days, but stored for quick lookup) */
  weekendDays: WeekDay[];
  /** Default shift start time (HH:MM) */
  shiftStartTime: string;
  /** Default shift end time (HH:MM) */
  shiftEndTime: string;
  /** Company holidays list */
  holidays: CompanyHoliday[];
  /** Leave year start month (1-12, default 1 = January) */
  leaveYearStartMonth: number;
   /** Managed locations / sites */
  locations: string[];
  /** Managed departments / categories */
  departments: string[];
  /** Last updated timestamp */
  updatedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_company_config_v1";
const CHANGED_EVENT = "wm:company-config-changed";

const ALL_DAYS: WeekDay[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const DEFAULT_CONFIG: CompanyConfig = {
  workingDaysPreset: "mon_fri",
  customWorkingDays: ["mon", "tue", "wed", "thu", "fri"],
  weekendDays: ["sat", "sun"],
  shiftStartTime: "09:00",
  shiftEndTime: "18:00",
  holidays: [],
  leaveYearStartMonth: 1,
  locations: [],
  departments: [],
  updatedAt: 0,
};

export const DAY_LABELS: Record<WeekDay, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): CompanyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw) as CompanyConfig;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function write(config: CompanyConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "hol_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function deriveWeekendDays(preset: WorkingDaysPreset, customDays: WeekDay[]): WeekDay[] {
  let workDays: WeekDay[];
  switch (preset) {
    case "mon_fri":
      workDays = ["mon", "tue", "wed", "thu", "fri"];
      break;
    case "mon_sat":
      workDays = ["mon", "tue", "wed", "thu", "fri", "sat"];
      break;
    case "custom":
      workDays = customDays;
      break;
    default:
      workDays = ["mon", "tue", "wed", "thu", "fri"];
  }
  return ALL_DAYS.filter((d) => !workDays.includes(d));
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const companyConfigStorage = {

  /** Get current config */
  get(): CompanyConfig {
    return read();
  },

  /** Check if a specific date is a weekend */
  isWeekend(dateKey: string): boolean {
    const config = read();
    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayIndex = date.getDay(); // 0=Sun
    const dayMap: WeekDay[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return config.weekendDays.includes(dayMap[dayIndex]);
  },

  /** Check if a specific date is a company holiday */
  isHoliday(dateKey: string): boolean {
    const config = read();
    return config.holidays.some((h) => h.date === dateKey);
  },

  /** Check if a date is a non-working day (weekend OR holiday) */
  isOffDay(dateKey: string): boolean {
    return this.isWeekend(dateKey) || this.isHoliday(dateKey);
  },

  /** Get default shift times */
  getShiftTimes(): { start: string; end: string } {
    const config = read();
    return { start: config.shiftStartTime, end: config.shiftEndTime };
  },

  // ── Update ──

  /** Set working days preset */
  setWorkingDays(preset: WorkingDaysPreset, customDays?: WeekDay[]): void {
    const config = read();
    const days = customDays ?? config.customWorkingDays;
    write({
      ...config,
      workingDaysPreset: preset,
      customWorkingDays: preset === "custom" ? days : config.customWorkingDays,
      weekendDays: deriveWeekendDays(preset, days),
      updatedAt: Date.now(),
    });
  },

  /** Set default shift timings */
  setShiftTimings(startTime: string, endTime: string): void {
    const config = read();
    write({
      ...config,
      shiftStartTime: startTime,
      shiftEndTime: endTime,
      updatedAt: Date.now(),
    });
  },

  /** Set leave year start month */
  setLeaveYearStart(month: number): void {
    const config = read();
    write({ ...config, leaveYearStartMonth: month, updatedAt: Date.now() });
  },

  /** Add a company holiday */
  addHoliday(date: string, name: string): boolean {
    const config = read();
    // Prevent duplicates on same date
    if (config.holidays.some((h) => h.date === date)) return false;
    const holiday: CompanyHoliday = { id: genId(), date, name: name.trim() };
    write({
      ...config,
      holidays: [...config.holidays, holiday].sort((a, b) => a.date.localeCompare(b.date)),
      updatedAt: Date.now(),
    });
    return true;
  },

  /** Remove a company holiday */
  removeHoliday(id: string): boolean {
    const config = read();
    const filtered = config.holidays.filter((h) => h.id !== id);
    if (filtered.length === config.holidays.length) return false;
    write({ ...config, holidays: filtered, updatedAt: Date.now() });
    return true;
  },

 // ── Locations ──

  /** Get all managed locations */
  getLocations(): string[] {
    return read().locations;
  },

  /** Add a location (prevents duplicates) */
  addLocation(name: string): boolean {
    const config = read();
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (config.locations.some((l) => l.toLowerCase() === trimmed.toLowerCase())) return false;
    write({ ...config, locations: [...config.locations, trimmed].sort(), updatedAt: Date.now() });
    return true;
  },

  /** Remove a location */
  removeLocation(name: string): boolean {
    const config = read();
    const filtered = config.locations.filter((l) => l !== name);
    if (filtered.length === config.locations.length) return false;
    write({ ...config, locations: filtered, updatedAt: Date.now() });
    return true;
  },

  /** Rename a location */
  renameLocation(oldName: string, newName: string): boolean {
    const config = read();
    const trimmed = newName.trim();
    if (!trimmed) return false;
    if (config.locations.some((l) => l.toLowerCase() === trimmed.toLowerCase() && l !== oldName)) return false;
    const updated = config.locations.map((l) => (l === oldName ? trimmed : l)).sort();
    write({ ...config, locations: updated, updatedAt: Date.now() });
    return true;
  },

  // ── Departments ──

  /** Get all managed departments */
  getDepartments(): string[] {
    return read().departments;
  },

  /** Add a department (prevents duplicates) */
  addDepartment(name: string): boolean {
    const config = read();
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (config.departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) return false;
    write({ ...config, departments: [...config.departments, trimmed].sort(), updatedAt: Date.now() });
    return true;
  },

  /** Remove a department */
  removeDepartment(name: string): boolean {
    const config = read();
    const filtered = config.departments.filter((d) => d !== name);
    if (filtered.length === config.departments.length) return false;
    write({ ...config, departments: filtered, updatedAt: Date.now() });
    return true;
  },

  /** Rename a department */
  renameDepartment(oldName: string, newName: string): boolean {
    const config = read();
    const trimmed = newName.trim();
    if (!trimmed) return false;
    if (config.departments.some((d) => d.toLowerCase() === trimmed.toLowerCase() && d !== oldName)) return false;
    const updated = config.departments.map((d) => (d === oldName ? trimmed : d)).sort();
    write({ ...config, departments: updated, updatedAt: Date.now() });
    return true;
  },

  /** Auto-detect locations and departments from existing HR records */
  autoDetectFromHR(records: { location?: string; department?: string }[]): { locationsAdded: number; departmentsAdded: number } {
    const config = read();
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
      write({
        ...config,
        locations: newLocs.sort(),
        departments: newDepts.sort(),
        updatedAt: Date.now(),
      });
    }

    return { locationsAdded, departmentsAdded };
  },

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
};