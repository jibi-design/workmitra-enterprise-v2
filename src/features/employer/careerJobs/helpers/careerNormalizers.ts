// src/features/employer/careerJobs/helpers/careerNormalizers.ts
//
// Safe normalizers for localStorage data.
// Every read from localStorage passes through these to guarantee type safety.
// Also exports read/write functions used by all service files.

import type {
  CareerJobPost,
  CareerJobType,
  CareerWorkMode,
  CareerSalaryPeriod,
  CareerPostStatus,
  CareerApplicationStage,
  RoundResultStatus,
  InterviewMode,
  InterviewRoundConfig,
  RoundResult,
  CareerApplication,
  CareerApplicationProfileSnapshot,
  CareerWorkspace,
  CareerWorkspaceUpdate,
  EmployerCareerActivityEntry,
  EmployerCareerActivityKind,
} from "../types/careerTypes";

import {
  isRecord,
  getString,
  getNumber,
  getStringArray,
  safeParse,
  safeWrite,
  uid,
  CAREER_POSTS_KEY,
  CAREER_APPS_KEY,
  CAREER_WORKSPACES_KEY,
  CAREER_ACTIVITY_KEY,
  notifyCareerPostsChanged,
  notifyCareerAppsChanged,
  notifyCareerWorkspacesChanged,
  notifyCareerActivityChanged,
} from "./careerStorageUtils";



// ─────────────────────────────────────────────────────────────────────────────
// Clamping Helpers (safe enum conversion)
// ─────────────────────────────────────────────────────────────────────────────

function clampJobType(x: unknown): CareerJobType {
  if (x === "full-time" || x === "part-time" || x === "contract") return x;
  return "full-time";
}

function clampWorkMode(x: unknown): CareerWorkMode {
  if (x === "on-site" || x === "remote" || x === "hybrid") return x;
  return "on-site";
}

function clampSalaryPeriod(x: unknown): CareerSalaryPeriod {
  if (x === "monthly" || x === "yearly") return x;
  return "monthly";
}

function clampPostStatus(x: unknown): CareerPostStatus {
  if (
    x === "draft" ||
    x === "active" ||
    x === "paused" ||
    x === "closed" ||
    x === "filled"
  ) return x;
  return "draft";
}

export function clampApplicationStage(x: unknown): CareerApplicationStage {
  if (
    x === "applied" ||
    x === "shortlisted" ||
    x === "interview" ||
    x === "offered" ||
    x === "hired" ||
    x === "rejected" ||
    x === "withdrawn"
  ) return x;
  return "applied";
}

function clampRoundResultStatus(x: unknown): RoundResultStatus {
  if (
    x === "scheduled" ||
    x === "pending" ||
    x === "passed" ||
    x === "failed" ||
    x === "skipped" ||
    x === "cancelled"
  ) return x;
  return "pending";
}

