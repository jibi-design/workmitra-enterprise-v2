// App name: Job Mitra
// File name: vaultShiftHistory.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\storage\vaultShiftHistory.storage.ts

export const VAULT_SHIFT_HISTORY_KEY = "wm_vault_shift_history_v1";
export const VAULT_SHIFT_HISTORY_CHANGED = "wm:vault-shift-history-changed";
/** Fired when oldest entries are dropped to enforce the 200-cap (P1-7). */
export const VAULT_SHIFT_HISTORY_TRIMMED = "wm:vault-shift-history-trimmed";
export const VAULT_SHIFT_HISTORY_MAX = 200;
/** Wave-3: Phase-0 SoT remains localStorage FIFO-200; unbounded history needs Phase-1 DB/IDB. */

export type VaultShiftHistoryEntry = {
  id: string;
  workspaceId: string;
  postId: string;
  workerMlId: string;
  workerName: string;
  companyName: string;
  jobTitle: string;
  startAt: number;
  endAt: number;
  completedAt: number;
  workerRating?: number;
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
  return `vsh_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function normalizeEntry(raw: unknown): VaultShiftHistoryEntry | null {
  if (!isRec(raw)) return null;

  const workspaceId = str(raw, "workspaceId");
  const postId = str(raw, "postId");
  // Dual-read: prefer workerMlId; accept legacy workerWmId from older localStorage JSON.
  const workerMlId = str(raw, "workerMlId") ?? str(raw, "workerWmId");
  const workerName = str(raw, "workerName");
  const companyName = str(raw, "companyName");
  const jobTitle = str(raw, "jobTitle");
  const startAt = num(raw, "startAt");
  const endAt = num(raw, "endAt");
  const completedAt = num(raw, "completedAt");

  if (
    !workspaceId ||
    !postId ||
    !workerMlId ||
    !workerName ||
    !companyName ||
    !jobTitle ||
    startAt === undefined ||
    endAt === undefined ||
    completedAt === undefined
  ) {
    return null;
  }

  const workerRating = num(raw, "workerRating");
  const employerRating = num(raw, "employerRating");

  return {
    id: str(raw, "id") ?? makeId(),
    workspaceId,
    postId,
    workerMlId,
    workerName,
    companyName,
    jobTitle,
    startAt,
    endAt,
    completedAt,
    workerRating: workerRating && workerRating >= 1 && workerRating <= 5 ? workerRating : undefined,
    employerRating:
      employerRating && employerRating >= 1 && employerRating <= 5 ? employerRating : undefined,
    vaultFinalized: bool(raw, "vaultFinalized"),
    finalizedAt: num(raw, "finalizedAt"),
  };
}

function readAll(): VaultShiftHistoryEntry[] {
  try {
    const raw = localStorage.getItem(VAULT_SHIFT_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeEntry)
      .filter((entry): entry is VaultShiftHistoryEntry => entry !== null)
      .sort((a, b) => b.completedAt - a.completedAt);
  } catch {
    return [];
  }
}

export type VaultStorageWriteResult =
  { ok: true; trimmedOldest: number } | { ok: false; reason: "storage_error" };

function writeAllChecked(entries: VaultShiftHistoryEntry[]): VaultStorageWriteResult {
  try {
    const trimmedOldest = Math.max(0, entries.length - VAULT_SHIFT_HISTORY_MAX);
    const capped = entries.slice(0, VAULT_SHIFT_HISTORY_MAX);
    localStorage.setItem(VAULT_SHIFT_HISTORY_KEY, JSON.stringify(capped));
    window.dispatchEvent(new Event(VAULT_SHIFT_HISTORY_CHANGED));
    if (trimmedOldest > 0) {
      window.dispatchEvent(
        new CustomEvent(VAULT_SHIFT_HISTORY_TRIMMED, {
          detail: { trimmedOldest, max: VAULT_SHIFT_HISTORY_MAX },
        }),
      );
    }
    return { ok: true, trimmedOldest };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

export function getVaultShiftHistory(): VaultShiftHistoryEntry[] {
  return readAll();
}

export function getVaultShiftHistoryForWorker(workerMlId: string): VaultShiftHistoryEntry[] {
  const normalized = workerMlId.trim().toUpperCase();
  if (!normalized) return [];

  return readAll().filter((entry) => entry.workerMlId.trim().toUpperCase() === normalized);
}

export type VaultShiftHistoryUpsertResult = {
  entry: VaultShiftHistoryEntry;
  trimmedOldest: number;
};

export function upsertVaultShiftHistoryOnComplete(input: {
  workspaceId: string;
  postId: string;
  workerMlId: string;
  workerName: string;
  companyName: string;
  jobTitle: string;
  startAt: number;
  endAt: number;
  completedAt: number;
}): VaultShiftHistoryUpsertResult | null {
  const existing = readAll();
  const prior = existing.find((entry) => entry.workspaceId === input.workspaceId);
  const now = input.completedAt;

  const nextEntry: VaultShiftHistoryEntry = {
    id: prior?.id ?? makeId(),
    workspaceId: input.workspaceId,
    postId: input.postId,
    workerMlId: input.workerMlId,
    workerName: input.workerName,
    companyName: input.companyName,
    jobTitle: input.jobTitle,
    startAt: input.startAt,
    endAt: input.endAt,
    completedAt: now,
    workerRating: prior?.workerRating,
    employerRating: prior?.employerRating,
    vaultFinalized: prior?.vaultFinalized ?? false,
    finalizedAt: prior?.finalizedAt,
  };

  // Re-read under fresh list so concurrent upserts merge by workspaceId (P1-7).
  const live = readAll();
  const without = live.filter((entry) => entry.workspaceId !== input.workspaceId);
  const write = writeAllChecked([nextEntry, ...without]);
  if (!write.ok) return null;

  return { entry: nextEntry, trimmedOldest: write.trimmedOldest };
}

export function updateVaultShiftHistoryRatings(
  workspaceId: string,
  ratings: { workerRating?: number; employerRating?: number },
): VaultShiftHistoryEntry | null {
  const existing = readAll();
  const index = existing.findIndex((entry) => entry.workspaceId === workspaceId);
  if (index < 0) return null;

  const current = existing[index];
  const next: VaultShiftHistoryEntry = {
    ...current,
    workerRating: ratings.workerRating ?? current.workerRating,
    employerRating: ratings.employerRating ?? current.employerRating,
  };

  const updated = [...existing];
  updated[index] = next;
  const write = writeAllChecked(updated);
  if (!write.ok) return null;

  return next;
}

export type FinalizeVaultShiftHistoryResult =
  { ok: true; entry: VaultShiftHistoryEntry | null } | { ok: false; reason: "storage_error" };

export function finalizeVaultShiftHistory(workspaceId: string): FinalizeVaultShiftHistoryResult {
  const existing = readAll();
  const index = existing.findIndex((entry) => entry.workspaceId === workspaceId);
  if (index < 0) return { ok: true, entry: null };

  const current = existing[index];
  const hasWorkerRating = typeof current.workerRating === "number" && current.workerRating > 0;
  const hasEmployerRating =
    typeof current.employerRating === "number" && current.employerRating > 0;

  if (!hasWorkerRating && !hasEmployerRating) {
    return { ok: true, entry: current };
  }

  const now = Date.now();
  const next: VaultShiftHistoryEntry = {
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
