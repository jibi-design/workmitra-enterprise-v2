import type { PulseNodeId } from "../../../pulse/pulseStore";
import type { ShiftApplicationData } from "../../shiftJobs/types/shiftApplicationTypes";
import { isDirectInviteAcceptedApplication } from "../helpers/shiftDirectInvite.helpers";

export const GREEN = "#16a34a";
export const PLANNER_TEAL = "#0891b2";
export const TEXT_DARK = "#0f172a";
export const MUTED = "#64748b";

export type ShiftApplicationPulseTarget = {
  readonly pulseId: PulseNodeId;
};

export function getNextStepText(application: ShiftApplicationData): string {
  if (application.status === "applied") return "Waiting for employer review.";
  if (application.status === "shortlisted")
    return "You are shortlisted. Keep your availability open until confirmation.";
  if (application.status === "waiting")
    return "You are on the backup list. Stay ready, but keep applying to other suitable shifts.";

  if (application.status === "confirmed") {
    if (isDirectInviteAcceptedApplication(application.id)) {
      return "Direct invite accepted. You are confirmed — open your workspace for updates.";
    }

    if (application.attendanceConfirmedAt !== undefined) {
      return "Attendance confirmed. Check your shift workspace and attend on time.";
    }

    return "Confirmed. Please confirm that you will attend this shift.";
  }

  if (application.status === "withdrawn") return "Application withdrawn.";
  if (application.status === "rejected")
    return "Not selected for this shift. You can apply for other available shifts.";
  if (application.status === "replaced") return "This assignment was replaced by the employer.";
  if (application.status === "exited") return "You exited this shift workspace.";
  return "Application status updated.";
}

export function getShiftApplicationPulseTarget(
  application: ShiftApplicationData,
): ShiftApplicationPulseTarget | null {
  if (application.status === "shortlisted") {
    return {
      pulseId: "employee-shift-shortlisted-card",
    };
  }

  if (application.status === "waiting") {
    return {
      pulseId: "employee-shift-waitlisted-card",
    };
  }

  if (application.status === "confirmed" && application.attendanceConfirmedAt === undefined) {
    return {
      pulseId: "employee-shift-confirmation-card",
    };
  }

  return null;
}
