import type { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import { employeeProfileStorage } from "../../../profile/storage/employeeProfile.storage";
import { toggleFavoriteShift } from "../../helpers/shiftSearchHelpers";
import { APPS_KEY, newId } from "../../helpers/shiftApplyHelpers";
import { hasConfirmedOverlap } from "../../helpers/shiftPostDetailHelpers";
import { safeParseAllShiftApplications } from "../../storage/shiftPostApply.storage";
import type { ShiftApplicationRecord } from "../../types/shiftPostApply.types";
import {
  createShiftApplicationRecord,
  hasActiveShiftApplicationForPost,
  saveShiftApplicationSubmission,
  SHIFT_APPLY_CONFLICT_MESSAGE,
} from "./shiftPostApply.submit";
import type { ShiftAnswerMap, ShiftNoteMap, ShiftQuickAnswerMap } from "./shiftPostApply.types";
import type { useShiftPostApplyDerived } from "./useShiftPostApplyDerived";

type Derived = ReturnType<typeof useShiftPostApplyDerived>;

export function createShiftPostApplySubmitActions(input: {
  nav: ReturnType<typeof useNavigate>;
  derived: Derived;
  gates: { canSubmit: boolean; submitBlockReason: string | null };
  mustAns: ShiftAnswerMap;
  goodAns: ShiftAnswerMap;
  notes: ShiftNoteMap;
  quickAnswers: ShiftQuickAnswerMap;
  setFavoriteIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setToast: React.Dispatch<React.SetStateAction<string>>;
  setWithdrawConfirm: React.Dispatch<
    React.SetStateAction<import("../../../../../shared/components/ConfirmModal").ConfirmData | null>
  >;
  setDoubleBookingPending: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSubmitting?: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmittingRef?: React.MutableRefObject<boolean>;
}) {
  const {
    nav,
    derived,
    gates,
    mustAns,
    goodAns,
    notes,
    quickAnswers,
    setFavoriteIds,
    setToast,
    setWithdrawConfirm,
    setDoubleBookingPending,
    setIsSubmitting = () => undefined,
    isSubmittingRef = { current: false },
  } = input;

  const { post, quickQuestions, existingApp, activeWorkspaceId, isClosedOrExpired } = derived;

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

  async function submitApplicationWithList(all: readonly ShiftApplicationRecord[]) {
    if (!post) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
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

      const writeResult = await saveShiftApplicationSubmission({
        applications: all,
        application: app,
      });

      if (!writeResult.ok) {
        showToast(
          writeResult.reason === "conflict"
            ? SHIFT_APPLY_CONFLICT_MESSAGE
            : "Unable to save application on this device. Please free storage and try again.",
        );
        return;
      }

      showToast("Application submitted!");
      setTimeout(() => nav(ROUTE_PATHS.employeeShiftApplications), 800);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function submit() {
    if (!post) return;
    if (isSubmittingRef.current) return;

    if (isClosedOrExpired) {
      showToast("This shift is no longer accepting applications.");
      return;
    }

    if (!gates.canSubmit) {
      if (gates.submitBlockReason) showToast(gates.submitBlockReason);
      return;
    }

    if (activeWorkspaceId) {
      nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", activeWorkspaceId));
      return;
    }

    const all = safeParseAllShiftApplications(localStorage.getItem(APPS_KEY));

    if (hasActiveShiftApplicationForPost({ applications: all, postId: post.id })) {
      showToast(SHIFT_APPLY_CONFLICT_MESSAGE);
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

    void submitApplicationWithList(all);
  }

  function openWorkspace() {
    if (!activeWorkspaceId) return;
    nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", activeWorkspaceId));
  }

  function openSearch() {
    nav(ROUTE_PATHS.employeeShiftSearch);
  }

  return {
    showToast,
    handleToggleSaved,
    submit,
    submitApplicationWithList,
    openWorkspace,
    openSearch,
    existingApp,
  };
}
