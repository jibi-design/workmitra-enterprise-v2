/** Job Mitra | appSettingsStore — cross-role settings gate (haptics governance) */

import { create } from "zustand";
import { roleStorage } from "../../app/storage/roleStorage";
import { employeeSettingsStorage } from "../../features/employee/settings/storage/employeeSettings.storage";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";

const SETTINGS_CHANGED_EVENT = "wm:app-settings-changed";

export function readHapticFeedbackEnabled(): boolean {
  const role = roleStorage.get();

  if (role === "employer") {
    return employerSettingsStorage.get().hapticFeedback;
  }

  if (role === "employee") {
    return employeeSettingsStorage.get().hapticFeedback;
  }

  return true;
}

type AppSettingsState = {
  hapticFeedback: boolean;
  refresh: () => void;
};

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  hapticFeedback: readHapticFeedbackEnabled(),
  refresh: () => set({ hapticFeedback: readHapticFeedbackEnabled() }),
}));

/** Imperative accessor for non-React utilities (always reads live role storage). */
export const appSettingsStore = {
  get hapticFeedback(): boolean {
    return readHapticFeedbackEnabled();
  },
  refresh(): void {
    useAppSettingsStore.getState().refresh();
  },
};

export function notifyAppSettingsChanged(): void {
  appSettingsStore.refresh();
  window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
}

if (typeof window !== "undefined") {
  window.addEventListener("wm:role-changed", () => {
    appSettingsStore.refresh();
  });
  window.addEventListener("wm:employer-profile-changed", () => {
    appSettingsStore.refresh();
  });
  window.addEventListener(SETTINGS_CHANGED_EVENT, () => {
    appSettingsStore.refresh();
  });
}
