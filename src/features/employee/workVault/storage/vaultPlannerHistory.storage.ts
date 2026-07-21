/**
 * Job Mitra | vaultPlannerHistory.storage.ts
 * Hybrid A2 P1.4 — wm_vault_planner_history_v1
 *
 * Idempotency key: (planId, employeeMlId, epochIndex)
 * vaultFinalized stays false for active milestone summaries until offboarding / inactivity.
 */

import type { VaultStorageWriteResult } from "../helpers/vaultStorageUtils";

export const VAULT_PLANNER_HISTORY_KEY = "wm_vault_planner_history_v1";
export const VAULT_PLANNER_HISTORY_CHANGED = "wm:vault-planner-history-changed";

export type VaultPlannerExitType = "offboard" | "inactivity" | "plan_cancelled";

export type VaultPlannerHistoryEntry = {
  id: string;
  planId: string;
  assignmentId: string;
  employeeMlId: string;
  employeeName: string;
  /** Legal corporate entity Mitra Labs ID — reputation subject (not site manager). */
  employerMlId: string;
  companyName: string;
  planName: string;
  epochIndex: number;
  epochStart: number;
  epochEnd: number;
  daysScheduled: number;
  daysCompleted: number;
  /** 0–100 */
  attendanceRate: number;
  /** 0–100 */
  reliabilityScore: number;
  employeeRating?: number;
  employerRating?: number;
  /** Telemetry only — never public reputation subject. */
  siteManagerId?: string;
  siteId?: string;
  vaultFinalized: boolean;
  finalizedAt?: number;
  exitType?: VaultPlannerExitType;
  /** Epoch commit / upsert timestamp. */
  completedAt: number;
};

type Rec = Record<string, unknown>;

function isRec(value: unknown): value is Rec {
  return typeof value === "object" && value !== null;
}

