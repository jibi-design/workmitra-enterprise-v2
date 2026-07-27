// App name: Job Mitra
// File name: shiftPostApply.submit.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\shiftPostApply\shiftPostApply.submit.ts

import { queuePulseEventForAffectedUser } from "../../../../pulse/pulseEventBridge";
import { employeeProfileStorage } from "../../../profile/storage/employeeProfile.storage";
import {
  safeWriteAllShiftApplications,
  type ShiftApplicationWriteResult,
} from "../../storage/shiftPostApply.storage";
import type { ShiftApplicationRecord } from "../../types/shiftPostApply.types";
import type {
  EmployeeProfileSnapshotSource,
  ShiftAnswerMap,
  ShiftNoteMap,
  ShiftQuickAnswerMap,
} from "./shiftPostApply.types";
import {
  isShiftApiSyncEnabled,
  shiftGateApi,
} from "../../../../shift/services/shiftGateApi.service";
import { shiftPostIdBridge } from "../../../../shift/utils/shiftIdBridge";
import { mergeServerApplicationIntoLsCache } from "../../../../shift/services/shiftDbTruth.service";
import { isApiConflictError } from "../../../../../shared/services/apiService";

export const SHIFT_APPLY_CONFLICT_MESSAGE =
  "You have already applied or have a shift scheduled at this time.";

export function hasActiveShiftApplicationForPost({
  applications,
  postId,
}: {
  readonly applications: readonly ShiftApplicationRecord[];
  readonly postId: string;
}): boolean {
  return applications.some(
    (application) =>
      application.postId === postId &&
      (application.status === "applied" ||
        application.status === "shortlisted" ||
        application.status === "waiting" ||
        application.status === "confirmed"),
  );
}

export function createShiftApplicationRecord({
  id,
  postId,
  createdAt,
  profile,
  mustAns,
  goodAns,
  notes,
  quickAnswers,
  quickQuestionCount,
}: {
  readonly id: string;
  readonly postId: string;
  readonly createdAt: number;
  readonly profile: EmployeeProfileSnapshotSource;
  readonly mustAns: ShiftAnswerMap;
  readonly goodAns: ShiftAnswerMap;
  readonly notes: ShiftNoteMap;
  readonly quickAnswers: ShiftQuickAnswerMap;
  readonly quickQuestionCount: number;
}): ShiftApplicationRecord {
  const resolvedUniqueId =
    profile.uniqueId?.trim() || employeeProfileStorage.get().uniqueId?.trim() || undefined;

  return {
    id,
    postId,
    createdAt,
    status: "applied",
    profileSnapshot: {
      uniqueId: resolvedUniqueId,
      fullName: profile.fullName.trim() || undefined,
      city: profile.city.trim() || undefined,
      experience: profile.experience || undefined,
      skills: profile.skills.length > 0 ? [...profile.skills] : undefined,
      languages: profile.languages.length > 0 ? [...profile.languages] : undefined,
    },
    mustHaveAnswers: mustAns,
    goodToHaveAnswers: goodAns,
    notes,
    quickAnswers: quickQuestionCount > 0 ? quickAnswers : undefined,
  };
}

/**
 * Phase 13: LS write → POST apply when auth on → merge DB into LS.
 * Auth off: LS-only (E2E/demo).
 */
export async function saveShiftApplicationSubmission({
  applications,
  application,
}: {
  readonly applications: readonly ShiftApplicationRecord[];
  readonly application: ShiftApplicationRecord;
}): Promise<ShiftApplicationWriteResult> {
  const prior = [...applications];
  const writeResult = safeWriteAllShiftApplications([application, ...applications]);
  if (!writeResult.ok) return writeResult;

  if (isShiftApiSyncEnabled()) {
    const serverPostId = shiftPostIdBridge.resolveServerId(application.postId);
    const workerMlId = application.profileSnapshot?.uniqueId?.trim();

    if (!serverPostId || !workerMlId) {
      safeWriteAllShiftApplications(prior);
      return { ok: false, reason: "storage_error" };
    }

    try {
      const dto = await shiftGateApi.applyToPost(serverPostId, {
        worker_wm_id: workerMlId,
        details: {
          profileSnapshot: application.profileSnapshot,
          mustHaveAnswers: application.mustHaveAnswers,
          goodToHaveAnswers: application.goodToHaveAnswers,
          notes: application.notes,
          quickAnswers: application.quickAnswers,
        },
      });
      mergeServerApplicationIntoLsCache(dto, application.id);
    } catch (error) {
      safeWriteAllShiftApplications(prior);
      if (isApiConflictError(error)) {
        return { ok: false, reason: "conflict" };
      }
      return { ok: false, reason: "storage_error" };
    }
  }

  queuePulseEventForAffectedUser({
    type: "SHIFT_APPLICATION_SUBMITTED",
    domain: "shift",
    affectedUserRole: "employer",
    targetId: application.postId,
    postId: application.postId,
    severity: "urgent",
  });

  return { ok: true };
}
