import type { useNavigate } from "react-router-dom";
import { queuePulseEventForAffectedUser } from "../../../../../features/pulse/pulseEventBridge";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import { PulseEvent, PulseSectionId } from "../../../../../features/pulse/pulseRegistry";
import { usePulseStore } from "../../../../../features/pulse/pulseStore";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import { APPS_KEY } from "../../helpers/shiftApplyHelpers";
import { safeParseAllShiftApplications } from "../../storage/shiftPostApply.storage";
import { shiftApplicationsStorage } from "../../storage/shiftApplications.storage";
import {
  ATTENDANCE_INTENT_ACTION,
  ATTENDANCE_INTENT_HELPER,
  ATTENDANCE_INTENT_TITLE,
} from "../../helpers/attendanceIntentCopy";
import {
  getShiftDetailCancelConfirmedMessage,
  getShiftDetailCancelConfirmedTitle,
  getShiftDetailWithdrawMessage,
  getShiftDetailWithdrawTitle,
  isShiftDetailConfirmedCancellableStatus,
  isShiftDetailWithdrawableStatus,
  saveWithdrawShiftApplication,
} from "./shiftPostApply.withdraw";
import type { useShiftPostApplyDerived } from "./useShiftPostApplyDerived";

type Derived = ReturnType<typeof useShiftPostApplyDerived>;

export function createShiftPostApplyWithdrawActions(input: {
  nav: ReturnType<typeof useNavigate>;
  derived: Derived;
  setWithdrawConfirm: React.Dispatch<React.SetStateAction<ConfirmData | null>>;
  setDoubleBookingPending: React.Dispatch<React.SetStateAction<boolean>>;
  setAttendanceConfirmPending: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (message: string) => void;
  submitApplicationWithList: (all: ReturnType<typeof safeParseAllShiftApplications>) => void;
}) {
  const {
    nav,
    derived,
    setWithdrawConfirm,
    setDoubleBookingPending,
    setAttendanceConfirmPending,
    showToast,
    submitApplicationWithList,
  } = input;

  const { post, existingApp } = derived;

  function requestConfirmAttendance() {
    if (!existingApp || existingApp.status !== "confirmed") {
      showToast("Only confirmed shifts can record attendance intent.");
      return;
    }

    if (existingApp.attendanceConfirmedAt !== undefined) {
      showToast("Attendance intent is already saved for this shift.");
      return;
    }

    setAttendanceConfirmPending(true);

    setWithdrawConfirm({
      title: ATTENDANCE_INTENT_TITLE,
      message: ATTENDANCE_INTENT_HELPER,
      tone: "neutral",
      confirmLabel: ATTENDANCE_INTENT_ACTION,
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

      showToast("Attendance intent / check-in signal saved.");
      return;
    }

    if (result.reason === "already_confirmed") {
      showToast("Attendance intent is already saved.");
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

    showToast("Unable to save attendance intent. Please try again.");
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

  function handleConfirm(doubleBookingPending: boolean, attendanceConfirmPending: boolean) {
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

  return {
    requestWithdraw,
    requestConfirmAttendance,
    handleCancelConfirm,
    handleConfirm,
  };
}
