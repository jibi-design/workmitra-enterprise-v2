import type {
  EmploymentRecord,
  EmployeeResignReason,
  EmployerTerminateReason,
} from "./employmentTypes";
import { EMPLOYEE_RESIGN_REASONS, EMPLOYER_TERMINATE_REASONS } from "./employmentTypes";
import { writeAllChecked } from "./employmentStorageHelpers";
import { notifyBothPleaseRate } from "./employmentNotifications";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { isCareerServerUuid } from "../../features/career/utils/careerAppIdBridge";

export const MAX_EXIT_NOTES_LENGTH = 240;

export const VALID_EMPLOYEE_RESIGN_REASONS = new Set<EmployeeResignReason>(
  EMPLOYEE_RESIGN_REASONS.map((item) => item.value),
);

export const VALID_EMPLOYER_TERMINATE_REASONS = new Set<EmployerTerminateReason>(
  EMPLOYER_TERMINATE_REASONS.map((item) => item.value),
);

export function normalizeExitNotes(notes: string): string | null {
  const safeNotes = notes.trim();

  if (safeNotes.length > MAX_EXIT_NOTES_LENGTH) return null;

  return safeNotes;
}

export function isValidEmployeeResignReason(reason: EmployeeResignReason): boolean {
  return VALID_EMPLOYEE_RESIGN_REASONS.has(reason);
}

export function isValidEmployerTerminateReason(reason: EmployerTerminateReason): boolean {
  return VALID_EMPLOYER_TERMINATE_REASONS.has(reason);
}

export function maybeNotifyPleaseRate(rec: EmploymentRecord): void {
  if (rec.employeeRated && rec.employerRated) return;

  notifyBothPleaseRate(rec.employeeName, rec.companyName, rec.jobTitle, rec.careerPostId);
}

/** Local circuit/demo employment ids stay on-device; UUID rows dual-write. */
export function requireDbEmploymentWhenAuthOn(rec: EmploymentRecord): boolean {
  if (!AUTH_BACKEND_ENABLED) return true;
  if (isCareerServerUuid(rec.id)) return true;
  return rec.careerPostId.trim().length > 0;
}

export async function syncEmploymentToDb(
  record: EmploymentRecord,
  role: "employee" | "employer",
  priorSnapshot: EmploymentRecord[],
): Promise<boolean> {
  if (!AUTH_BACKEND_ENABLED) return true;

  try {
    const { dualWriteEmploymentUpdate } =
      await import("../../features/career/services/employmentDbTruth.service");
    const ok = await dualWriteEmploymentUpdate(record, role);
    if (!ok) {
      writeAllChecked(priorSnapshot);
      return false;
    }
    return true;
  } catch {
    writeAllChecked(priorSnapshot);
    return false;
  }
}
