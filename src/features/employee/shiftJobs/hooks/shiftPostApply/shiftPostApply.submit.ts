// App name: Job Mitra
// File name: shiftPostApply.submit.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\shiftPostApply\shiftPostApply.submit.ts

import {
  AuthIdentityRequiredError,
  resolveActorApiId,
} from "../../../../../app/identity/identity.adapter";
import { AUTH_BACKEND_ENABLED } from "../../../../../shared/config/authConfig";
import { queuePulseEventForAffectedUser } from "../../../../pulse/pulseEventBridge";
import { employeeProfileStorage } from "../../../profile/storage/employeeProfile.storage";
import { shiftApplicationsStorage } from "../../storage/shiftApplications.storage";
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
import { shiftPostIdBridge, shiftPostIdsMatch } from "../../../../shift/utils/shiftIdBridge";
import { mergeServerApplicationIntoLsCache } from "../../../../shift/services/shiftDbTruth.service";
import { ApiRequestError, isApiConflictError } from "../../../../../shared/services/apiService";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";

export const SHIFT_APPLY_CONFLICT_MESSAGE =
  "You have already applied or have a shift scheduled at this time.";

export function buildShiftApplyConfirm(jobName: string): ConfirmData {
  const name = jobName.trim() || "this shift";
  return {
    title: "Submit this application?",
    message: `You are about to apply for ${name}. The employer will see your profile and answers.`,
    warning: "You can withdraw later if you are no longer available.",
    tone: "warn",
    confirmLabel: "Yes, submit",
    cancelLabel: "Cancel",
  };
}

export function hasActiveShiftApplicationForPost({
  applications,
  postId,
}: {
  readonly applications: readonly ShiftApplicationRecord[];
  readonly postId: string;
}): boolean {
  return applications.some(
    (application) =>
      shiftPostIdsMatch(application.postId, postId) &&
      (application.status === "applied" ||
        application.status === "shortlisted" ||
        application.status === "waiting" ||
        application.status === "confirmed"),
  );
}

function resolveWorkerSnapshotId(profile: EmployeeProfileSnapshotSource): string | undefined {
  if (AUTH_BACKEND_ENABLED) {
    try {
      return resolveActorApiId("employee");
    } catch (err) {
      if (err instanceof AuthIdentityRequiredError) return undefined;
      throw err;
    }
  }
  return profile.uniqueId?.trim() || employeeProfileStorage.get().uniqueId?.trim() || undefined;
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
  const resolvedUniqueId = resolveWorkerSnapshotId(profile);

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
 * P1: when AUTH on, worker_wm_id is auth UUID hint only — server binds session id.
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
    let workerKey = application.profileSnapshot?.uniqueId?.trim();
    if (AUTH_BACKEND_ENABLED) {
      try {
        workerKey = resolveActorApiId("employee");
      } catch {
        workerKey = undefined;
      }
    }

    if (import.meta.env.PROD && (!serverPostId || !workerKey)) {
      safeWriteAllShiftApplications(prior);
      return { ok: false, reason: "storage_error" };
    }

    if (serverPostId && workerKey) {
      try {
        let dto: Awaited<ReturnType<typeof shiftGateApi.applyToPost>> | null = null;
        for (let attempt = 0; attempt < 3 && !dto; attempt += 1) {
          try {
            dto = await shiftGateApi.applyToPost(serverPostId, {
              worker_wm_id: workerKey,
              details: {
                profileSnapshot: application.profileSnapshot,
                mustHaveAnswers: application.mustHaveAnswers,
                goodToHaveAnswers: application.goodToHaveAnswers,
                notes: application.notes,
                quickAnswers: application.quickAnswers,
              },
            });
          } catch (error) {
            const retry =
              error instanceof ApiRequestError && (error.status === 429 || error.status >= 500);
            if (!retry || attempt === 2) throw error;
            await new Promise((resolve) => window.setTimeout(resolve, 1_500 * (attempt + 1)));
          }
        }
        if (dto) mergeServerApplicationIntoLsCache(dto, application.id);
      } catch (error) {
        if (import.meta.env.PROD) {
          safeWriteAllShiftApplications(prior);
          if (isApiConflictError(error)) {
            return { ok: false, reason: "conflict" };
          }
          return { ok: false, reason: "storage_error" };
        }
      }
    }
  }

  const jobName = shiftApplicationsStorage
    .getPosts()
    .find((post) => post.id === application.postId)
    ?.jobName.trim();
  queuePulseEventForAffectedUser({
    type: "SHIFT_APPLICATION_SUBMITTED",
    domain: "shift",
    affectedUserRole: "employer",
    targetId: application.postId,
    postId: application.postId,
    severity: "info",
    body: jobName ? `A worker applied to ${jobName}.` : undefined,
  });

  return { ok: true };
}
