// App name: Job Mitra
// File name: useEmployerCareerPostDashboardState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\hooks\useEmployerCareerPostDashboardState.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { CareerTab } from "../components/CareerPipelineTabs";
import { useCareerDashboardCandidateActions } from "./careerPostDashboard/useCareerDashboardCandidateActions";
import { useCareerDashboardCompare } from "./careerPostDashboard/useCareerDashboardCompare";
import { useCareerDashboardData } from "./careerPostDashboard/useCareerDashboardData";
import { useCareerDashboardModalState } from "./careerPostDashboard/useCareerDashboardModalState";
import { useCareerDashboardPostActions } from "./careerPostDashboard/useCareerDashboardPostActions";

export function useEmployerCareerPostDashboardState() {
  const { postId = "" } = useParams();

  const [tab, setTab] = useState<CareerTab>("applied");
  const [isBusy, setIsBusy] = useState(false);
  const mountedRef = useRef(true);
  const busyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dashboard = useCareerDashboardData(postId);
  const modal = useCareerDashboardModalState();

  const compare = useCareerDashboardCompare({
    apps: dashboard.apps,
    post: dashboard.post,
  });

  const cancelCompareMode = compare.cancelCompareMode;

  useEffect(() => {
    cancelCompareMode();
  }, [postId, tab, cancelCompareMode]);

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

  const busy = useCallback((fn: () => void | Promise<void>) => {
    setIsBusy(true);

    void (async () => {
      try {
        await fn();
      } finally {
        if (busyTimerRef.current != null) clearTimeout(busyTimerRef.current);
        busyTimerRef.current = setTimeout(() => {
          busyTimerRef.current = null;
          if (mountedRef.current) setIsBusy(false);
        }, 350);
      }
    })();
  }, []);

  const postActions = useCareerDashboardPostActions({
    postId,
    openConfirm: modal.openConfirm,
    setNotice: modal.setNotice,
  });

  const candidateActions = useCareerDashboardCandidateActions({
    postId,
    post: dashboard.post,
    apps: dashboard.apps,
    busy,
    setTab,
    setNotice: modal.setNotice,
    openConfirm: modal.openConfirm,
    rejectTarget: modal.rejectTarget,
    setRejectTarget: modal.setRejectTarget,
    scheduleTarget: modal.scheduleTarget,
    setScheduleTarget: modal.setScheduleTarget,
    resultTarget: modal.resultTarget,
    setResultTarget: modal.setResultTarget,
    offerTarget: modal.offerTarget,
    setOfferTarget: modal.setOfferTarget,
    notesTarget: modal.notesTarget,
    setNotesTarget: modal.setNotesTarget,
    notesValue: modal.notesValue,
    setNotesValue: modal.setNotesValue,
  });

  return {
    post: dashboard.post,
    apps: dashboard.apps,
    activity: dashboard.activity,
    tab,
    setTab,
    isBusy,
    showLog: modal.showLog,
    setShowLog: modal.setShowLog,
    notice: modal.notice,
    setNotice: modal.setNotice,
    confirmData: modal.confirmData,
    closeConfirm: modal.closeConfirm,
    handleConfirm: modal.handleConfirm,
    scheduleTarget: modal.scheduleTarget,
    setScheduleTarget: modal.setScheduleTarget,
    resultTarget: modal.resultTarget,
    setResultTarget: modal.setResultTarget,
    rejectTarget: modal.rejectTarget,
    setRejectTarget: modal.setRejectTarget,
    offerTarget: modal.offerTarget,
    setOfferTarget: modal.setOfferTarget,
    notesTarget: modal.notesTarget,
    setNotesTarget: modal.setNotesTarget,
    notesValue: modal.notesValue,
    setNotesValue: modal.setNotesValue,
    compareIds: compare.compareIds,
    compareOpen: compare.compareOpen,
    compareMode: compare.compareMode,
    compareApplicants: compare.compareApplicants,
    startCompareMode: compare.startCompareMode,
    cancelCompareMode: compare.cancelCompareMode,
    openCompare: compare.openCompare,
    closeCompare: compare.closeCompare,
    tabCounts: dashboard.tabCounts,
    tabApps: dashboard.tabApps,
    postClosingText: dashboard.postClosingText,
    toggleCompare: compare.toggleCompare,
    goToCareerHome: postActions.goToCareerHome,
    handlePause: postActions.handlePause,
    handleResume: postActions.handleResume,
    handleRepost: postActions.handleRepost,
    handleClose: postActions.handleClose,
    handleShortlist: candidateActions.handleShortlist,
    handleBulkShortlist: candidateActions.handleBulkShortlist,
    handleRemoveFromShortlist: candidateActions.handleRemoveFromShortlist,
    handleRejectOpen: candidateActions.handleRejectOpen,
    handleBulkRejectOpen: candidateActions.handleBulkRejectOpen,
    handleRejectSubmit: candidateActions.handleRejectSubmit,
    handleScheduleOpen: candidateActions.handleScheduleOpen,
    handleScheduleSubmit: candidateActions.handleScheduleSubmit,
    handleResultOpen: candidateActions.handleResultOpen,
    handleResultSubmit: candidateActions.handleResultSubmit,
    handleOfferSubmit: candidateActions.handleOfferSubmit,
    handleSendOfferOpen: candidateActions.handleSendOfferOpen,
    handleHire: candidateActions.handleHire,
    handleNotesOpen: candidateActions.handleNotesOpen,
    handleNotesSave: candidateActions.handleNotesSave,
  };
}
