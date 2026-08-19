// src/features/employee/settings/storage/employeeSettings.storage.ts
export type EmployeeLanguage = "en" | "ml";
export type DocumentVisibility = "private" | "employers_on_hire" | "verified_employers";

export type EmployeeSettings = {
  language: EmployeeLanguage;
  // Home preference (Phase-0)
  defaultHomeTab: "home" | "jobs" | "alerts";
  // Notifications
  pushEnabled: boolean;
  shiftAlerts: boolean;
  careerAlerts: boolean;
  workforceAlerts: boolean;
  /** Escrow credit / release alerts */
  escrowCreditAlerts: boolean;
  quietHoursEnabled: boolean;
  quietFrom: string; // "22:00"
  quietTo: string; // "07:00"
  // Security (device)
  appLockEnabled: boolean;
  // Quick Apply (Shift Jobs)
  quickApplyEnabled: boolean;
  // Sound & Haptics
  hapticFeedback: boolean;
  globalMute: boolean;
  // Work & payout preferences
  searchRadiusKm: number;
  preferredHourlyMin: number;
  preferredHourlyMax: number;
  payoutBankLinked: boolean;
  payoutUpiLinked: boolean;
  // Privacy & compliance
  openToWork: boolean;
  documentVisibility: DocumentVisibility;
};
const KEY = "wm_employee_settings_v1";
const DEBOUNCE_MS = 350;

const DEFAULTS: EmployeeSettings = {
  language: "en",
  defaultHomeTab: "home",
  pushEnabled: true,
  shiftAlerts: true,
  careerAlerts: true,
  workforceAlerts: true,
  escrowCreditAlerts: true,
  quietHoursEnabled: false,
  quietFrom: "22:00",
  quietTo: "07:00",
  appLockEnabled: false,
  quickApplyEnabled: false,
  hapticFeedback: true,
  globalMute: false,
  searchRadiusKm: 15,
  preferredHourlyMin: 12,
  preferredHourlyMax: 45,
  payoutBankLinked: false,
  payoutUpiLinked: false,
  openToWork: true,
  documentVisibility: "employers_on_hire",
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingDebounced: EmployeeSettings | null = null;

function safeParse(raw: string | null): EmployeeSettings {
  if (!raw) return { ...DEFAULTS };
  try {
    const parsed = JSON.parse(raw) as Partial<EmployeeSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

function writeNow(s: EmployeeSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("wm:app-settings-changed"));
}

function flushDebounced() {
  debounceTimer = null;
  if (!pendingDebounced) return;
  const next = pendingDebounced;
  pendingDebounced = null;
  writeNow(next);
}

export const employeeSettingsStorage = {
  get(): EmployeeSettings {
    return safeParse(localStorage.getItem(KEY));
  },

  /** Immediate persist + event (toggles, selects). */
  set(next: EmployeeSettings) {
    if (debounceTimer != null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
      pendingDebounced = null;
    }
    writeNow(next);
  },

  /**
   * Coalesce quiet-hours time keystrokes into one write + one global event (P1-1).
   */
  setDebounced(next: EmployeeSettings) {
    pendingDebounced = next;
    if (debounceTimer != null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flushDebounced, DEBOUNCE_MS);
  },

  /** Force any pending debounced write (logout / unmount). */
  flush() {
    if (debounceTimer != null) {
      clearTimeout(debounceTimer);
      flushDebounced();
    }
  },

  clear() {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("wm:app-settings-changed"));
  },
};
