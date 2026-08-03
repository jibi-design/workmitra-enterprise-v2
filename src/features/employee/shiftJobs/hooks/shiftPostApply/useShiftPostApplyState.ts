// App name: Job Mitra
// File name: useShiftPostApplyState.ts
// Live LS subscriptions for post / applications / workspace (P1-2)

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import {
  getFavoriteShiftIds,
  toggleFavoriteShift,
  trackShiftView,
} from "../../helpers/shiftSearchHelpers";
import { ensureRequirements, safeParsePosts } from "../../helpers/shiftApplyHelpers";
import { hasConfirmedOverlap } from "../../helpers/shiftPostDetailHelpers";
import {
  getEffectiveApplication,
  safeParseAllShiftApplications,
  safeParseShiftWorkspaces,
} from "../../storage/shiftPostApply.storage";
import { getShiftApplyCardStatus, getShiftPostSubmitBlockReason } from "./shiftPostApply.selectors";
import { hasActiveShiftApplicationForPost } from "./shiftPostApply.submit";
import {
  getAppsRawSnapshot,
  getPostsRawSnapshot,
  getWorkspacesRawSnapshot,
  subscribeShiftApps,
  subscribeShiftPosts,
  subscribeShiftWorkspacesRaw,
} from "./shiftPostApply.liveStore";
import { useShiftPostApplyAnswers } from "./useShiftPostApplyAnswers";
import { useShiftPostApplyLifecycle } from "./useShiftPostApplyLifecycle";

