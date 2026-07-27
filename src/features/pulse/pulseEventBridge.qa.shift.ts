/** Job Mitra | pulseEventBridge.qa.shift.ts | src/features/pulse/pulseEventBridge.qa.shift.ts */

import type { PulseBackendEventType } from "./pulseRegistry";
import type { PulseDevTriggerOptions } from "./pulseEventBridge.types";
import {
  dispatchBrowserEvent,
  readJsonArrayFromStorage,
  readRecordId,
  upsertStorageRecord,
  writeJsonArrayToStorage,
} from "./pulseEventBridge.qa.storage";

type PulseQaShiftStatus = "shortlisted" | "waiting" | "confirmed";

type PulseQaShiftSeed = {
  readonly postId: string;
  readonly appId: string;
  readonly status: PulseQaShiftStatus;
};

export const SHIFT_QA_POSTS_KEY = "wm_employer_shift_posts_v1";
export const SHIFT_QA_APPS_KEY = "wm_employee_shift_applications_v1";
export const SHIFT_QA_APPS_CHANGED_EVENT = "wm:employee-shift-applications-changed";
export const SHIFT_QA_BASE_POST_ID = "qa-pulse-shift-post";
export const SHIFT_QA_APP_ID_PREFIX = "qa-pulse-shift-app";

export function getPulseQaShiftSeed(
  type: PulseBackendEventType,
  options?: PulseDevTriggerOptions,
): PulseQaShiftSeed | null {
  if (type === "SHIFT_EMPLOYEE_SHORTLISTED") {
    return {
      postId: options?.postId ?? SHIFT_QA_BASE_POST_ID,
      appId: options?.appId ?? `${SHIFT_QA_APP_ID_PREFIX}-shortlisted`,
      status: "shortlisted",
    };
  }

  if (type === "SHIFT_EMPLOYEE_WAITLISTED") {
    return {
      postId: options?.postId ?? SHIFT_QA_BASE_POST_ID,
      appId: options?.appId ?? `${SHIFT_QA_APP_ID_PREFIX}-waitlisted`,
      status: "waiting",
    };
  }

  if (type === "SHIFT_CONFIRMATION_REQUIRED") {
    return {
      postId: options?.postId ?? SHIFT_QA_BASE_POST_ID,
      appId: options?.appId ?? `${SHIFT_QA_APP_ID_PREFIX}-confirmation`,
      status: "confirmed",
    };
  }

  return null;
}

/**
 * Seeds only the local QA records required for the pulse target to exist.
 *
 * This is deliberately called only from wmPulseDev. It does not run for backend
 * notifications, real users, or public production domains.
 */
export function seedShiftPulseQaData(seed: PulseQaShiftSeed): void {
  const now = Date.now();
  const startAt = now + 86_400_000;
  const endAt = startAt + 28_800_000;

  const postRecord: Readonly<Record<string, unknown>> = {
    id: seed.postId,
    companyName: "Pulse QA Employer",
    jobName: "Pulse QA Shift",
    experience: "fresher_ok",
    payPerDay: 850,
    locationName: "Kochi",
    locationAddress: "Pulse QA demo location",
    mapsLink: "",
    startAt,
    endAt,
    shiftType: "Day Shift",
    isHiddenFromSearch: false,
    updatedAt: now,
  };

  const applicationRecord: Readonly<Record<string, unknown>> = {
    id: seed.appId,
    postId: seed.postId,
    createdAt: now - 3_600_000,
    status: seed.status,
    mustHaveAnswers: {},
    goodToHaveAnswers: {},
    notes: {},
    updatedAt: now,
  };

  const didWritePost = upsertStorageRecord(SHIFT_QA_POSTS_KEY, postRecord);
  const didWriteApplication = upsertStorageRecord(SHIFT_QA_APPS_KEY, applicationRecord);

  if (didWritePost || didWriteApplication) {
    dispatchBrowserEvent(SHIFT_QA_APPS_CHANGED_EVENT);
  }
}

export function clearShiftPulseQaData(): void {
  const nextPosts = readJsonArrayFromStorage(SHIFT_QA_POSTS_KEY).filter((item) => {
    return readRecordId(item) !== SHIFT_QA_BASE_POST_ID;
  });

  const nextApplications = readJsonArrayFromStorage(SHIFT_QA_APPS_KEY).filter((item) => {
    const id = readRecordId(item);

    return id === null || !id.startsWith(SHIFT_QA_APP_ID_PREFIX);
  });

  const didWritePosts = writeJsonArrayToStorage(SHIFT_QA_POSTS_KEY, nextPosts);
  const didWriteApplications = writeJsonArrayToStorage(SHIFT_QA_APPS_KEY, nextApplications);

  if (didWritePosts || didWriteApplications) {
    dispatchBrowserEvent(SHIFT_QA_APPS_CHANGED_EVENT);
  }
}
