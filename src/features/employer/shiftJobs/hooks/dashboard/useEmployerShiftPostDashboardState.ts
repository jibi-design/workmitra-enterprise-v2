// App name: Job Mitra
// File name: useEmployerShiftPostDashboardState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\dashboard\useEmployerShiftPostDashboardState.ts

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import type { DashboardTab } from "../../helpers/shiftDashboardHelpers";
import type { PostSettings, PriorityTag } from "../../storage/employerShift.storage";
import { useEmployerShiftDashboardCandidateActions } from "./useEmployerShiftDashboardCandidateActions";
import { useEmployerShiftDashboardCompare } from "./useEmployerShiftDashboardCompare";
import { useEmployerShiftDashboardConfirm } from "./useEmployerShiftDashboardConfirm";
import { useEmployerShiftDashboardPostActions } from "./useEmployerShiftDashboardPostActions";
import { useEmployerShiftDashboardReplacement } from "./useEmployerShiftDashboardReplacement";
import { useEmployerShiftDashboardSnapshots } from "./useEmployerShiftDashboardSnapshots";

export function useEmployerShiftPostDashboardState() {
  const navigate = useNavigate();
  const { postId = "" } = useParams();

  const { post, apps, activity, workspace, hasApplications } =
    useEmployerShiftDashboardSnapshots(postId);

  const [tab, setTab] = useState<DashboardTab>("applied");
  const [isBusy, setIsBusy] = useState(false);
  const mountedRef = useRef(true);
  const busyInFlightRef = useRef(false);
  const busyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [ratingCompleted, setRatingCompleted] = useState(false);

  const { confirmData, openConfirm, closeConfirm, handleConfirmModalConfirm } =
    useEmployerShiftDashboardConfirm();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (busyTimerRef.current != null) {
        clearTimeout(busyTimerRef.current);
        busyTimerRef.current = null;
      }
    };
  }, []);

  const settings: PostSettings = post?.settings ?? {
    backupSlots: 2,
    autoPromoteBackup: false,
    notifyBackup: true,
  };

  const appliedApps = useMemo(
    () => apps.filter((application) => application.status === "applied"),
    [apps],
  );

  const shortlistApps = useMemo(
    () => apps.filter((application) => application.status === "shortlisted"),
    [apps],
  );

  const backupApps = useMemo(
    () => apps.filter((application) => application.status === "waiting"),
    [apps],
  );

  const selectedApps = useMemo(
    () => apps.filter((application) => application.status === "confirmed"),
    [apps],
  );

  const rejectedApps = useMemo(
    () => apps.filter((application) => application.status === "rejected"),
    [apps],
  );

  const priorityTags = useMemo(() => {
    const map: Record<string, PriorityTag | undefined> = {};

    for (const application of apps) {
      map[application.id] = application.priorityTag;
    }

    return map;
  }, [apps]);

  const tabCounts: Record<DashboardTab, number> = {
    applied: appliedApps.length,
    shortlisted: shortlistApps.length,
    backup: backupApps.length,
    selected: selectedApps.length,
    rejected: rejectedApps.length,
  };

  const tabApps = {
    applied: appliedApps,
    shortlisted: shortlistApps,
    backup: backupApps,
    selected: selectedApps,
    rejected: rejectedApps,
  }[tab];

  const analysisStatus = post?.analysisStatus ?? "not_started";
  const alreadyAnalyzed = analysisStatus === "done";
  const canAnalyze = analysisStatus === "not_started" && appliedApps.length > 0;
  const backupSlots = settings.backupSlots ?? 2;
  const useSmartGroups = alreadyAnalyzed && tab === "applied";

  const { compareIds, compareOpen, setCompareOpen, compareApplicants, toggleCompare } =
    useEmployerShiftDashboardCompare({
      apps,
      post,
    });

  function busy(fn: () => void | Promise<void>) {
    // P0-4 — sync in-flight guard (React setState is not synchronous)
    if (busyInFlightRef.current) return;
    busyInFlightRef.current = true;
    setIsBusy(true);

    void (async () => {
      try {
        await fn();
      } finally {
        if (busyTimerRef.current != null) clearTimeout(busyTimerRef.current);
        busyTimerRef.current = window.setTimeout(() => {
          busyTimerRef.current = null;
          busyInFlightRef.current = false;
          if (mountedRef.current) setIsBusy(false);
        }, 400);
      }
    })();
  }

  const {
    replaceCandidateId,
    replaceCandidateName,
    requestReplaceCandidate,
    closeReplaceCandidateModal,
    handleConfirmReplaceCandidate,
  } = useEmployerShiftDashboardReplacement({
    postId,
    backupApps,
    selectedApps,
    busy,
    setTab,
    setNotice,
  });

  const postActions = useEmployerShiftDashboardPostActions({
    postId,
    post,
    workspaceId: workspace?.id,
    settings,
    canAnalyze,
    hasApplications,
    selectedApps,
    navigate,
    busy,
    openConfirm,
    setNotice,
    setTab,
    setShowEdit,
    setRatingCompleted,
  });

  const cardActions = useEmployerShiftDashboardCandidateActions({
    postId,
    post,
    selectedApps,
    isBusy,
    busy,
    openConfirm,
    setNotice,
    setTab,
    navigate,
    onOpenGroup: postActions.handleOpenGroup,
    onRequestReplaceCandidate: requestReplaceCandidate,
  });

  const showRatingBlock =
    post?.status === "completed" && selectedApps.length > 0 && !ratingCompleted;

  const showRatingSection = selectedApps.length > 0 && post?.status !== "completed";

  return {
    postId,
    post,
    activity,
    tab,
    setTab,
    isBusy,
    showAdvanced,
    setShowAdvanced,
    showLog,
    setShowLog,
    showEdit,
    setShowEdit,
    notice,
    setNotice,
    confirmData,
    closeConfirm,
    handleConfirmModalConfirm,
    replaceCandidateId,
    replaceCandidateName,
    closeReplaceCandidateModal,
    handleConfirmReplaceCandidate,
    compareIds,
    compareOpen,
    setCompareOpen,
    compareApplicants,
    settings,
    appliedApps,
    shortlistApps,
    backupApps,
    selectedApps,
    tabCounts,
    tabApps,
    alreadyAnalyzed,
    canAnalyze,
    backupSlots,
    useSmartGroups,
    showRatingBlock,
    showRatingSection,
    priorityTags,
    cardActions,
    toggleCompare,
    handleAnalyze: postActions.handleAnalyze,
    handleReset: postActions.handleReset,
    handlePriorityTag: (appId: string, tag: PriorityTag | undefined) => {
      import("../../storage/employerShift.storage").then(({ employerShiftStorage }) => {
        employerShiftStorage.setPriorityTag(postId, appId, tag);
      });
    },
    handleDelete: postActions.handleDelete,
    handleClosePost: postActions.handleClosePost,
    handleShiftClosed: postActions.handleShiftClosed,
    handleSaveEdit: postActions.handleSaveEdit,
    handleToggleSetting: postActions.handleToggleSetting,
    goToAllPosts: postActions.goToAllPosts,
    hasApplications,
  };
}
