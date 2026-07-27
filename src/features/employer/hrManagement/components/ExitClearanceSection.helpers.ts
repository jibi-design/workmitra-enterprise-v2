import type { HrCompleteExitSagaResult } from "../storage/hrStorage.exitSaga";

export function fmtExitDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getFinalizeErrorMessage(
  reason: Extract<HrCompleteExitSagaResult, { ok: false }>["reason"],
): string {
  if (reason === "not_ready") {
    return "Complete all clearance items and send the experience letter before finalizing.";
  }
  if (reason === "staff_write_error") {
    return "Could not update My Staff. Exit was rolled back. Please try again.";
  }
  if (reason === "lifecycle_write_error") {
    return "Could not update employment history. Exit was rolled back. Please try again.";
  }
  if (reason === "shared_employment_write_error") {
    return "Could not update career employment records. Exit was rolled back. Please try again.";
  }
  if (reason === "hr_write_error") {
    return "Could not save HR exit status. Please try again.";
  }
  return "Could not finalize this exit. Please try again.";
}
