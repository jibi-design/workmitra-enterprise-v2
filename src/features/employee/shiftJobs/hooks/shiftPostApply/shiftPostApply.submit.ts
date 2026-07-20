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

export function saveShiftApplicationSubmission({
  applications,
  application,
}: {
  readonly applications: readonly ShiftApplicationRecord[];
  readonly application: ShiftApplicationRecord;
}): ShiftApplicationWriteResult {
  const writeResult = safeWriteAllShiftApplications([application, ...applications]);

  if (writeResult.ok) {
    queuePulseEventForAffectedUser({
      type: "SHIFT_APPLICATION_SUBMITTED",
      domain: "shift",
      affectedUserRole: "employer",
      targetId: application.postId,
      postId: application.postId,
      severity: "urgent",
    });
  }

  return writeResult;
}
