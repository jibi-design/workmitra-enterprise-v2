/**
 * Temporary QA harness for Case 1 — Candidate Availability ↔ Employer Sync.
 * Enable: localStorage.setItem("wm_debug_availability_sync", "1") then reload.
 * Disable: localStorage.removeItem("wm_debug_availability_sync")
 */

import { ALL_KEY, CHANGED } from "../../employee/shiftJobs/storage/availabilityStorage.helpers";

export const AVAILABILITY_DEBUG_FLAG = "wm_debug_availability_sync";

export function isAvailabilitySyncDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  // Never show QA overlays outside Vite DEV — even if localStorage flag is set.
  if (!import.meta.env.DEV) return false;
  try {
    return window.localStorage.getItem(AVAILABILITY_DEBUG_FLAG) === "1";
  } catch {
    return false;
  }
}

export function enableAvailabilitySyncDebug(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AVAILABILITY_DEBUG_FLAG, "1");
}

export function logAvailabilitySync(source: string, detail: Record<string, unknown> = {}): void {
  if (!isAvailabilitySyncDebugEnabled()) return;
   
  console.info(`[AvailabilitySync][${source}]`, {
    event: CHANGED,
    poolKey: ALL_KEY,
    at: new Date().toISOString(),
    ...detail,
  });
}

export type AvailabilitySyncDebugSnapshot = {
  enabled: boolean;
  poolCount: number;
  poolWorkerIds: string[];
  lastEventAt: string | null;
};

let lastEventAt: string | null = null;
let debugListenersAttached = false;

export function noteAvailabilitySyncEvent(meta?: Record<string, unknown>): void {
  lastEventAt = new Date().toISOString();
  logAvailabilitySync("event-dispatched", meta ?? {});
}

export function readAvailabilitySyncDebugSnapshot(
  poolWorkerIds: string[],
): AvailabilitySyncDebugSnapshot {
  return {
    enabled: isAvailabilitySyncDebugEnabled(),
    poolCount: poolWorkerIds.length,
    poolWorkerIds,
    lastEventAt,
  };
}

/** Attach once — logs every wm:availability-broadcasts-changed fire. */
export function ensureAvailabilitySyncDebugListener(): void {
  if (typeof window === "undefined" || debugListenersAttached) return;
  if (!isAvailabilitySyncDebugEnabled()) return;

  debugListenersAttached = true;
  window.addEventListener(CHANGED, () => {
    lastEventAt = new Date().toISOString();
    let poolLen = 0;
    try {
      const raw = window.localStorage.getItem(ALL_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown[]) : [];
      poolLen = Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      poolLen = -1;
    }
    logAvailabilitySync("listener-received", { poolLen });
  });
}
