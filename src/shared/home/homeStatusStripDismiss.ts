/** Job Mitra | homeStatusStripDismiss.ts | Persist hidden home status strips */

import { deviceStateStorageKey, isDeviceStateKeyFamily } from "../auth/deviceStateScope";

const BASE_KEY = "wm_home_status_strip_dismissed_v1";
const EVENT = "wm:home-status-strip-dismissed";

type DismissedMap = Record<string, true>;

let cacheStorageKey = "";
let cacheRaw: string | null = "__init__";
let cache: DismissedMap = {};

function storageKey(): string {
  return deviceStateStorageKey(BASE_KEY);
}

function readMap(): DismissedMap {
  const key = storageKey();
  if (key !== cacheStorageKey) {
    cacheStorageKey = key;
    cacheRaw = "__init__";
    cache = {};
  }

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    raw = null;
  }
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  if (!raw) {
    cache = {};
    return cache;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      cache = {};
      return cache;
    }
    const next: DismissedMap = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (value === true) next[id] = true;
    }
    cache = next;
  } catch {
    cache = {};
  }
  return cache;
}

export function isHomeStatusStripDismissed(id: string): boolean {
  return Boolean(readMap()[id]);
}

export function getHomeStatusStripDismissRevision(): string {
  return `${storageKey()}|${Object.keys(readMap()).sort().join("|")}`;
}

export function dismissHomeStatusStrip(id: string): void {
  const next = { ...readMap(), [id]: true as const };
  cache = next;
  const raw = JSON.stringify(next);
  cacheRaw = raw;
  try {
    localStorage.setItem(storageKey(), raw);
  } catch {
    // Fail-silent
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeHomeStatusStripDismiss(onStoreChange: () => void): () => void {
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
