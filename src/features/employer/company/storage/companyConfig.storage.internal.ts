import type { CompanyConfig, WeekDay, WorkingDaysPreset } from "./companyConfig.storage.types";

export const STORAGE_KEY = "wm_company_config_v1";
export const CHANGED_EVENT = "wm:company-config-changed";

export const ALL_DAYS: WeekDay[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const DEFAULT_CONFIG: CompanyConfig = {
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

export function readConfig(): CompanyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw) as CompanyConfig;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function writeConfig(config: CompanyConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function genId(): string {
  return "hol_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function deriveWeekendDays(preset: WorkingDaysPreset, customDays: WeekDay[]): WeekDay[] {
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
