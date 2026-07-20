// App name: Job Mitra
// File name: useCareerDashboardAnalysisState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\hooks\careerPostDashboard\useCareerDashboardAnalysisState.ts

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import {
  analyzeCandidates,
  clampNumber,
} from "../../components/candidateAnalysis/careerCandidateAnalysis.logic";
import type { CareerTab } from "../../components/CareerPipelineTabs";
import type { CareerApplication, CareerJobPost } from "../../types/careerTypes";

type StoredAnalysisState = {
  analysisOpen: boolean;
  analysisDone: boolean;
  shortlistTarget: number;
  backupTarget: number;
  selectedShortlistIds: string[];
};

type UseCareerDashboardAnalysisStateArgs = {
  post: CareerJobPost | null;
  appliedApps: CareerApplication[];
  tab: CareerTab;
  tabCounts: Record<CareerTab, number>;
  tabApps: Record<CareerTab, CareerApplication[]>;
  setTab: (tab: CareerTab) => void;
  handleShortlist: (appId: string) => void;
};

const ANALYSIS_STATE_KEY_PREFIX = "jm_employer_career_analysis_state_";
const ANALYSIS_LOCK_KEY_PREFIX = "jm_employer_career_analysis_lock_";
const BACKUP_SUGGESTION_KEY_PREFIX = "jm_employer_career_backup_suggestions_";

export function useCareerDashboardAnalysisState({
  post,
  appliedApps,
  tab,
  tabCounts,
  tabApps,
  setTab,
  handleShortlist,
}: UseCareerDashboardAnalysisStateArgs) {
  const navigate = useNavigate();
  const appliedCount = appliedApps.length;
  const storedAnalysisState = readStoredAnalysisState(post?.id);
  const storedBackupSuggestionIds = readStoredBackupSuggestionIds(post?.id);

  const [analysisOpen, setAnalysisOpen] = useState(storedAnalysisState?.analysisOpen ?? false);
  const [analysisDone, setAnalysisDone] = useState(storedAnalysisState?.analysisDone ?? false);
  const [analysisLocked, setAnalysisLocked] = useState(
    readStoredAnalysisLock(post?.id) || storedBackupSuggestionIds.length > 0,
  );
  const [shortlistTarget, setShortlistTarget] = useState(storedAnalysisState?.shortlistTarget ?? 0);
  const [backupTarget, setBackupTarget] = useState(storedAnalysisState?.backupTarget ?? 0);
  const [selectedShortlistIds, setSelectedShortlistIds] = useState<Set<string>>(
    () => new Set(storedAnalysisState?.selectedShortlistIds ?? []),
  );
  const [backupSuggestionIds, setBackupSuggestionIds] = useState<Set<string>>(
    () => new Set(storedBackupSuggestionIds),
  );

  const safeShortlistTarget = clampNumber(shortlistTarget, 0, appliedCount);
  const safeMaxBackup = Math.max(appliedCount - safeShortlistTarget, 0);
  const safeBackupTarget = clampNumber(backupTarget, 0, safeMaxBackup);

  const analysis = useMemo(
    () =>
      post
        ? analyzeCandidates(appliedApps, post, safeShortlistTarget, safeBackupTarget)
        : { shortlist: [], backup: [], remaining: [] },
    [appliedApps, post, safeShortlistTarget, safeBackupTarget],
  );

  const visibleBackupApps = useMemo(
    () => appliedApps.filter((app) => backupSuggestionIds.has(app.id)),
    [appliedApps, backupSuggestionIds],
  );

  const visibleCounts: Record<CareerTab, number> = {
    ...tabCounts,
    backup: visibleBackupApps.length,
  };

  const visibleApps = tab === "backup" ? visibleBackupApps : tabApps[tab];

  function runAnalysis() {
    if (analysisLocked) return;

    if (safeShortlistTarget === 0 && safeBackupTarget === 0) {
      setAnalysisDone(false);
      setSelectedShortlistIds(new Set());
      setBackupSuggestionIds(new Set());
      clearStoredBackupSuggestionIds(post?.id);
      return;
    }

    const nextBackupIds = new Set(analysis.backup.map((item) => item.app.id));

    setSelectedShortlistIds(new Set(analysis.shortlist.map((item) => item.app.id)));
    setBackupSuggestionIds(nextBackupIds);
    writeStoredBackupSuggestionIds(post?.id, Array.from(nextBackupIds));
    setAnalysisDone(true);
  }

  function resetAnalysisPanel() {
    clearStoredAnalysisState(post?.id);
    setAnalysisOpen(false);
    setAnalysisDone(false);
    setShortlistTarget(0);
    setBackupTarget(0);
    setSelectedShortlistIds(new Set());
  }

  function resetAnalysisAndBackup() {
    resetAnalysisPanel();
    setAnalysisLocked(false);
    clearStoredAnalysisLock(post?.id);
    setBackupSuggestionIds(new Set());
    clearStoredBackupSuggestionIds(post?.id);

    if (tab === "backup") {
      setTab("applied");
    }
  }

  function moveSelectedToShortlist() {
    const finalBackupIds = new Set(analysis.backup.map((item) => item.app.id));

    for (const appId of selectedShortlistIds) {
      handleShortlist(appId);
    }

    writeStoredBackupSuggestionIds(post?.id, Array.from(finalBackupIds));
    writeStoredAnalysisLock(post?.id, true);
    setBackupSuggestionIds(finalBackupIds);
    setAnalysisLocked(true);
    resetAnalysisPanel();

    if (finalBackupIds.size > 0) {
      setTab("backup");
    }
  }

  function updateShortlistTarget(value: number) {
    if (analysisLocked) return;

    const next = clampNumber(value, 0, appliedCount);
    setShortlistTarget(next);

    if (safeBackupTarget > Math.max(appliedCount - next, 0)) {
      setBackupTarget(Math.max(appliedCount - next, 0));
    }

    setAnalysisDone(false);
    setSelectedShortlistIds(new Set());
    setBackupSuggestionIds(new Set());
    clearStoredBackupSuggestionIds(post?.id);
  }

  function updateBackupTarget(value: number) {
    if (analysisLocked) return;

    setBackupTarget(clampNumber(value, 0, Math.max(appliedCount - safeShortlistTarget, 0)));
    setAnalysisDone(false);
    setSelectedShortlistIds(new Set());
    setBackupSuggestionIds(new Set());
    clearStoredBackupSuggestionIds(post?.id);
  }

  function toggleSelected(appId: string) {
    if (analysisLocked) return;

    setSelectedShortlistIds((current) => {
      const next = new Set(current);

      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }

      return next;
    });
  }

  function reviewApplication(appId: string) {
    if (!post) return;

    writeStoredAnalysisState(post.id, {
      analysisOpen,
      analysisDone,
      shortlistTarget: safeShortlistTarget,
      backupTarget: safeBackupTarget,
      selectedShortlistIds: Array.from(selectedShortlistIds),
    });

    writeStoredBackupSuggestionIds(post.id, Array.from(backupSuggestionIds));
    writeStoredAnalysisLock(post.id, analysisLocked);

    navigate(
      ROUTE_PATHS.employerCareerCandidateDetail
        .replace(":postId", post.id)
        .replace(":appId", appId),
    );
  }

  return {
    appliedCount,
    analysisOpen,
    analysisDone,
    analysisLocked,
    safeShortlistTarget,
    safeBackupTarget,
    safeMaxBackup,
    analysis,
    selectedShortlistIds,
    backupSuggestionIds,
    visibleCounts,
    visibleApps,
    openAnalysis: () => {
      if (!analysisLocked) setAnalysisOpen(true);
    },
    resetAnalysisPanel,
    resetAnalysisAndBackup,
    updateShortlistTarget,
    updateBackupTarget,
    runAnalysis,
    toggleSelected,
    reviewApplication,
    moveSelectedToShortlist,
  };
}

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

