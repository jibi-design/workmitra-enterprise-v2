// App name: Job Mitra
// File name: vaultCareerHistory.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\storage\vaultCareerHistory.storage.ts
//
// C-HIST-1: per-worker FIFO (200). Key: wm_employee_{id}_vault_career_history_v1
// Legacy global wm_vault_career_history_v1 partitions once by employeeMlId.

import {
  getCurrentVaultWorkerScopeId,
  sanitizeVaultWorkerScopeId,
} from "../../../shared/workVault/vaultWorkerScope";
import type { VaultStorageWriteResult } from "../helpers/vaultStorageUtils";

export const VAULT_CAREER_HISTORY_KEY = "wm_vault_career_history_v1";
export const VAULT_CAREER_HISTORY_CHANGED = "wm:vault-career-history-changed";

const PARTITION_FLAG = "wm_vault_career_history_v1__partitioned_v1";
const MAX_PER_WORKER = 200;

export type VaultCareerHistoryEntry = {
  id: string;
  careerPostId: string;
  employmentId: string;
  employeeMlId: string;
  employeeName: string;
  companyName: string;
  jobTitle: string;
  joinedAt?: number;
  completedAt: number;
  exitType: "resigned" | "terminated" | "force_completed";
  employeeRating?: number;
  employerRating?: number;
  vaultFinalized: boolean;
  finalizedAt?: number;
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

function makeId(): string {
  return `vch_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function scopedHistoryKey(workerScopeId: string): string {
  return `wm_employee_${sanitizeVaultWorkerScopeId(workerScopeId)}_vault_career_history_v1`;
}

function normalizeExitType(value: unknown): VaultCareerHistoryEntry["exitType"] | null {
  if (value === "resigned" || value === "terminated" || value === "force_completed") {
    return value;
  }

  return null;
}

function normalizeEntry(raw: unknown): VaultCareerHistoryEntry | null {
  if (!isRec(raw)) return null;

  const careerPostId = str(raw, "careerPostId");
  const employmentId = str(raw, "employmentId");
  // Dual-read: prefer employeeMlId; accept legacy employeeWmId from older localStorage JSON.
  const employeeMlId = str(raw, "employeeMlId") ?? str(raw, "employeeWmId");
  const employeeName = str(raw, "employeeName");
  const companyName = str(raw, "companyName");
  const jobTitle = str(raw, "jobTitle");
  const completedAt = num(raw, "completedAt");
  const exitType = normalizeExitType(raw["exitType"]);

  if (
    !careerPostId ||
    !employmentId ||
    !employeeMlId ||
    !employeeName ||
    !companyName ||
    !jobTitle ||
    completedAt === undefined ||
    !exitType
  ) {
    return null;
  }

  const employeeRating = num(raw, "employeeRating");
  const employerRating = num(raw, "employerRating");

  return {
    id: str(raw, "id") ?? makeId(),
    careerPostId,
    employmentId,
    employeeMlId,
    employeeName,
    companyName,
    jobTitle,
    joinedAt: num(raw, "joinedAt"),
    completedAt,
    exitType,
    employeeRating:
      employeeRating && employeeRating >= 1 && employeeRating <= 5 ? employeeRating : undefined,
    employerRating:
      employerRating && employerRating >= 1 && employerRating <= 5 ? employerRating : undefined,
    vaultFinalized: bool(raw, "vaultFinalized"),
    finalizedAt: num(raw, "finalizedAt"),
  };
}

function parseEntries(raw: string | null): VaultCareerHistoryEntry[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeEntry)
      .filter((entry): entry is VaultCareerHistoryEntry => entry !== null)
      .sort((a, b) => b.completedAt - a.completedAt);
  } catch {
    return [];
  }
}

/** One-shot: split legacy global FIFO into per-worker buckets. */
function partitionLegacyGlobalOnce(): void {
  if (typeof localStorage === "undefined") return;

  try {
    if (localStorage.getItem(PARTITION_FLAG) === "1") return;

    const legacyEntries = parseEntries(localStorage.getItem(VAULT_CAREER_HISTORY_KEY));
    if (legacyEntries.length === 0) {
      localStorage.setItem(PARTITION_FLAG, "1");
      return;
    }

    const byWorker = new Map<string, VaultCareerHistoryEntry[]>();
    for (const entry of legacyEntries) {
      const key = sanitizeVaultWorkerScopeId(entry.employeeMlId);
      const list = byWorker.get(key) ?? [];
      list.push(entry);
      byWorker.set(key, list);
    }

    for (const [workerId, entries] of byWorker) {
      const scoped = scopedHistoryKey(workerId);
      const existing = parseEntries(localStorage.getItem(scoped));
      const byPost = new Map<string, VaultCareerHistoryEntry>();
      for (const entry of existing) byPost.set(entry.careerPostId, entry);
      for (const entry of entries) {
        const prior = byPost.get(entry.careerPostId);
        if (!prior || entry.completedAt >= prior.completedAt) {
          byPost.set(entry.careerPostId, entry);
        }
      }
      const merged = Array.from(byPost.values()).sort((a, b) => b.completedAt - a.completedAt);
      localStorage.setItem(scoped, JSON.stringify(merged.slice(0, MAX_PER_WORKER)));
    }

    localStorage.setItem(PARTITION_FLAG, "1");
  } catch {
    /* demo-safe */
  }
}

function resolveWorkerId(workerScopeId?: string): string {
  partitionLegacyGlobalOnce();
  if (workerScopeId?.trim()) return sanitizeVaultWorkerScopeId(workerScopeId);
  return getCurrentVaultWorkerScopeId();
}

function readAll(workerScopeId?: string): VaultCareerHistoryEntry[] {
  try {
    const workerId = resolveWorkerId(workerScopeId);
    return parseEntries(localStorage.getItem(scopedHistoryKey(workerId)));
  } catch {
    return [];
  }
}

function writeAllChecked(
  entries: VaultCareerHistoryEntry[],
  workerScopeId: string,
): VaultStorageWriteResult {
  try {
    const workerId = sanitizeVaultWorkerScopeId(workerScopeId);
    localStorage.setItem(
      scopedHistoryKey(workerId),
      JSON.stringify(entries.slice(0, MAX_PER_WORKER)),
    );
    window.dispatchEvent(new Event(VAULT_CAREER_HISTORY_CHANGED));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

function writeAll(entries: VaultCareerHistoryEntry[], workerScopeId: string): void {
  writeAllChecked(entries, workerScopeId);
}

/** Current worker bucket (or explicit worker id). */
export function getVaultCareerHistory(workerScopeId?: string): VaultCareerHistoryEntry[] {
  return readAll(workerScopeId);
}

export function upsertVaultCareerHistoryOnClosure(input: {
  careerPostId: string;
  employmentId: string;
  employeeMlId: string;
  employeeName: string;
  companyName: string;
  jobTitle: string;
  joinedAt?: number;
  completedAt: number;
  exitType: VaultCareerHistoryEntry["exitType"];
}): VaultCareerHistoryEntry {
  const workerId = resolveWorkerId(input.employeeMlId);
  const existing = readAll(workerId);
  const prior = existing.find((entry) => entry.careerPostId === input.careerPostId);

  const nextEntry: VaultCareerHistoryEntry = {
    id: prior?.id ?? makeId(),
    careerPostId: input.careerPostId,
    employmentId: input.employmentId,
    employeeMlId: input.employeeMlId,
    employeeName: input.employeeName,
    companyName: input.companyName,
    jobTitle: input.jobTitle,
    joinedAt: input.joinedAt ?? prior?.joinedAt,
    completedAt: input.completedAt,
    exitType: input.exitType,
    employeeRating: prior?.employeeRating,
    employerRating: prior?.employerRating,
    vaultFinalized: prior?.vaultFinalized ?? false,
    finalizedAt: prior?.finalizedAt,
  };

  const without = existing.filter((entry) => entry.careerPostId !== input.careerPostId);
  writeAll([nextEntry, ...without], workerId);
  return nextEntry;
}

export function updateVaultCareerHistoryRatings(
  careerPostId: string,
  ratings: { employeeRating?: number; employerRating?: number },
  employeeMlId?: string,
): VaultCareerHistoryEntry | null {
  const workerId = resolveWorkerId(employeeMlId);
  const existing = readAll(workerId);
  const index = existing.findIndex((entry) => entry.careerPostId === careerPostId);
  if (index < 0) return null;

  const current = existing[index];
  const next: VaultCareerHistoryEntry = {
    ...current,
    employeeRating: ratings.employeeRating ?? current.employeeRating,
    employerRating: ratings.employerRating ?? current.employerRating,
  };

  const updated = [...existing];
  updated[index] = next;
  writeAll(updated, workerId);
  return next;
}

export type FinalizeVaultCareerHistoryResult =
  { ok: true; entry: VaultCareerHistoryEntry | null } | { ok: false; reason: "storage_error" };

export function finalizeVaultCareerHistory(
  careerPostId: string,
  employeeMlId?: string,
): FinalizeVaultCareerHistoryResult {
  return applyVaultCareerFinalize(careerPostId, { requireRatings: true, employeeMlId });
}

export function finalizeVaultCareerHistoryOnClosure(
  careerPostId: string,
  employeeMlId?: string,
): FinalizeVaultCareerHistoryResult {
  return applyVaultCareerFinalize(careerPostId, { requireRatings: false, employeeMlId });
}

function applyVaultCareerFinalize(
  careerPostId: string,
  options: { requireRatings: boolean; employeeMlId?: string },
): FinalizeVaultCareerHistoryResult {
  const workerId = resolveWorkerId(options.employeeMlId);
  const existing = readAll(workerId);
  const index = existing.findIndex((entry) => entry.careerPostId === careerPostId);
  if (index < 0) return { ok: true, entry: null };

  const current = existing[index];
  const hasEmployeeRating =
    typeof current.employeeRating === "number" && current.employeeRating > 0;
  const hasEmployerRating =
    typeof current.employerRating === "number" && current.employerRating > 0;

  if (options.requireRatings && !hasEmployeeRating && !hasEmployerRating) {
    return { ok: true, entry: current };
  }

  if (current.vaultFinalized) {
    return { ok: true, entry: current };
  }

  const now = Date.now();
  const next: VaultCareerHistoryEntry = {
    ...current,
    vaultFinalized: true,
    finalizedAt: current.finalizedAt ?? now,
  };

  const updated = [...existing];
  updated[index] = next;
  const write = writeAllChecked(updated, workerId);
  if (!write.ok) return { ok: false, reason: "storage_error" };

  return { ok: true, entry: next };
}
