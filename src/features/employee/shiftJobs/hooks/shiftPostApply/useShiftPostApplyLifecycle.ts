import { useNavigate } from "react-router-dom";
import { queuePulseEventForAffectedUser } from "../../../../../features/pulse/pulseEventBridge";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import { PulseEvent, PulseSectionId } from "../../../../../features/pulse/pulseRegistry";
import { usePulseStore } from "../../../../../features/pulse/pulseStore";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import { employeeProfileStorage } from "../../../profile/storage/employeeProfile.storage";
import { APPS_KEY, newId } from "../../helpers/shiftApplyHelpers";
import { safeParseAllShiftApplications } from "../../storage/shiftPostApply.storage";
import { shiftApplicationsStorage } from "../../storage/shiftApplications.storage";
import type { ShiftApplicationRecord } from "../../types/shiftPostApply.types";
import type { ShiftPostData } from "../../types/shiftApplicationTypes";
import type { ShiftAnswerMap, ShiftNoteMap, ShiftQuickAnswerMap } from "./shiftPostApply.types";
import {
  createShiftApplicationRecord,
  saveShiftApplicationSubmission,
} from "./shiftPostApply.submit";
import {
  getShiftDetailCancelConfirmedMessage,
  getShiftDetailCancelConfirmedTitle,
  getShiftDetailWithdrawMessage,
  getShiftDetailWithdrawTitle,
  isShiftDetailConfirmedCancellableStatus,
  isShiftDetailWithdrawableStatus,
  saveWithdrawShiftApplication,
} from "./shiftPostApply.withdraw";

type ShiftPostApplyLifecycleParams = {
  post: ShiftPostData | null;
  existingApp: ShiftApplicationRecord | null;
  activeWorkspaceId: string | null;
  mustAns: ShiftAnswerMap;
  goodAns: ShiftAnswerMap;
  notes: ShiftNoteMap;
  quickAnswers: ShiftQuickAnswerMap;
  quickQuestions: { id: string }[];
  showToast: (message: string) => void;
  setWithdrawConfirm: (value: ConfirmData | null) => void;
  setDoubleBookingPending: (value: boolean) => void;
  setAttendanceConfirmPending: (value: boolean) => void;
};

export function useShiftPostApplyLifecycle({
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
}: ShiftPostApplyLifecycleParams) {
  const nav = useNavigate();

  async function submitApplicationWithList(all: readonly ShiftApplicationRecord[]) {
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

    const writeResult = await saveShiftApplicationSubmission({
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

    if (isShiftDetailConfirmedCancellableStatus(status)) {
      setWithdrawConfirm({
        title: getShiftDetailCancelConfirmedTitle(),
        message: getShiftDetailCancelConfirmedMessage(),
        tone: "danger",
        confirmLabel: "Cancel confirmation",
        cancelLabel: "Keep confirmation",
      });
      return;
    }

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

    if (!post || !existingApp) return;

    if (isShiftDetailConfirmedCancellableStatus(status)) {
      const result = shiftApplicationsStorage.cancelConfirmedAssignment(existingApp.id);
      setWithdrawConfirm(null);

      if (!result.ok) {
        if (result.reason === "not_confirmed") {
          showToast("This shift is no longer confirmed.");
          return;
        }
        if (result.reason === "not_found") {
          showToast("Application not found. Please refresh and try again.");
          return;
        }
        showToast("Unable to cancel confirmation. Please try again.");
        return;
      }

      showToast("Confirmation cancelled. Employer was notified.");
      setTimeout(() => nav(ROUTE_PATHS.employeeShiftApplications), 800);
      return;
    }

    if (!isShiftDetailWithdrawableStatus(status)) return;

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

  function handleConfirm(attendanceConfirmPending: boolean, doubleBookingPending: boolean) {
    if (attendanceConfirmPending) {
      confirmAttendance();
      return;
    }

    if (doubleBookingPending) {
      setWithdrawConfirm(null);
      setDoubleBookingPending(false);
      void submitApplicationWithList(safeParseAllShiftApplications(localStorage.getItem(APPS_KEY)));
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
    submitApplicationWithList,
    requestConfirmAttendance,
    requestWithdraw,
    handleCancelConfirm,
    handleConfirm,
    openWorkspace,
    openSearch,
  };
}