function readStoredAnalysisState(postId?: string): StoredAnalysisState | null {
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

function readStoredAnalysisLock(postId?: string): boolean {
  const key = getAnalysisLockStorageKey(postId);
  if (!key) return false;

  try {
    return sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function readStoredBackupSuggestionIds(postId?: string): string[] {
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

function writeStoredAnalysisState(postId: string, value: StoredAnalysisState): void {
  const key = getAnalysisStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo-safe: ignore storage failure.
  }
}

function writeStoredAnalysisLock(postId: string | undefined, value: boolean): void {
  const key = getAnalysisLockStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.setItem(key, value ? "true" : "false");
  } catch {
    // Demo-safe: ignore storage failure.
  }
}

function writeStoredBackupSuggestionIds(postId: string | undefined, value: string[]): void {
  const key = getBackupSuggestionStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo-safe: ignore storage failure.
  }
}

function clearStoredAnalysisState(postId?: string): void {
  const key = getAnalysisStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Demo-safe: ignore storage failure.
  }
}

function clearStoredAnalysisLock(postId?: string): void {
  const key = getAnalysisLockStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Demo-safe: ignore storage failure.
  }
}

function clearStoredBackupSuggestionIds(postId?: string): void {
  const key = getBackupSuggestionStorageKey(postId);
  if (!key) return;

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Demo-safe: ignore storage failure.
  }
}