function clampInterviewMode(x: unknown): InterviewMode {
  if (x === "in-person" || x === "phone" || x === "video") return x;
  return "in-person";
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizer: InterviewRoundConfig
// ─────────────────────────────────────────────────────────────────────────────

function normalizeRoundConfig(raw: unknown): InterviewRoundConfig | null {
  if (!isRecord(raw)) return null;
  const round = getNumber(raw, "round");
  const label = getString(raw, "label");
  if (round === undefined || !label) return null;
  return {
    round,
    label,
    mode: clampInterviewMode(raw["mode"]),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizer: RoundResult
// ─────────────────────────────────────────────────────────────────────────────

function normalizeRoundResult(raw: unknown): RoundResult | null {
  if (!isRecord(raw)) return null;
  const round = getNumber(raw, "round");
  const label = getString(raw, "label");
  if (round === undefined || !label) return null;
  return {
    round,
    label,
    status: clampRoundResultStatus(raw["status"]),
    feedback: getString(raw, "feedback") ?? "",
    interviewMode: clampInterviewMode(raw["interviewMode"]),
    scheduledDate: getString(raw, "scheduledDate"),
    scheduledTime: getString(raw, "scheduledTime"),
    location: getString(raw, "location"),
    meetingLink: getString(raw, "meetingLink"),
    completedAt: getNumber(raw, "completedAt"),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizer: CareerJobPost
// ─────────────────────────────────────────────────────────────────────────────

function normalizeCareerPost(raw: unknown): CareerJobPost | null {
  if (!isRecord(raw)) return null;
  const idVal = getString(raw, "id");
  if (!idVal) return null;

  const salaryMin = getNumber(raw, "salaryMin") ?? 0;
  const salaryMax = getNumber(raw, "salaryMax") ?? 0;
  const experienceMin = getNumber(raw, "experienceMin") ?? 0;
  const experienceMax = getNumber(raw, "experienceMax") ?? 0;
  const interviewRounds = getNumber(raw, "interviewRounds") ?? 1;

  const rawConfigs = Array.isArray(raw["roundConfigs"]) ? raw["roundConfigs"] : [];
  const roundConfigs = (rawConfigs as unknown[])
    .map(normalizeRoundConfig)
    .filter((x): x is InterviewRoundConfig => x !== null);

  return {
    id: idVal,
    employerId: getString(raw, "employerId") ?? "employer_demo",
    companyName: getString(raw, "companyName") ?? "Company",
    jobTitle: getString(raw, "jobTitle") ?? "Untitled Position",
    department: getString(raw, "department") ?? "",
    jobType: clampJobType(raw["jobType"]),
    workMode: clampWorkMode(raw["workMode"]),
    location: getString(raw, "location") ?? "",
    salaryMin: Math.max(0, salaryMin),
    salaryMax: Math.max(salaryMin, salaryMax),
    salaryPeriod: clampSalaryPeriod(raw["salaryPeriod"]),
    experienceMin: Math.max(0, experienceMin),
    experienceMax: Math.max(experienceMin, experienceMax),
    qualifications: getStringArray(raw, "qualifications"),
    skills: getStringArray(raw, "skills"),
    description: getString(raw, "description") ?? "",
    responsibilities: getStringArray(raw, "responsibilities"),
    interviewRounds: Math.max(1, Math.min(10, interviewRounds)),
    roundConfigs,
    status: clampPostStatus(raw["status"]),
    createdAt: getNumber(raw, "createdAt") ?? Date.now(),
    updatedAt: getNumber(raw, "updatedAt") ?? Date.now(),
    closingDate: getNumber(raw, "closingDate") ?? Date.now() + 30 * 24 * 60 * 60 * 1000,
    isTemplate: !!raw["isTemplate"],
    templateName: getString(raw, "templateName"),
    clonedFrom: getString(raw, "clonedFrom"),
    totalApplications: getNumber(raw, "totalApplications") ?? 0,
    shortlisted: getNumber(raw, "shortlisted") ?? 0,
    inInterview: getNumber(raw, "inInterview") ?? 0,
    offered: getNumber(raw, "offered") ?? 0,
    hired: getNumber(raw, "hired") ?? 0,
    rejected: getNumber(raw, "rejected") ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizer: CareerApplication
// ─────────────────────────────────────────────────────────────────────────────

function normalizeProfileSnapshot(raw: unknown): CareerApplicationProfileSnapshot | undefined {
  if (!isRecord(raw)) return undefined;
  return {
    uniqueId: getString(raw, "uniqueId"),
    fullName: getString(raw, "fullName"),
    city: getString(raw, "city"),
    experience: getString(raw, "experience"),
    skills: getStringArray(raw, "skills"),
    languages: getStringArray(raw, "languages"),
  };
}

function normalizeCareerApplication(raw: unknown): CareerApplication | null {
  if (!isRecord(raw)) return null;
  const idVal = getString(raw, "id");
  const jobId = getString(raw, "jobId");
  if (!idVal || !jobId) return null;

  const rawResults = Array.isArray(raw["roundResults"]) ? raw["roundResults"] : [];
  const roundResults = (rawResults as unknown[])
    .map(normalizeRoundResult)
    .filter((x): x is RoundResult => x !== null);

  return {
    id: idVal,
    jobId,
    employeeId: getString(raw, "employeeId") ?? "",
    employeeName: getString(raw, "employeeName") ?? "Applicant",
    employeePhone: getString(raw, "employeePhone") ?? "",
    resumeSummary: getString(raw, "resumeSummary") ?? "",
    coverNote: getString(raw, "coverNote") ?? "",
    expectedSalary: getNumber(raw, "expectedSalary") ?? 0,
    noticePeriod: getString(raw, "noticePeriod") ?? "Immediate",
    profileSnapshot: normalizeProfileSnapshot(raw["profileSnapshot"]),
    stage: clampApplicationStage(raw["stage"]),
    currentRound: getNumber(raw, "currentRound") ?? 0,
    roundResults,
    appliedAt: getNumber(raw, "appliedAt") ?? Date.now(),
    updatedAt: getNumber(raw, "updatedAt") ?? Date.now(),
    employerNotes: getString(raw, "employerNotes") ?? "",
    rejectionReason: getString(raw, "rejectionReason"),
    rejectedAt: getNumber(raw, "rejectedAt"),
    offeredAt: getNumber(raw, "offeredAt"),
    hiredAt: getNumber(raw, "hiredAt"),
    withdrawnAt: getNumber(raw, "withdrawnAt"),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizer: CareerWorkspace
// ─────────────────────────────────────────────────────────────────────────────

function normalizeWorkspaceUpdate(raw: unknown): CareerWorkspaceUpdate | null {
  if (!isRecord(raw)) return null;
  const title = getString(raw, "title");
  if (!title || title.length === 0) return null;

  const kindVal = raw["kind"];
  const kind: CareerWorkspaceUpdate["kind"] =
    kindVal === "broadcast" || kindVal === "direct" ? kindVal : "system";

  return {
    id: getString(raw, "id") ?? uid("cu"),
    createdAt: getNumber(raw, "createdAt") ?? Date.now(),
    kind,
    title,
    body: getString(raw, "body"),
  };
}

function normalizeCareerWorkspace(raw: unknown): CareerWorkspace | null {
  if (!isRecord(raw)) return null;
  const idVal = getString(raw, "id");
  const jobId = getString(raw, "jobId");
  if (!idVal || !jobId) return null;

  const rawUpdates = Array.isArray(raw["updates"]) ? raw["updates"] : [];
  const updates = (rawUpdates as unknown[])
    .map(normalizeWorkspaceUpdate)
    .filter((x): x is CareerWorkspaceUpdate => x !== null);

  const statusVal = raw["status"];
  const status: CareerWorkspace["status"] =
    statusVal === "onboarding" || statusVal === "completed" || statusVal === "terminated"
      ? statusVal
      : "active";

  return {
    id: idVal,
    jobId,
    companyName: getString(raw, "companyName") ?? "Company",
    jobTitle: getString(raw, "jobTitle") ?? "Position",
    department: getString(raw, "department") ?? "",
    location: getString(raw, "location") ?? "",
    status,
    lastActivityAt: getNumber(raw, "lastActivityAt") ?? Date.now(),
    unreadCount: getNumber(raw, "unreadCount") ?? 0,
    updates,
    hiredAt: getNumber(raw, "hiredAt") ?? Date.now(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizer: EmployerCareerActivityEntry
// ─────────────────────────────────────────────────────────────────────────────

const VALID_ACTIVITY_KINDS: readonly string[] = [
  "post_created", "post_paused", "post_resumed", "post_closed", "post_filled",
  "candidate_shortlisted", "candidate_rejected", "interview_scheduled",
  "interview_passed", "interview_failed", "offer_sent", "candidate_hired",
  "candidate_withdrawn",
] as const;

function normalizeCareerActivity(raw: unknown): EmployerCareerActivityEntry | null {
  if (!isRecord(raw)) return null;
  const idVal = getString(raw, "id");
  const postId = getString(raw, "postId");
  const kind = getString(raw, "kind");
  const createdAt = getNumber(raw, "createdAt");
  const title = getString(raw, "title");
  if (!idVal || !postId || !kind || createdAt === undefined || !title) return null;
  if (!VALID_ACTIVITY_KINDS.includes(kind)) return null;

  return {
    id: idVal,
    postId,
    kind: kind as EmployerCareerActivityKind,
    createdAt,
    title,
    body: getString(raw, "body"),
    route: getString(raw, "route"),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Read Functions (normalized + sorted)
// ─────────────────────────────────────────────────────────────────────────────

export function readCareerPosts(): CareerJobPost[] {
  const raw = localStorage.getItem(CAREER_POSTS_KEY);
  return safeParse<unknown>(raw)
    .map(normalizeCareerPost)
    .filter((x): x is CareerJobPost => x !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function readCareerApps(): CareerApplication[] {
  const raw = localStorage.getItem(CAREER_APPS_KEY);
  return safeParse<unknown>(raw)
    .map(normalizeCareerApplication)
    .filter((x): x is CareerApplication => x !== null)
    .sort((a, b) => b.appliedAt - a.appliedAt);
}

export function readCareerWorkspaces(): CareerWorkspace[] {
  const raw = localStorage.getItem(CAREER_WORKSPACES_KEY);
  return safeParse<unknown>(raw)
    .map(normalizeCareerWorkspace)
    .filter((x): x is CareerWorkspace => x !== null);
}

export function readCareerActivityAll(): EmployerCareerActivityEntry[] {
  const raw = localStorage.getItem(CAREER_ACTIVITY_KEY);
  return safeParse<unknown>(raw)
    .map(normalizeCareerActivity)
    .filter((x): x is EmployerCareerActivityEntry => x !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

// ─────────────────────────────────────────────────────────────────────────────
// Write Functions (persist + notify)
// ─────────────────────────────────────────────────────────────────────────────

export function writeCareerPosts(posts: CareerJobPost[]): void {
  safeWrite(CAREER_POSTS_KEY, posts);
  notifyCareerPostsChanged();
}

export function writeCareerApps(apps: CareerApplication[]): void {
  safeWrite(CAREER_APPS_KEY, apps);
  notifyCareerAppsChanged();
}

export function writeCareerWorkspaces(list: CareerWorkspace[]): void {
  safeWrite(CAREER_WORKSPACES_KEY, list);
  notifyCareerWorkspacesChanged();
}

export function writeCareerActivityAll(list: EmployerCareerActivityEntry[]): void {
  safeWrite(CAREER_ACTIVITY_KEY, list);
  notifyCareerActivityChanged();
}