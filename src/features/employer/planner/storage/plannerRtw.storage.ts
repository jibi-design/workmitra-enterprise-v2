/**
 * Job Mitra | plannerRtw.storage.ts
 * Hybrid A2 Phase-2 P2.5 — lightweight Visa / Right-to-Work expiry tracker.
 *
 * Planner-scoped only. Not NMC / clinical registration.
 */

import { plannerReadJson, plannerWriteJson, plannerDispatchChanged } from "./plannerSafeStorage";

export const PLANNER_RTW_STORAGE_KEY = "wm_planner_rtw_tracker_v1";
export const PLANNER_RTW_CHANGED = "wm:planner-rtw-changed";

export const DEFAULT_PLANNER_RTW_WARN_DAYS = 30;

export type PlannerRtwDocumentKind = "visa" | "right_to_work" | "other";

export type PlannerRtwRecord = {
  workerMlId: string;
  workerName?: string;
  /** ISO date YYYY-MM-DD */
  expiresOn: string;
  documentKind: PlannerRtwDocumentKind;
  note?: string;
  updatedAt: number;
};

export type PlannerRtwStore = {
  warnDaysBefore: number;
  records: PlannerRtwRecord[];
};

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeKind(value: unknown): PlannerRtwDocumentKind {
  if (value === "visa" || value === "right_to_work" || value === "other") return value;
  return "right_to_work";
}

function normalizeRecord(raw: unknown): PlannerRtwRecord | null {
  if (typeof raw !== "object" || raw === null) return null;
  const rec = raw as Record<string, unknown>;
  const workerMlId = typeof rec.workerMlId === "string" ? rec.workerMlId.trim().toUpperCase() : "";
  const expiresOn = typeof rec.expiresOn === "string" ? rec.expiresOn.trim() : "";
  if (!workerMlId || !isIsoDate(expiresOn)) return null;
  return {
    workerMlId,
    workerName: typeof rec.workerName === "string" ? rec.workerName.trim() : undefined,
    expiresOn,
    documentKind: normalizeKind(rec.documentKind),
    note: typeof rec.note === "string" ? rec.note.trim().slice(0, 200) : undefined,
    updatedAt: typeof rec.updatedAt === "number" ? rec.updatedAt : Date.now(),
  };
}

function readStore(): PlannerRtwStore {
  const raw = plannerReadJson<unknown>(PLANNER_RTW_STORAGE_KEY, null);
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { warnDaysBefore: DEFAULT_PLANNER_RTW_WARN_DAYS, records: [] };
  }
  const obj = raw as Record<string, unknown>;
  const warn =
    typeof obj.warnDaysBefore === "number" && obj.warnDaysBefore >= 1 && obj.warnDaysBefore <= 365
      ? Math.floor(obj.warnDaysBefore)
      : DEFAULT_PLANNER_RTW_WARN_DAYS;
  const records = Array.isArray(obj.records)
    ? obj.records.map(normalizeRecord).filter((r): r is PlannerRtwRecord => Boolean(r))
    : [];
  return { warnDaysBefore: warn, records };
}

function writeStore(store: PlannerRtwStore): void {
  plannerWriteJson(PLANNER_RTW_STORAGE_KEY, {
    warnDaysBefore: store.warnDaysBefore,
    records: store.records.slice(0, 500),
  });
  plannerDispatchChanged(PLANNER_RTW_CHANGED);
}

export function getPlannerRtwWarnDays(): number {
  return readStore().warnDaysBefore;
}

export function setPlannerRtwWarnDays(days: number): number {
  const next = Math.min(365, Math.max(1, Math.floor(days)));
  const store = readStore();
  store.warnDaysBefore = next;
  writeStore(store);
  return next;
}

export function listPlannerRtwRecords(): PlannerRtwRecord[] {
  return [...readStore().records].sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));
}

export function getPlannerRtwRecord(workerMlId: string): PlannerRtwRecord | null {
  const id = workerMlId.trim().toUpperCase();
  if (!id) return null;
  return readStore().records.find((r) => r.workerMlId === id) ?? null;
}

export function upsertPlannerRtwRecord(input: {
  workerMlId: string;
  workerName?: string;
  expiresOn: string;
  documentKind?: PlannerRtwDocumentKind;
  note?: string;
}): PlannerRtwRecord | null {
  const workerMlId = input.workerMlId.trim().toUpperCase();
  const expiresOn = input.expiresOn.trim();
  if (!workerMlId || !isIsoDate(expiresOn)) return null;

  const store = readStore();
  const next: PlannerRtwRecord = {
    workerMlId,
    workerName: input.workerName?.trim() || undefined,
    expiresOn,
    documentKind: input.documentKind ?? "right_to_work",
    note: input.note?.trim().slice(0, 200) || undefined,
    updatedAt: Date.now(),
  };
  const idx = store.records.findIndex((r) => r.workerMlId === workerMlId);
  if (idx >= 0) store.records[idx] = { ...store.records[idx], ...next };
  else store.records.push(next);
  writeStore(store);
  return next;
}

export function removePlannerRtwRecord(workerMlId: string): boolean {
  const id = workerMlId.trim().toUpperCase();
  if (!id) return false;
  const store = readStore();
  const before = store.records.length;
  store.records = store.records.filter((r) => r.workerMlId !== id);
  if (store.records.length === before) return false;
  writeStore(store);
  return true;
}

/** Test helper */
export function __clearPlannerRtwForTests(): void {
  writeStore({ warnDaysBefore: DEFAULT_PLANNER_RTW_WARN_DAYS, records: [] });
}
