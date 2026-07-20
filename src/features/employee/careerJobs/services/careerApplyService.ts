// App name: Job Mitra
// File name: careerApplyService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\services\careerApplyService.ts

// Employee-side career application service.
// Apply, withdraw, duplicate check, profile snapshot.
// Writes to wm_employee_career_applications_v1 (shared with employer dashboard).

import type {
  CareerApplication,
  CareerApplicationProfileSnapshot,
  CareerJobPost,
} from "../../../employer/careerJobs/types/careerTypes";

import {
  CAREER_APPS_KEY,
  notifyCareerAppsChanged,
  safeParse,
  safeWrite,
  type CareerStorageWriteResult,
  uid,
} from "../../../employer/careerJobs/helpers/careerStorageUtils";

import { getCareerPost } from "../../../employer/careerJobs/services/careerPostService";
import { isValidCareerOfferDetails } from "../../../employer/careerJobs/services/careerOfferHireService";
import { pushCareerActivity } from "../../../employer/careerJobs/helpers/careerNotifications";
import { canTransition } from "../../../employer/careerJobs/helpers/careerValidation";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { queuePulseEventForAffectedUser } from "../../../../features/pulse/pulseEventBridge";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";

function readAllApps(): CareerApplication[] {
  const raw = localStorage.getItem(CAREER_APPS_KEY);
  return safeParse<CareerApplication>(raw);
}

function writeAllApps(apps: CareerApplication[]): CareerStorageWriteResult {
  const result = safeWrite(CAREER_APPS_KEY, apps);
  if (!result.ok) return result;
  notifyCareerAppsChanged();
  return { ok: true };
}

function getCurrentEmployeeId(): string {
  return employeeProfileStorage.get().uniqueId ?? "employee_demo";
}

export function hasExistingApplication(jobId: string): CareerApplication | null {
  const currentEmployeeId = getCurrentEmployeeId();

  const apps = readAllApps();
  const match = apps.find(
    (app) =>
      app.jobId === jobId && app.employeeId === currentEmployeeId && app.stage !== "withdrawn",
  );

  return match ?? null;
}

export function getMyApplicationForJob(jobId: string): CareerApplication | null {
  const currentEmployeeId = getCurrentEmployeeId();

  const apps = readAllApps();
  const sorted = apps
    .filter((app) => app.jobId === jobId && app.employeeId === currentEmployeeId)
    .sort((a, b) => b.appliedAt - a.appliedAt);

  return sorted[0] ?? null;
}

function buildProfileSnapshot(): CareerApplicationProfileSnapshot {
  const profile = employeeProfileStorage.get();

  return {
    uniqueId: profile.uniqueId || undefined,
    fullName: profile.fullName.trim() || undefined,
    city: profile.city.trim() || undefined,
    experience: profile.experience || undefined,
    skills: profile.skills.length > 0 ? profile.skills : undefined,
    languages: profile.languages.length > 0 ? profile.languages : undefined,
  };
}

export type CareerApplyInput = {
  jobId: string;
  coverNote: string;
  expectedSalary: number;
  noticePeriod: string;
  employeePhone?: string;
  employeeEmail?: string;
  resumeSummary?: string;
  screeningAnswers?: Record<string, "yes" | "no">;
};

const MIN_COVER_NOTE_LENGTH = 10;
const MAX_COVER_NOTE_LENGTH = 600;
const MAX_EXPECTED_SALARY = 999_999_999;
const MAX_RESUME_SUMMARY_LENGTH = 1000;
const ALLOWED_NOTICE_PERIODS = new Set(["Immediate", "15 days", "30 days", "60 days"]);
const WITHDRAWABLE_APPLICATION_STAGES = new Set<CareerApplication["stage"]>([
  "applied",
  "shortlisted",
  "interview",
]);

function canWithdrawApplicationStage(stage: CareerApplication["stage"]): boolean {
  return WITHDRAWABLE_APPLICATION_STAGES.has(stage);
}

function canDeclineOfferStage(stage: CareerApplication["stage"]): boolean {
  return stage === "offered";
}

function isValidOptionalEmailValue(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function isValidOptionalPhoneValue(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) return true;

  const digitsOnly = trimmed.replace(/[^\d]/g, "");

  return digitsOnly.length >= 6 && digitsOnly.length <= 15;
}

function isCareerPostOpenForApply(post: CareerJobPost, now: number): boolean {
  if (post.status !== "active") return false;
  if (post.closingDate > 0 && post.closingDate <= now) return false;

  return true;
}

function hasCompletedRequiredScreening(
  post: CareerJobPost,
  answers: CareerApplyInput["screeningAnswers"],
): boolean {
  const questions = post.screeningQuestions ?? [];

  if (questions.length === 0) return true;
  if (!answers) return false;

  return questions.every(
    (question) => answers[question.id] === "yes" || answers[question.id] === "no",
  );
}

function isValidApplyInput(input: CareerApplyInput, post: CareerJobPost, now: number): boolean {
  const coverNote = input.coverNote.trim();

  if (!isCareerPostOpenForApply(post, now)) return false;
  if (coverNote.length < MIN_COVER_NOTE_LENGTH || coverNote.length > MAX_COVER_NOTE_LENGTH)
    return false;
  if (!Number.isFinite(input.expectedSalary)) return false;
  if (!Number.isInteger(input.expectedSalary)) return false;
  if (input.expectedSalary < 0 || input.expectedSalary > MAX_EXPECTED_SALARY) return false;
  if (!ALLOWED_NOTICE_PERIODS.has(input.noticePeriod.trim() || "Immediate")) return false;
  if (!isValidOptionalPhoneValue(input.employeePhone)) return false;
  if (!isValidOptionalEmailValue(input.employeeEmail)) return false;
  if ((input.resumeSummary?.trim().length ?? 0) > MAX_RESUME_SUMMARY_LENGTH) return false;
  if (!hasCompletedRequiredScreening(post, input.screeningAnswers)) return false;

  return true;
}

