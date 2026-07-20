// App name: Job Mitra
// File name: shiftPostApply.withdraw.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\shiftPostApply\shiftPostApply.withdraw.ts

import {
  safeWriteAllShiftApplications,
  type ShiftApplicationWriteResult,
} from "../../storage/shiftPostApply.storage";
import type { ShiftApplicationRecord } from "../../types/shiftPostApply.types";
import type { ShiftDetailWithdrawableStatus } from "./shiftPostApply.types";

export function isShiftDetailWithdrawableStatus(
  status: ShiftApplicationRecord["status"] | undefined,
): status is ShiftDetailWithdrawableStatus {
  return status === "applied" || status === "shortlisted" || status === "waiting";
}

export function getShiftDetailWithdrawTitle(status: ShiftDetailWithdrawableStatus): string {
  if (status === "shortlisted") {
    return "Withdraw from shortlist?";
  }

  if (status === "waiting") {
    return "Leave backup list?";
  }

  return "Withdraw this application?";
}

export function getShiftDetailWithdrawMessage(status: ShiftDetailWithdrawableStatus): string {
  if (status === "shortlisted") {
    return "You are currently shortlisted. Withdraw only if you are no longer available for this shift.";
  }

  if (status === "waiting") {
    return "You are currently on the backup list. Withdraw only if you do not want to stay available for this shift.";
  }

  return "Employer will no longer review this application after withdrawal.";
}

export function withdrawShiftApplicationFromList({
  applications,
  applicationId,
  withdrawnAt,
}: {
  readonly applications: readonly ShiftApplicationRecord[];
  readonly applicationId: string;
  readonly withdrawnAt: number;
}): ShiftApplicationRecord[] {
  return applications.map((application) =>
    application.id === applicationId
      ? {
          ...application,
          status: "withdrawn" as const,
          withdrawnAt,
        }
      : application,
  );
}

export function saveWithdrawShiftApplication({
  applications,
  applicationId,
  withdrawnAt,
}: {
  readonly applications: readonly ShiftApplicationRecord[];
  readonly applicationId: string;
  readonly withdrawnAt: number;
}): ShiftApplicationWriteResult {
  return safeWriteAllShiftApplications(
    withdrawShiftApplicationFromList({
      applications,
      applicationId,
      withdrawnAt,
    }),
  );
}
