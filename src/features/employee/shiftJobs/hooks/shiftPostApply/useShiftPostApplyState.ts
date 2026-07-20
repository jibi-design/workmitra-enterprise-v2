// App name: Job Mitra
// File name: useShiftPostApplyState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\shiftPostApply\useShiftPostApplyState.ts

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { queuePulseEventForAffectedUser } from "../../../../../features/pulse/pulseEventBridge";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import { PulseEvent, PulseSectionId } from "../../../../../features/pulse/pulseRegistry";
import { usePulseStore } from "../../../../../features/pulse/pulseStore";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import { employeeProfileStorage } from "../../../profile/storage/employeeProfile.storage";
import {
  getFavoriteShiftIds,
  toggleFavoriteShift,
  trackShiftView,
} from "../../helpers/shiftSearchHelpers";
import {
  APPS_KEY,
  POSTS_KEY,
  ensureRequirements,
  newId,
  safeParsePosts,
} from "../../helpers/shiftApplyHelpers";
import { hasConfirmedOverlap } from "../../helpers/shiftPostDetailHelpers";
import {
  WORKSPACES_KEY,
  getEffectiveApplication,
  safeParseAllShiftApplications,
  safeParseShiftWorkspaces,
} from "../../storage/shiftPostApply.storage";
import { shiftApplicationsStorage } from "../../storage/shiftApplications.storage";
import type { ShiftApplicationRecord } from "../../types/shiftPostApply.types";
import { getShiftApplyCardStatus, getShiftPostSubmitBlockReason } from "./shiftPostApply.selectors";
import {
  createShiftApplicationRecord,
  hasActiveShiftApplicationForPost,
  saveShiftApplicationSubmission,
} from "./shiftPostApply.submit";
import {
  getShiftDetailWithdrawMessage,
  getShiftDetailWithdrawTitle,
  isShiftDetailWithdrawableStatus,
  saveWithdrawShiftApplication,
} from "./shiftPostApply.withdraw";
import { useShiftPostApplyAnswers } from "./useShiftPostApplyAnswers";

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

  useEffect(() => {
    if (postId) trackShiftView(postId);
  }, [postId]);

  const post = useMemo(
    () =>
      safeParsePosts(localStorage.getItem(POSTS_KEY)).find((item) => item.id === postId) ?? null,
    [postId],
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

  const postApplications = post
    ? safeParseAllShiftApplications(localStorage.getItem(APPS_KEY)).filter(
        (application) => application.postId === post.id,
      )
    : [];

  const existingApp = getEffectiveApplication(postApplications);

  const activeWorkspaceId = useMemo<string | null>(() => {
    if (!post) return null;

    const workspace =
      safeParseShiftWorkspaces(localStorage.getItem(WORKSPACES_KEY)).find(
        (item) =>
          item.postId === post.id &&
          (item.status === "active" || item.status === "upcoming" || item.status === "completed"),
      ) ?? null;

    return workspace ? workspace.id : null;
  }, [post]);

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

  function handleToggleSaved() {
    if (!post) return;

    const next = toggleFavoriteShift(post.id);
    const nextSet = new Set(next);

    setFavoriteIds(nextSet);
    showToast(nextSet.has(post.id) ? "Shift saved." : "Shift removed from saved.");
  }

  function submitApplicationWithList(all: readonly ShiftApplicationRecord[]) {
    if (!post) return;

    const profile = employeeProfileStorage.get();

    const app = createShiftApplicationRecord({
      id: newId("app"),
      postId: post.id,
      createdAt: Date.now(),
      profile,
      mustAns,
      goodAns,
      notes,
      quickAnswers,
      quickQuestionCount: quickQuestions.length,
    });

    const writeResult = saveShiftApplicationSubmission({
      applications: all,
      application: app,
    });

    if (!writeResult.ok) {
      showToast("Unable to save application on this device. Please free storage and try again.");
      return;
    }

    showToast("Application submitted!");
    setTimeout(() => nav(ROUTE_PATHS.employeeShiftApplications), 800);
  }

  function submit() {
    if (!post) return;

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

    const all = safeParseAllShiftApplications(localStorage.getItem(APPS_KEY));

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

    submitApplicationWithList(all);
  }

  function requestConfirmAttendance() {
    if (!existingApp || existingApp.status !== "confirmed") {
      showToast("Only confirmed shifts can be attendance-confirmed.");
      return;
    }

    if (existingApp.attendanceConfirmedAt !== undefined) {
      showToast("Attendance is already confirmed for this shift.");
      return;
    }

    setAttendanceConfirmPending(true);

    setWithdrawConfirm({
      title: "Confirm shift attendance?",
      message: "Confirm only if you are available and will attend this shift on time.",
      tone: "warn",
      confirmLabel: "I will attend",
      cancelLabel: "Not now",
    });
  }

  function confirmAttendance() {
    if (!post || !existingApp || existingApp.status !== "confirmed") return;

    const result = shiftApplicationsStorage.confirmAttendance(existingApp.id);

    setWithdrawConfirm(null);
    setAttendanceConfirmPending(false);

    if (result.ok) {
      usePulseStore.getState().resolvePulseTrailByTarget({
        eventId: PulseEvent.SHIFT_CONFIRMATION_REQUIRED,
        postId: existingApp.postId,
        appId: existingApp.id,
        sectionId: PulseSectionId.EMPLOYEE_SHIFT_CONFIRMATION_CARD,
      });

      showToast("Attendance confirmed.");
      return;
    }

    if (result.reason === "already_confirmed") {
      showToast("Attendance is already confirmed.");
      return;
    }

    if (result.reason === "not_confirmed") {
      showToast("This shift is not confirmed yet.");
      return;
    }

    if (result.reason === "not_found") {
      showToast("Application not found. Please refresh and try again.");
      return;
    }

    showToast("Unable to save attendance confirmation. Please try again.");
  }

  function requestWithdraw() {
    const status = existingApp?.status;

    if (!isShiftDetailWithdrawableStatus(status)) {
      showToast("This application cannot be withdrawn from here.");
      return;
    }

    setWithdrawConfirm({
      title: getShiftDetailWithdrawTitle(status),
      message: getShiftDetailWithdrawMessage(status),
      tone: "danger",
      confirmLabel: "Withdraw",
      cancelLabel: "Keep application",
    });
  }

  function confirmWithdraw() {
    const status = existingApp?.status;

    if (!post || !existingApp || !isShiftDetailWithdrawableStatus(status)) return;

    const all = safeParseAllShiftApplications(localStorage.getItem(APPS_KEY));

    const writeResult = saveWithdrawShiftApplication({
      applications: all,
      applicationId: existingApp.id,
      withdrawnAt: Date.now(),
    });

    setWithdrawConfirm(null);

    if (!writeResult.ok) {
      showToast("Unable to save withdrawal on this device. Please free storage and try again.");
      return;
    }

    queuePulseEventForAffectedUser({
      type: "SHIFT_APPLICATION_WITHDRAWN",
      domain: "shift",
      affectedUserRole: "employer",
      postId: post.id,
      appId: existingApp.id,
      title: "A worker withdrew their shift application",
      body: "Check your shift posts for updated applicant status.",
      route: ROUTE_PATHS.employerShiftHome,
    });

    showToast("Application withdrawn.");
    setTimeout(() => nav(ROUTE_PATHS.employeeShiftApplications), 800);
  }

  function handleCancelConfirm() {
    setWithdrawConfirm(null);
    setDoubleBookingPending(false);
    setAttendanceConfirmPending(false);
  }

  function handleConfirm() {
    if (attendanceConfirmPending) {
      confirmAttendance();
      return;
    }

    if (doubleBookingPending) {
      setWithdrawConfirm(null);
      setDoubleBookingPending(false);
      submitApplicationWithList(safeParseAllShiftApplications(localStorage.getItem(APPS_KEY)));
      return;
    }

    confirmWithdraw();
  }

  function openWorkspace() {
    if (!activeWorkspaceId) return;
    nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", activeWorkspaceId));
  }

  function openSearch() {
    nav(ROUTE_PATHS.employeeShiftSearch);
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
    cardStatus,
    isSavedShift,
    setQuickAnswers,
    handleAnswer,
    handleNote,
    submit,
    handleToggleSaved,
    requestWithdraw,
    requestConfirmAttendance,
    handleCancelConfirm,
    handleConfirm,
    openWorkspace,
    openSearch,
  };
}
