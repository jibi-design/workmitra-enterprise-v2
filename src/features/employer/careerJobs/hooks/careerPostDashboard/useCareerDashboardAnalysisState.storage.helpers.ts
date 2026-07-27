// App name: Job Mitra
// useCareerDashboardAnalysisState.storage.helpers.ts

export type StoredAnalysisState = {
  analysisOpen: boolean;
  analysisDone: boolean;
  shortlistTarget: number;
  backupTarget: number;
  selectedShortlistIds: string[];
};

const ANALYSIS_STATE_KEY_PREFIX = "jm_employer_career_analysis_state_";
const ANALYSIS_LOCK_KEY_PREFIX = "jm_employer_career_analysis_lock_";
const BACKUP_SUGGESTION_KEY_PREFIX = "jm_employer_career_backup_suggestions_";

function getAnalysisStorageKey(postId?: string): string | null {
  if (!postId) return null;
  return `${ANALYSIS_STATE_KEY_PREFIX}${postId}`;
}

function getAnalysisLockStorageKey(postId?: string): string | null {
  if (!postId) return null;
  return `${ANALYSIS_LOCK_KEY_PREFIX}${postId}`;
}

function getBackupSuggestionStorageKey(postId?: string): string | null {
  if (!postId) return null;
  return `${BACKUP_SUGGESTION_KEY_PREFIX}${postId}`;
}

export function readStoredAnalysisState(postId?: string): StoredAnalysisState | null {
  const key = getAnalysisStorageKey(postId);
  if (!key) return null;

  try {
    const parsed = JSON.parse(
      sessionStorage.getItem(key) || "null",
    ) as Partial<StoredAnalysisState> | null;
    if (!parsed) return null;

    return {
      analysisOpen: parsed.analysisOpen === true,
      analysisDone: parsed.analysisDone === true,
      shortlistTarget: Number.isFinite(parsed.shortlistTarget) ? Number(parsed.shortlistTarget) : 0,
      backupTarget: Number.isFinite(parsed.backupTarget) ? Number(parsed.backupTarget) : 0,
      selectedShortlistIds: Array.isArray(parsed.selectedShortlistIds)
        ? parsed.selectedShortlistIds.filter((item): item is string => typeof item === "string")
        : [],
    };
  } catch {
    return null;
  }
}

export function readStoredAnalysisLock(postId?: string): boolean {
  const key = getAnalysisLockStorageKey(postId);
  if (!key) return false;

  try {
    return sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

export function readStoredBackupSuggestionIds(postId?: string): string[] {
  const key = getBackupSuggestionStorageKey(postId);
  if (!key) return [];

  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function writeStoredAnalysisState(postId: string, value: StoredAnalysisState): void {
  const key = getAnalysisStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo-safe: ignore storage failure.
  }
}

export function writeStoredAnalysisLock(postId: string | undefined, value: boolean): void {
  const key = getAnalysisLockStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.setItem(key, value ? "true" : "false");
  } catch {
    // Demo-safe: ignore storage failure.
  }
}

export function writeStoredBackupSuggestionIds(postId: string | undefined, value: string[]): void {
  const key = getBackupSuggestionStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo-safe: ignore storage failure.
  }
}

export function clearStoredAnalysisState(postId?: string): void {
  const key = getAnalysisStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Demo-safe: ignore storage failure.
  }
}

export function clearStoredAnalysisLock(postId?: string): void {
  const key = getAnalysisLockStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Demo-safe: ignore storage failure.
  }
}

export function clearStoredBackupSuggestionIds(postId?: string): void {
  const key = getBackupSuggestionStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Demo-safe: ignore storage failure.
  }
}
