/** Job Mitra | pulseEventBridge.qa.career.ts | src/features/pulse/pulseEventBridge.qa.career.ts */

import type { PulseBackendEventType } from "./pulseRegistry";
import type { PulseDevTriggerOptions } from "./pulseEventBridge.types";
import {
  dispatchBrowserEvent,
  readJsonArrayFromStorage,
  readRecordId,
  upsertStorageRecord,
  writeJsonArrayToStorage,
} from "./pulseEventBridge.qa.storage";

type PulseQaCareerStage = "shortlisted" | "interview" | "offered";

type PulseQaCareerSeed = {
  readonly jobId: string;
  readonly appId: string;
  readonly stage: PulseQaCareerStage;
};

export const CAREER_QA_APPS_KEY = "wm_employee_career_applications_v1";
export const CAREER_QA_APPS_CHANGED_EVENT = "wm:employee-career-applications-changed";
export const CAREER_QA_BASE_JOB_ID = "qa-pulse-career-job";
export const CAREER_QA_APP_ID_PREFIX = "qa-pulse-career-app";

export function getPulseQaCareerSeed(
  type: PulseBackendEventType,
  options?: PulseDevTriggerOptions,
): PulseQaCareerSeed | null {
  if (type === "CAREER_EMPLOYEE_SHORTLISTED") {
    return {
      jobId: options?.postId ?? CAREER_QA_BASE_JOB_ID,
      appId: options?.appId ?? `${CAREER_QA_APP_ID_PREFIX}-shortlisted`,
      stage: "shortlisted",
    };
  }

  if (type === "CAREER_INTERVIEW_SCHEDULED" || type === "CAREER_INTERVIEW_INVITE") {
    return {
      jobId: options?.postId ?? CAREER_QA_BASE_JOB_ID,
      appId: options?.appId ?? `${CAREER_QA_APP_ID_PREFIX}-interview`,
      stage: "interview",
    };
  }

  if (type === "CAREER_OFFER_RECEIVED" || type === "CAREER_OFFER_EXTENDED") {
    return {
      jobId: options?.postId ?? CAREER_QA_BASE_JOB_ID,
      appId: options?.appId ?? `${CAREER_QA_APP_ID_PREFIX}-offer`,
      stage: "offered",
    };
  }

  return null;
}

function formatQaDate(daysFromNow: number): string {
  const targetDate = new Date(Date.now() + daysFromNow * 86_400_000);

  return targetDate.toISOString().slice(0, 10);
}

/**
 * Seeds only Employee Career application records needed by the local pulse QA
 * simulator. This keeps production/backend event handling honest and prevents
 * fake data from leaking into public builds.
 */
export function seedCareerPulseQaData(seed: PulseQaCareerSeed): void {
  const now = Date.now();

  const roundResults =
    seed.stage === "interview"
      ? [
          {
            round: 1,
            label: "Round 1",
            status: "scheduled",
            interviewMode: "video",
            scheduledDate: formatQaDate(2),
            scheduledTime: "10:30",
            location: "Online",
            meetingLink: "https://meet.example.com/pulse-qa",
          },
        ]
      : [];

  const offerDetails =
    seed.stage === "offered"
      ? {
          jobTitle: "Pulse QA Career Role",
          salary: 45_000,
          salaryPeriod: "monthly",
          startDate: formatQaDate(7),
          message: "Pulse QA offer for local testing.",
        }
      : undefined;

  const applicationRecord: Readonly<Record<string, unknown>> = {
    id: seed.appId,
    jobId: seed.jobId,
    employeeId: "employee_demo",
    employeeName: "Pulse QA Candidate",
    employeePhone: "9999999999",
    employeeEmail: "pulse.qa@example.com",
    resumeSummary: "QA candidate profile for local Pulse testing.",
    coverNote: "This application exists only for local Pulse QA.",
    expectedSalary: 45_000,
    noticePeriod: "Immediate",
    profileSnapshot: {
      fullName: "Pulse QA Candidate",
      phone: "9999999999",
      email: "pulse.qa@example.com",
      location: "City A",
      experienceYears: 3,
      skills: ["Customer support", "Operations"],
    },
    stage: seed.stage,
    currentRound: seed.stage === "interview" ? 1 : 0,
    roundResults,
    appliedAt: now - 172_800_000,
    updatedAt: now,
    employerNotes: "",
    offeredAt: seed.stage === "offered" ? now - 3_600_000 : undefined,
    offerDetails,
  };

  const didWriteApplication = upsertStorageRecord(CAREER_QA_APPS_KEY, applicationRecord);

  if (didWriteApplication) {
    dispatchBrowserEvent(CAREER_QA_APPS_CHANGED_EVENT);
  }
}

export function clearCareerPulseQaData(): void {
  const nextApplications = readJsonArrayFromStorage(CAREER_QA_APPS_KEY).filter((item) => {
    const id = readRecordId(item);

    return id === null || !id.startsWith(CAREER_QA_APP_ID_PREFIX);
  });

  const didWriteApplications = writeJsonArrayToStorage(CAREER_QA_APPS_KEY, nextApplications);

  if (didWriteApplications) {
    dispatchBrowserEvent(CAREER_QA_APPS_CHANGED_EVENT);
  }
}
