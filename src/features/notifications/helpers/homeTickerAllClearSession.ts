/** Job Mitra | homeTickerAllClearSession.ts | Role-scoped ticker dismiss */

import { deviceStateStorageKey, isDeviceStateKeyFamily } from "../../../shared/auth/deviceStateScope";

/** Becomes wm_ticker_dismiss_{role}_{userId} via deviceStateStorageKey. */
const BASE_KEY = "wm_ticker_dismiss";
const EVENT = "wm:home-ticker-all-clear-dismiss";
export const TICKER_DISMISS_HIDDEN_SUFFIX = "::hidden";

let cacheStorageKey = "";
let cacheRaw: string | null = "__init__";
let cacheFingerprint: string | null = null;

function storageKey(): string {
  return deviceStateStorageKey(BASE_KEY);
}

function hiddenToken(fingerprint: string): string {
  return `${fingerprint}${TICKER_DISMISS_HIDDEN_SUFFIX}`;
}

function readFingerprint(): string | null {
  const key = storageKey();
  if (key !== cacheStorageKey) {
    cacheStorageKey = key;
    cacheRaw = "__init__";
    cacheFingerprint = null;
  }
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(key);
  } catch {
    raw = null;
  }
  if (raw === cacheRaw) return cacheFingerprint;
  cacheRaw = raw;
  cacheFingerprint = raw && raw.length > 0 ? raw : null;
  return cacheFingerprint;
}

function writeFingerprint(next: string | null): void {
  const key = storageKey();
  cacheStorageKey = key;
  cacheFingerprint = next;
  cacheRaw = next;
  try {
    if (next) sessionStorage.setItem(key, next);
    else sessionStorage.removeItem(key);
  } catch {
    // Fail-silent
  }
  window.dispatchEvent(new Event(EVENT));
}

export function buildHomeTickerFingerprint(
  itemIds: readonly string[],
  extraPendingCount = 0,
  role: "employee" | "employer" | "" = "",
): string {
  return `${role}|${extraPendingCount}|${itemIds.join(",")}`;
}

export function isHomeTickerHidden(fingerprint: string): boolean {
  return readFingerprint() === hiddenToken(fingerprint);
}

export function isHomeTickerAllClearDismissed(fingerprint: string): boolean {
  const stored = readFingerprint();
  return stored === fingerprint || stored === hiddenToken(fingerprint);
}

export function isHomeTickerPendingAcked(fingerprint: string): boolean {
  return readFingerprint() === fingerprint;
}

export function dismissHomeTickerAllClear(fingerprint: string): void {
  writeFingerprint(fingerprint);
}

export function dismissHomeTicker(fingerprint: string, showingClear: boolean): void {
  if (showingClear || readFingerprint() === fingerprint) {
    writeFingerprint(hiddenToken(fingerprint));
    return;
  }
  writeFingerprint(fingerprint);
}

export function clearHomeTickerAllClearDismiss(): void {
  if (readFingerprint() === null) return;
  writeFingerprint(null);
}

export function getHomeTickerAllClearRevision(): string {
  return readFingerprint() ?? "";
}

export function isStaleTickerDismiss(stored: string, fingerprint: string): boolean {
  return (
    stored.length > 0 && stored !== fingerprint && stored !== hiddenToken(fingerprint)
  );
}

export function subscribeHomeTickerAllClear(onStoreChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || isDeviceStateKeyFamily(event.key, BASE_KEY)) onStoreChange();
  };
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}
