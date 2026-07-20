/** Job Mitra | pulseNavStore.ts
 *  Single-purpose store for the Pulse Navigation enabled/disabled flag.
 *  Kept separate from pulseStore to avoid circular imports.
 *  Settings pages read/write here; pulseStore guards check getPulseNavEnabled().
 */

import { create } from "zustand";

const STORAGE_KEY = "wm:pulse-nav-enabled";

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

type PulseNavState = {
  readonly enabled: boolean;
  readonly setEnabled: (v: boolean) => void;
};

export const usePulseNavStore = create<PulseNavState>((set) => ({
  enabled: readEnabled(),
  setEnabled: (v) => {
    try {
      localStorage.setItem(STORAGE_KEY, v ? "true" : "false");
    } catch {
      /* storage unavailable */
    }
    set({ enabled: v });
  },
}));

/** Synchronous getter — used by pulseStore guards. No React overhead. */
export function getPulseNavEnabled(): boolean {
  return usePulseNavStore.getState().enabled;
}
