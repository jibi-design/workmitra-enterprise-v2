// App name: Job Mitra
// File name: useCareerDashboardAnalysisState.ts

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import {
  analyzeCandidates,
  clampNumber,
} from "../../components/candidateAnalysis/careerCandidateAnalysis.logic";
import type { CareerTab } from "../../components/CareerPipelineTabs";
import type { CareerApplication, CareerJobPost } from "../../types/careerTypes";
import {
  clearStoredAnalysisLock,
  clearStoredAnalysisState,
  clearStoredBackupSuggestionIds,
  readStoredAnalysisLock,
  readStoredAnalysisState,
  readStoredBackupSuggestionIds,
  writeStoredAnalysisLock,
  writeStoredAnalysisState,
  writeStoredBackupSuggestionIds,
} from "./useCareerDashboardAnalysisState.storage.helpers";

type UseCareerDashboardAnalysisStateArgs = {
  post: CareerJobPost | null;
  appliedApps: CareerApplication[];
  tab: CareerTab;
  tabCounts: Record<CareerTab, number>;
  tabApps: Record<CareerTab, CareerApplication[]>;
  setTab: (tab: CareerTab) => void;
  handleBulkShortlist: (appIds: readonly string[]) => void;
};

export function useCareerDashboardAnalysisState({
  post,
  appliedApps,
  tab,
  tabCounts,
  tabApps,
  setTab,
  handleBulkShortlist,
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
    const selectedIds = Array.from(selectedShortlistIds);

    // Single busy + atomic bulk write — never N concurrent shortlistCandidate races (SC-1).
    handleBulkShortlist(selectedIds);

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
