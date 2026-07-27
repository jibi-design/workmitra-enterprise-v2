/** Job Mitra | pulseEventBridge.qa.storage.ts | src/features/pulse/pulseEventBridge.qa.storage.ts */

import { isRecord, readString } from "./pulseEventBridge.utils";

export function readJsonArrayFromStorage(key: string): readonly unknown[] {
  try {
    if (typeof window === "undefined") return [];

    const raw = window.localStorage.getItem(key);

    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeJsonArrayToStorage(key: string, items: readonly unknown[]): boolean {
  try {
    if (typeof window === "undefined") return false;

    window.localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function readRecordId(value: unknown): string | null {
  if (!isRecord(value)) return null;

  return readString(value.id) ?? null;
}

export function upsertStorageRecord(
  key: string,
  record: Readonly<Record<string, unknown>>,
): boolean {
  const existingItems = readJsonArrayFromStorage(key);
  const recordId = readRecordId(record);

  if (!recordId) return false;

  let didReplace = false;
  const nextItems = existingItems.map((item) => {
    if (readRecordId(item) !== recordId) {
      return item;
    }

    didReplace = true;
    return record;
  });

  return writeJsonArrayToStorage(key, didReplace ? nextItems : [record, ...nextItems]);
}

export function dispatchBrowserEvent(eventName: string): void {
  try {
    if (typeof window === "undefined") return;

    window.dispatchEvent(new Event(eventName));
  } catch {
    // Best-effort local QA notification only.
  }
}