function normalizeExpectedSalary(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;

  return Math.min(Math.floor(value), MAX_EXPECTED_SALARY);
}

function normalizeNoticePeriod(value: string): string {
  const trimmed = value.trim();

  return ALLOWED_NOTICE_PERIODS.has(trimmed) ? trimmed : "Immediate";
}

export function applyToCareerJob(input: CareerApplyInput): CareerApplication | null {
  const post = getCareerPost(input.jobId);

  if (!post) return null;

  const now = Date.now();

  if (!isValidApplyInput(input, post, now)) return null;

  const existing = hasExistingApplication(input.jobId);
  if (existing) return null;

  const profile = employeeProfileStorage.get();

  const app: CareerApplication = {
    id: uid("capp"),
    jobId: input.jobId,
    employeeId: profile.uniqueId ?? "employee_demo",
    employeeName: profile.fullName.trim() || "Applicant",
    employeePhone: input.employeePhone?.trim() ?? "",
    employeeEmail: input.employeeEmail?.trim() ?? "",
    resumeSummary: input.resumeSummary?.trim() ?? "",
    coverNote: input.coverNote.trim(),
    expectedSalary: normalizeExpectedSalary(input.expectedSalary),
    noticePeriod: normalizeNoticePeriod(input.noticePeriod),
    profileSnapshot: buildProfileSnapshot(),
    stage: "applied",
    currentRound: 0,
    roundResults: [],
    appliedAt: Date.now(),
    updatedAt: Date.now(),
    employerNotes: "",
    screeningAnswers: post.screeningQuestions?.length ? input.screeningAnswers : undefined,
  };

  const all = readAllApps();
  writeAllApps([app, ...all]);

  queuePulseEventForAffectedUser({
    type: "CAREER_APPLICATION_SUBMITTED",
    domain: "career",
    affectedUserRole: "employer",
    targetId: app.jobId,
    postId: app.jobId,
    appId: app.id,
    severity: "urgent",
  });

  return app;
}

export type AcceptCareerOfferResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "post_inactive" | "invalid_offer" | "application_write_error";
    };

export function acceptCareerOffer(jobId: string): AcceptCareerOfferResult {
  const currentEmployeeId = getCurrentEmployeeId();
  const apps = readAllApps();
  const app = apps.find(
    (item) =>
      item.jobId === jobId && item.employeeId === currentEmployeeId && item.stage === "offered",
  );

  if (!app) return { ok: false, reason: "not_found" };

  if (!canTransition(app.stage, "offer_accepted")) {
    return { ok: false, reason: "not_found" };
  }

  const post = getCareerPost(jobId);
  if (!post || post.status !== "active") return { ok: false, reason: "post_inactive" };

  const now = Date.now();

  if (!app.offerDetails || !isValidCareerOfferDetails(app.offerDetails, now)) {
    return { ok: false, reason: "invalid_offer" };
  }

  const updatedApp: CareerApplication = {
    ...app,
    stage: "offer_accepted",
    offerAcceptedAt: now,
    updatedAt: now,
  };

  const appWrite = writeAllApps(apps.map((item) => (item.id === app.id ? updatedApp : item)));
  if (!appWrite.ok) return { ok: false, reason: "application_write_error" };

  queuePulseEventForAffectedUser({
    type: "CAREER_OFFER_ACCEPTED",
    domain: "career",
    affectedUserRole: "employer",
    targetId: jobId,
    postId: jobId,
    appId: app.id,
    severity: "urgent",
  });

  pushCareerActivity({
    postId: jobId,
    kind: "offer_sent",
    title: "Offer accepted",
    body: `${app.employeeName} accepted the offer for ${post.jobTitle}. Awaiting employer confirmation.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", jobId),
  });

  return { ok: true };
}

export function declineCareerOffer(jobId: string): boolean {
  const currentEmployeeId = getCurrentEmployeeId();
  const apps = readAllApps();
  const app = apps.find((item) => item.jobId === jobId && item.employeeId === currentEmployeeId);

  if (!app || !canDeclineOfferStage(app.stage)) return false;

  const post = getCareerPost(jobId);
  const now = Date.now();

  writeAllApps(
    apps.map((item) =>
      item.id === app.id
        ? { ...item, stage: "withdrawn" as const, withdrawnAt: now, updatedAt: now }
        : item,
    ),
  );

  if (post) {
    queuePulseEventForAffectedUser({
      type: "CAREER_OFFER_REJECTED",
      domain: "career",
      affectedUserRole: "employer",
      targetId: jobId,
      postId: jobId,
      appId: app.id,
      severity: "warning",
    });

    pushCareerActivity({
      postId: jobId,
      kind: "candidate_withdrawn",
      title: "Offer declined",
      body: `${app.employeeName} declined the offer for ${post.jobTitle}.`,
      route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", jobId),
    });
  }

  return true;
}

export function withdrawCareerApplication(jobId: string): boolean {
  const currentEmployeeId = getCurrentEmployeeId();
  const apps = readAllApps();

  const app = apps.find((item) => item.jobId === jobId && item.employeeId === currentEmployeeId);

  if (!app || !canWithdrawApplicationStage(app.stage)) return false;

  const now = Date.now();

  writeAllApps(
    apps.map((item) =>
      item.id === app.id
        ? { ...item, stage: "withdrawn" as const, withdrawnAt: now, updatedAt: now }
        : item,
    ),
  );

  return true;
}