export function useShiftPostApplyState(postId: string) {
  const nav = useNavigate();

  const { mustAns, goodAns, notes, quickAnswers, setQuickAnswers, handleAnswer, handleNote } =
    useShiftPostApplyAnswers();

  const [withdrawConfirm, setWithdrawConfirm] = useState<ConfirmData | null>(null);
  const [doubleBookingPending, setDoubleBookingPending] = useState(false);
  const [attendanceConfirmPending, setAttendanceConfirmPending] = useState(false);
  const [toast, setToast] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(getFavoriteShiftIds()));
  const [now] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const postsRaw = useSyncExternalStore(subscribeShiftPosts, getPostsRawSnapshot, () => null);
  const appsRaw = useSyncExternalStore(subscribeShiftApps, getAppsRawSnapshot, () => null);
  const workspacesRaw = useSyncExternalStore(
    subscribeShiftWorkspacesRaw,
    getWorkspacesRawSnapshot,
    () => null,
  );

  useEffect(() => {
    if (postId) trackShiftView(postId);
  }, [postId]);

  const post = useMemo(
    () => safeParsePosts(postsRaw).find((item) => item.id === postId) ?? null,
    [postId, postsRaw],
  );

  const requirements = useMemo(
    () => (post ? ensureRequirements(post) : { mustHave: [], goodToHave: [] }),
    [post],
  );

  const quickQuestions = post?.quickQuestions ?? [];
  const isSavedShift = post ? favoriteIds.has(post.id) : false;

  const mustTotal = requirements.mustHave.length;
  const mustMetCount = requirements.mustHave.reduce(
    (accumulator, item) => accumulator + (mustAns[item] === "meets" ? 1 : 0),
    0,
  );

  const mustGateOk = mustTotal === 0 || mustMetCount === mustTotal;

  const allQuestionsAnswered =
    quickQuestions.length === 0 ||
    quickQuestions.every((question) => quickAnswers[question.id] !== undefined);

  const postApplications = useMemo(() => {
    if (!post) return [];
    return safeParseAllShiftApplications(appsRaw).filter(
      (application) => application.postId === post.id,
    );
  }, [appsRaw, post]);

  const existingApp = getEffectiveApplication(postApplications);

  const activeWorkspaceId = useMemo<string | null>(() => {
    if (!post) return null;

    const workspace =
      safeParseShiftWorkspaces(workspacesRaw).find(
        (item) =>
          item.postId === post.id &&
          (item.status === "active" || item.status === "upcoming" || item.status === "completed"),
      ) ?? null;

    return workspace ? workspace.id : null;
  }, [post, workspacesRaw]);

  const isApplied = existingApp?.status === "applied";
  const isShortlisted = existingApp?.status === "shortlisted";
  const isWaiting = existingApp?.status === "waiting";
  const isWithdrawn = existingApp?.status === "withdrawn";
  const isConfirmed = existingApp?.status === "confirmed";
  const hasWorkspace = activeWorkspaceId !== null;

  const isClosedOrExpired = Boolean(post?.isHiddenFromSearch) || Boolean(post && post.endAt < now);

  const shouldBlockReapply = isApplied || isShortlisted || isWaiting || isConfirmed || hasWorkspace;

  const canSubmit = mustGateOk && allQuestionsAnswered && !shouldBlockReapply && !isClosedOrExpired;

  const submitBlockReason = useMemo(
    () =>
      getShiftPostSubmitBlockReason({
        isClosedOrExpired,
        hasWorkspace,
        isConfirmed,
        isApplied,
        isShortlisted,
        isWaiting,
        mustGateOk,
        allQuestionsAnswered,
        quickQuestionCount: quickQuestions.length,
      }),
    [
      allQuestionsAnswered,
      hasWorkspace,
      isApplied,
      isClosedOrExpired,
      isConfirmed,
      isShortlisted,
      isWaiting,
      mustGateOk,
      quickQuestions.length,
    ],
  );

  const cardStatus = useMemo(
    () =>
      getShiftApplyCardStatus({
        hasWorkspace,
        isConfirmed,
        isShortlisted,
        isWaiting,
        isApplied,
        isWithdrawn,
      }),
    [hasWorkspace, isConfirmed, isShortlisted, isWaiting, isApplied, isWithdrawn],
  );

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  const lifecycle = useShiftPostApplyLifecycle({
    post,
    existingApp,
    activeWorkspaceId,
    mustAns,
    goodAns,
    notes,
    quickAnswers,
    quickQuestions,
    showToast,
    setWithdrawConfirm,
    setDoubleBookingPending,
    setAttendanceConfirmPending,
  });

  function handleToggleSaved() {
    if (!post) return;

    const next = toggleFavoriteShift(post.id);
    const nextSet = new Set(next);

    setFavoriteIds(nextSet);
    showToast(nextSet.has(post.id) ? "Shift saved." : "Shift removed from saved.");
  }

  async function submit() {
    if (!post) return;
    if (isSubmittingRef.current) return;

    if (isClosedOrExpired) {
      showToast("This shift is no longer accepting applications.");
      return;
    }

    if (!canSubmit) {
      if (submitBlockReason) showToast(submitBlockReason);
      return;
    }

    if (activeWorkspaceId) {
      nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", activeWorkspaceId));
      return;
    }

    const all = safeParseAllShiftApplications(appsRaw);

    if (hasActiveShiftApplicationForPost({ applications: all, postId: post.id })) {
      showToast("This shift is already in your applications.");
      return;
    }

    if (hasConfirmedOverlap(post.id, post.startAt, post.endAt)) {
      setWithdrawConfirm({
        title: "You already have a confirmed shift on this date",
        message: "You can still apply, but make sure you can attend both.",
        tone: "warn",
        confirmLabel: "Apply Anyway",
        cancelLabel: "Cancel",
      });
      setDoubleBookingPending(true);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await lifecycle.submitApplicationWithList(all);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    post,
    requirements,
    mustAns,
    goodAns,
    notes,
    quickAnswers,
    withdrawConfirm,
    toast,
    mustTotal,
    mustMetCount,
    mustGateOk,
    allQuestionsAnswered,
    quickQuestions,
    isApplied,
    isShortlisted,
    isWaiting,
    isConfirmed,
    attendanceConfirmedAt: existingApp?.attendanceConfirmedAt,
    activeWorkspaceId,
    shouldBlockReapply,
    isClosedOrExpired,
    canSubmit,
    submitBlockReason,
    isSubmitting,
    cardStatus,
    isSavedShift,
    setQuickAnswers,
    handleAnswer,
    handleNote,
    submit,
    handleToggleSaved,
    requestWithdraw: lifecycle.requestWithdraw,
    requestConfirmAttendance: lifecycle.requestConfirmAttendance,
    handleCancelConfirm: lifecycle.handleCancelConfirm,
    handleConfirm: () => lifecycle.handleConfirm(attendanceConfirmPending, doubleBookingPending),
    openWorkspace: lifecycle.openWorkspace,
    openSearch: lifecycle.openSearch,
  };
}
