/** Job Mitra | myShiftApplications.confirm.ts */

import { PulseEvent, PulseSectionId } from "../../../pulse/pulseRegistry";
import { usePulseStore } from "../../../pulse/pulseStore";
import { shiftApplicationsStorage } from "../storage/shiftApplications.storage";
import type { ShiftApplicationData } from "../../shiftJobs/types/shiftApplicationTypes";

export function settleMyShiftApplicationsConfirm(args: {
  readonly pendingAttendance: ShiftApplicationData | null;
  readonly pendingWithdraw: ShiftApplicationData | null;
  readonly showToast: (message: string) => void;
}): void {
  const { pendingAttendance, pendingWithdraw, showToast } = args;

  if (pendingAttendance) {
    const result = shiftApplicationsStorage.confirmAttendance(pendingAttendance.id);
    if (result.ok) {
      usePulseStore.getState().resolvePulseTrailByTarget({
        eventId: PulseEvent.SHIFT_CONFIRMATION_REQUIRED,
        postId: pendingAttendance.postId,
        appId: pendingAttendance.id,
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
    return;
  }

  if (!pendingWithdraw) return;

  if (pendingWithdraw.status === "confirmed") {
    const result = shiftApplicationsStorage.cancelConfirmedAssignment(pendingWithdraw.id);
    if (result.ok) {
      showToast("Confirmation cancelled. Employer was notified.");
      return;
    }
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

  const result = shiftApplicationsStorage.withdrawApplication(pendingWithdraw.id);
  if (result.ok) {
    showToast("Application withdrawn.");
    return;
  }
  if (result.reason === "not_withdrawable") {
    showToast("This application can no longer be withdrawn.");
    return;
  }
  if (result.reason === "not_found") {
    showToast("Application not found. Please refresh and try again.");
    return;
  }
  showToast("Unable to save withdrawal. Please try again.");
}
