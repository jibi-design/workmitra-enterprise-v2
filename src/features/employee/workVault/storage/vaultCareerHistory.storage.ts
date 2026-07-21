// App name: Job Mitra
// File name: vaultCareerHistory.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\storage\vaultCareerHistory.storage.ts

import type { VaultStorageWriteResult } from "../helpers/vaultStorageUtils";

export const VAULT_CAREER_HISTORY_KEY = "wm_vault_career_history_v1";
export const VAULT_CAREER_HISTORY_CHANGED = "wm:vault-career-history-changed";

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

function readAll(): VaultCareerHistoryEntry[] {
  try {
    const raw = localStorage.getItem(VAULT_CAREER_HISTORY_KEY);
    if (!raw) return [];

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

function writeAllChecked(entries: VaultCareerHistoryEntry[]): VaultStorageWriteResult {
  try {
    localStorage.setItem(VAULT_CAREER_HISTORY_KEY, JSON.stringify(entries.slice(0, 200)));
    window.dispatchEvent(new Event(VAULT_CAREER_HISTORY_CHANGED));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

function writeAll(entries: VaultCareerHistoryEntry[]): void {
  writeAllChecked(entries);
  // Phase-0 localStorage-safe fallback for non-critical callers.
}

export function getVaultCareerHistory(): VaultCareerHistoryEntry[] {
  return readAll();
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
  const existing = readAll();
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
  writeAll([nextEntry, ...without]);
  return nextEntry;
}

export function updateVaultCareerHistoryRatings(
  careerPostId: string,
  ratings: { employeeRating?: number; employerRating?: number },
): VaultCareerHistoryEntry | null {
  const existing = readAll();
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
  writeAll(updated);
  return next;
}

export type FinalizeVaultCareerHistoryResult =
  { ok: true; entry: VaultCareerHistoryEntry | null } | { ok: false; reason: "storage_error" };

export function finalizeVaultCareerHistory(careerPostId: string): FinalizeVaultCareerHistoryResult {
  return applyVaultCareerFinalize(careerPostId, { requireRatings: true });
}

export function finalizeVaultCareerHistoryOnClosure(
  careerPostId: string,
): FinalizeVaultCareerHistoryResult {
  return applyVaultCareerFinalize(careerPostId, { requireRatings: false });
}

function applyVaultCareerFinalize(
  careerPostId: string,
  options: { requireRatings: boolean },
): FinalizeVaultCareerHistoryResult {
  const existing = readAll();
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
  const write = writeAllChecked(updated);
  if (!write.ok) return { ok: false, reason: "storage_error" };

  return { ok: true, entry: next };
}
