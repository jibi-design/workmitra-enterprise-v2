// App name: Job Mitra
// File name: shiftWorkspace.utils.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftWorkspace.utils.ts

import type { UnknownRecord } from "../types/shiftWorkspace.types";
import { scopeAppLocalId } from "../../../../shared/identity/constants/idConstants";

export type JsonStorageWriteResult =
  { readonly ok: true } | { readonly ok: false; readonly reason: "storage_error" };

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export function getString(record: UnknownRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

export function getNumber(record: UnknownRecord, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function safeSetJson(key: string, value: unknown): JsonStorageWriteResult {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

export function safeDispatch(eventName: string): void {
  try {
    window.dispatchEvent(new Event(eventName));
  } catch {
    // Ignore non-browser/test runtime dispatch failures.
  }
}

export function createLocalId(prefix: string): string {
  const scoped = scopeAppLocalId(prefix);
  return `${scoped}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function clampText(raw: string, max: number): string {
  const text = raw.trim();
  if (!text) return "";
  return text.length > max ? text.slice(0, max) : text;
}