function str(record: Rec, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function num(record: Rec, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function bool(record: Rec, key: string): boolean {
  return record[key] === true;
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function makeId(): string {
  return `vph_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function normalizeExitType(value: unknown): VaultPlannerExitType | undefined {
  if (value === "offboard" || value === "inactivity" || value === "plan_cancelled") {
    return value;
  }
  return undefined;
}

function normalizeEntry(raw: unknown): VaultPlannerHistoryEntry | null {
  if (!isRec(raw)) return null;

  const planId = str(raw, "planId");
  const assignmentId = str(raw, "assignmentId");
  const employeeMlId =
    str(raw, "employeeMlId") ?? str(raw, "employeeWmId") ?? str(raw, "workerMlId");
  const employeeName = str(raw, "employeeName") ?? str(raw, "workerName");
  const employerMlId = str(raw, "employerMlId") ?? str(raw, "legalEntityMlId") ?? "";
  const companyName = str(raw, "companyName");
  const planName = str(raw, "planName") ?? str(raw, "jobTitle");
  const epochIndex = num(raw, "epochIndex");
  const epochStart = num(raw, "epochStart");
  const epochEnd = num(raw, "epochEnd");
  const completedAt = num(raw, "completedAt");

  if (
    !planId ||
    !assignmentId ||
    !employeeMlId ||
    !employeeName ||
    !companyName ||
    !planName ||
    epochIndex === undefined ||
    epochStart === undefined ||
    epochEnd === undefined ||
    completedAt === undefined
  ) {
    return null;
  }

  const employeeRating = num(raw, "employeeRating");
  const employerRating = num(raw, "employerRating");

  return {
    id: str(raw, "id") ?? makeId(),
    planId,
    assignmentId,
    employeeMlId,
    employeeName,
    employerMlId,
    companyName,
    planName,
    epochIndex: Math.max(0, Math.floor(epochIndex)),
    epochStart,
    epochEnd,
    daysScheduled: Math.max(0, Math.floor(num(raw, "daysScheduled") ?? 0)),
    daysCompleted: Math.max(0, Math.floor(num(raw, "daysCompleted") ?? 0)),
    attendanceRate: clampPct(num(raw, "attendanceRate") ?? 0),
    reliabilityScore: clampPct(num(raw, "reliabilityScore") ?? 0),
    employeeRating:
      employeeRating && employeeRating >= 1 && employeeRating <= 5 ? employeeRating : undefined,
    employerRating:
      employerRating && employerRating >= 1 && employerRating <= 5 ? employerRating : undefined,
    siteManagerId: str(raw, "siteManagerId"),
    siteId: str(raw, "siteId"),
    vaultFinalized: bool(raw, "vaultFinalized"),
    finalizedAt: num(raw, "finalizedAt"),
    exitType: normalizeExitType(raw["exitType"]),
    completedAt,
  };
}

function readAll(): VaultPlannerHistoryEntry[] {
  try {
    const raw = localStorage.getItem(VAULT_PLANNER_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeEntry)
      .filter((entry): entry is VaultPlannerHistoryEntry => entry !== null)
      .sort((a, b) => b.completedAt - a.completedAt);
  } catch {
    return [];
  }
}

function writeAllChecked(entries: VaultPlannerHistoryEntry[]): VaultStorageWriteResult {
  try {
    localStorage.setItem(VAULT_PLANNER_HISTORY_KEY, JSON.stringify(entries.slice(0, 400)));
    window.dispatchEvent(new Event(VAULT_PLANNER_HISTORY_CHANGED));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

export function plannerVaultEpochKey(
  planId: string,
  employeeMlId: string,
  epochIndex: number,
): string {
  return `${planId.trim()}::${employeeMlId.trim().toUpperCase()}::${epochIndex}`;
}

function findEpochIndex(
  entries: VaultPlannerHistoryEntry[],
  planId: string,
  employeeMlId: string,
  epochIndex: number,
): number {
  const key = plannerVaultEpochKey(planId, employeeMlId, epochIndex);
  return entries.findIndex(
    (entry) => plannerVaultEpochKey(entry.planId, entry.employeeMlId, entry.epochIndex) === key,
  );
}

export function getVaultPlannerHistory(): VaultPlannerHistoryEntry[] {
  return readAll();
}

export function getVaultPlannerHistoryForWorker(employeeMlId: string): VaultPlannerHistoryEntry[] {
  const normalized = employeeMlId.trim().toUpperCase();
  if (!normalized) return [];
  return readAll().filter((entry) => entry.employeeMlId.trim().toUpperCase() === normalized);
}

export type UpsertPlannerEpochInput = {
  planId: string;
  assignmentId: string;
  employeeMlId: string;
  employeeName: string;
  employerMlId: string;
  companyName: string;
  planName: string;
  epochIndex: number;
  epochStart: number;
  epochEnd: number;
  daysScheduled: number;
  daysCompleted: number;
  attendanceRate: number;
  reliabilityScore: number;
  siteManagerId?: string;
  siteId?: string;
  completedAt?: number;
};

export function upsertVaultPlannerEpoch(
  input: UpsertPlannerEpochInput,
): VaultPlannerHistoryEntry | null {
  const employeeMlId = input.employeeMlId.trim();
  const planId = input.planId.trim();
  if (!employeeMlId || !planId) return null;

  const existing = readAll();
  const index = findEpochIndex(existing, planId, employeeMlId, input.epochIndex);
  const prior = index >= 0 ? existing[index] : undefined;
  const now = input.completedAt ?? Date.now();

  const nextEntry: VaultPlannerHistoryEntry = {
    id: prior?.id ?? makeId(),
    planId,
    assignmentId: input.assignmentId.trim() || prior?.assignmentId || `${planId}_${employeeMlId}`,
    employeeMlId,
    employeeName: input.employeeName.trim() || prior?.employeeName || "Worker",
    employerMlId: input.employerMlId.trim() || prior?.employerMlId || "",
    companyName: input.companyName.trim() || prior?.companyName || "Employer",
    planName: input.planName.trim() || prior?.planName || "Project Plan",
    epochIndex: Math.max(0, Math.floor(input.epochIndex)),
    epochStart: input.epochStart,
    epochEnd: input.epochEnd,
    daysScheduled: Math.max(0, Math.floor(input.daysScheduled)),
    daysCompleted: Math.max(0, Math.floor(input.daysCompleted)),
    attendanceRate: clampPct(input.attendanceRate),
    reliabilityScore: clampPct(input.reliabilityScore),
    employeeRating: prior?.employeeRating,
    employerRating: prior?.employerRating,
    siteManagerId: input.siteManagerId?.trim() || prior?.siteManagerId,
    siteId: input.siteId?.trim() || prior?.siteId,
    vaultFinalized: prior?.vaultFinalized ?? false,
    finalizedAt: prior?.finalizedAt,
    exitType: prior?.exitType,
    completedAt: now,
  };

  const without =
    index >= 0
      ? existing.filter((_, i) => i !== index)
      : existing.filter((entry) => entry.id !== nextEntry.id);
  const write = writeAllChecked([nextEntry, ...without]);
  if (!write.ok) return null;
  return nextEntry;
}

export function updateVaultPlannerHistoryRatings(
  planId: string,
  employeeMlId: string,
  epochIndex: number,
  ratings: { employeeRating?: number; employerRating?: number },
): VaultPlannerHistoryEntry | null {
  const existing = readAll();
  const index = findEpochIndex(existing, planId, employeeMlId, epochIndex);
  if (index < 0) return null;

  const current = existing[index]!;
  const next: VaultPlannerHistoryEntry = {
    ...current,
    employeeRating: ratings.employeeRating ?? current.employeeRating,
    employerRating: ratings.employerRating ?? current.employerRating,
  };

  const updated = [...existing];
  updated[index] = next;
  const write = writeAllChecked(updated);
  if (!write.ok) return null;
  return next;
}

export type FinalizeVaultPlannerResult =
  { ok: true; entry: VaultPlannerHistoryEntry | null } | { ok: false; reason: "storage_error" };

/** Finalize a single epoch when at least one entity-level rating exists (S6 will supply ratings). */
export function finalizeVaultPlannerEpoch(
  planId: string,
  employeeMlId: string,
  epochIndex: number,
): FinalizeVaultPlannerResult {
  const existing = readAll();
  const index = findEpochIndex(existing, planId, employeeMlId, epochIndex);
  if (index < 0) return { ok: true, entry: null };

  const current = existing[index]!;
  const hasEmployee = typeof current.employeeRating === "number" && current.employeeRating > 0;
  const hasEmployer = typeof current.employerRating === "number" && current.employerRating > 0;
  if (!hasEmployee && !hasEmployer) {
    return { ok: true, entry: current };
  }
  if (current.vaultFinalized) return { ok: true, entry: current };

  const next: VaultPlannerHistoryEntry = {
    ...current,
    vaultFinalized: true,
    finalizedAt: current.finalizedAt ?? Date.now(),
  };
  const updated = [...existing];
  updated[index] = next;
  const write = writeAllChecked(updated);
  if (!write.ok) return { ok: false, reason: "storage_error" };
  return { ok: true, entry: next };
}

/**
 * Offboarding / inactivity / plan cancel — finalize all epochs for the assignment.
 * Does not require ratings (mirrors Career finalizeOnClosure).
 */
export function finalizeVaultPlannerOnClosure(
  planId: string,
  employeeMlId: string,
  exitType: VaultPlannerExitType,
): FinalizeVaultPlannerResult {
  const existing = readAll();
  const normalizedPlan = planId.trim();
  const normalizedWorker = employeeMlId.trim().toUpperCase();
  if (!normalizedPlan || !normalizedWorker) return { ok: true, entry: null };

  const now = Date.now();
  let changed = false;
  let last: VaultPlannerHistoryEntry | null = null;

  const updated = existing.map((entry) => {
    if (
      entry.planId !== normalizedPlan ||
      entry.employeeMlId.trim().toUpperCase() !== normalizedWorker
    ) {
      return entry;
    }
    if (entry.vaultFinalized && entry.exitType) {
      last = entry;
      return entry;
    }
    changed = true;
    last = {
      ...entry,
      vaultFinalized: true,
      finalizedAt: entry.finalizedAt ?? now,
      exitType,
    };
    return last;
  });

  if (!changed) return { ok: true, entry: last };
  const write = writeAllChecked(updated);
  if (!write.ok) return { ok: false, reason: "storage_error" };
  return { ok: true, entry: last };
}
