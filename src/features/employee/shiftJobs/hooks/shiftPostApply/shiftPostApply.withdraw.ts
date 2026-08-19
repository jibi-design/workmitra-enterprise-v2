// App name: Job Mitra
// File name: shiftPostApply.withdraw.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\shiftPostApply\shiftPostApply.withdraw.ts

import {
  safeWriteAllShiftApplications,
  type ShiftApplicationWriteResult,
} from "../../storage/shiftPostApply.storage";
import type { ShiftApplicationRecord } from "../../types/shiftPostApply.types";
import type {
  ShiftDetailConfirmedCancellableStatus,
  ShiftDetailWithdrawableStatus,
} from "./shiftPostApply.types";

export function isShiftDetailWithdrawableStatus(
  status: ShiftApplicationRecord["status"] | undefined,
): status is ShiftDetailWithdrawableStatus {
  return status === "applied" || status === "shortlisted" || status === "waiting";
}

export function isShiftDetailConfirmedCancellableStatus(
  status: ShiftApplicationRecord["status"] | undefined,
): status is ShiftDetailConfirmedCancellableStatus {
  return status === "confirmed";
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

export function getShiftDetailCancelConfirmedTitle(): string {
  return "Cancel confirmed shift?";
}

export function getShiftDetailCancelConfirmedMessage(): string {
  return "This releases your confirmed slot. The employer will be notified to find a replacement. Use only if you cannot attend.";
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
  const result = safeWriteAllShiftApplications(
    withdrawShiftApplicationFromList({
      applications,
      applicationId,
      withdrawnAt,
    }),
  );
  if (result.ok) {
    void import("../../../../shift/services/shiftGateApi.service").then(
      ({ isShiftApiSyncEnabled, shiftGateApi }) => {
        if (!isShiftApiSyncEnabled()) return;
        return import("../../../../shift/utils/shiftIdBridge").then(({ shiftAppIdBridge }) => {
          const serverId = shiftAppIdBridge.resolveServerId(applicationId);
          if (!serverId) return;
          return shiftGateApi.withdrawApplication(serverId).catch(() => undefined);
        });
      },
    );
  }
  return result;
}
