// src/features/employee/settings/storage/employeeSettings.storage.ts
export type EmployeeLanguage = "en" | "ml";
export type EmployeeSettings = {
  language: EmployeeLanguage;
  // Home preference (Phase-0)
  defaultHomeTab: "home" | "jobs" | "alerts";
  // Notifications (demo toggles)
  pushEnabled: boolean;
  shiftAlerts: boolean;
  careerAlerts: boolean;
  workforceAlerts: boolean;
  quietHoursEnabled: boolean;
  quietFrom: string; // "22:00"
  quietTo: string; // "07:00"
  // Security (Phase-0 safe)
  appLockEnabled: boolean;
  // Quick Apply (Shift Jobs)
  quickApplyEnabled: boolean;
};
const KEY = "wm_employee_settings_v1";
const DEFAULTS: EmployeeSettings = {
  language: "en",
  defaultHomeTab: "home",
  pushEnabled: true,
  shiftAlerts: true,
  careerAlerts: true,
  workforceAlerts: true,
  quietHoursEnabled: false,
  quietFrom: "22:00",
  quietTo: "07:00",
  appLockEnabled: false,
  quickApplyEnabled: false,
};
function safeParse(raw: string | null): EmployeeSettings {
  if (!raw) return { ...DEFAULTS };
  try {
    const parsed = JSON.parse(raw) as Partial<EmployeeSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}
function write(s: EmployeeSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
export const employeeSettingsStorage = {
  get(): EmployeeSettings {
    return safeParse(localStorage.getItem(KEY));
  },
  set(next: EmployeeSettings) {
    write(next);
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};