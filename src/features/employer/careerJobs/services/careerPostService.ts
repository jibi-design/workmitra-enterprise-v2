// src/features/employer/careerJobs/services/careerPostService.ts
//
// Career Job Post lifecycle management.
// Create, clone, save as template, pause, resume, close.
// Read helpers with auto-analytics recompute.

import { ROUTE_PATHS } from "../../../../app/router/routePaths";

import type {
  CareerJobPost,
  CareerApplication,
  EmployerCareerActivityEntry,
} from "../types/careerTypes";

import { uid } from "../helpers/careerStorageUtils";

import {
  readCareerPosts,
  writeCareerPosts,
  readCareerApps,
  readCareerActivityAll,
} from "../helpers/careerNormalizers";

import { pushCareerActivity } from "../helpers/careerNotifications";

import { recomputePostAnalytics, syncToEmployeeCareerSearch } from "../helpers/careerValidation";

// ─────────────────────────────────────────────────────────────────────────────
// Read Operations
// ─────────────────────────────────────────────────────────────────────────────

export function getCareerPosts(): CareerJobPost[] {
  const posts = readCareerPosts();
  const apps = readCareerApps();
  const withAnalytics = posts.map((p) => recomputePostAnalytics(p, apps));
  syncToEmployeeCareerSearch(withAnalytics);
  return withAnalytics;
}

export function getCareerPost(postId: string): CareerJobPost | null {
  return getCareerPosts().find((p) => p.id === postId) ?? null;
}

export function getCareerApplicationsForPost(postId: string): CareerApplication[] {
  return readCareerApps().filter((a) => a.jobId === postId);
}

export function getCareerApplication(appId: string): CareerApplication | null {
  return readCareerApps().find((a) => a.id === appId) ?? null;
}

export function getCareerActivityForPost(postId: string): EmployerCareerActivityEntry[] {
  return readCareerActivityAll()
    .filter((a) => a.postId === postId)
    .slice(0, 50);
}

export function getCareerTemplates(): CareerJobPost[] {
  return readCareerPosts().filter((p) => p.isTemplate);
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Post
// ─────────────────────────────────────────────────────────────────────────────

type CareerPostCreateInput = Omit<
  CareerJobPost,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "totalApplications"
  | "shortlisted"
  | "inInterview"
  | "offered"
  | "hired"
  | "rejected"
>;

const MAX_CAREER_POST_VACANCIES = 500;

function getDefaultRepostClosingDate(now: number): number {
  const date = new Date(now);
  date.setDate(date.getDate() + 30);
  date.setHours(23, 59, 59, 0);

  return date.getTime();
}

function hasMinText(value: string, minLength: number): boolean {
  return value.trim().length >= minLength;
}

function isValidCareerPostCreateInput(input: CareerPostCreateInput, now: number): boolean {
  if (!hasMinText(input.companyName, 2)) return false;
  if (!hasMinText(input.jobTitle, 2)) return false;

  if (input.workMode !== "remote" && !hasMinText(input.location, 2)) return false;

  if (
    !Number.isInteger(input.vacancies) ||
    input.vacancies < 1 ||
    input.vacancies > MAX_CAREER_POST_VACANCIES
  ) {
    return false;
  }

  if (!["none", "1_month", "3_months", "6_months"].includes(input.probationPeriod)) return false;

  if (!Number.isFinite(input.salaryMin) || !Number.isFinite(input.salaryMax)) return false;
  if (input.salaryMin < 0 || input.salaryMax < 0) return false;
  if (input.salaryMax > 0 && input.salaryMax < input.salaryMin) return false;

  if (!Number.isFinite(input.experienceMin) || !Number.isFinite(input.experienceMax)) return false;
  if (input.experienceMin < 0 || input.experienceMax < 0) return false;
  if (input.experienceMin > 50 || input.experienceMax > 50) return false;
  if (input.experienceMax > 0 && input.experienceMax < input.experienceMin) return false;

  const noticePeriodDays = input.noticePeriodDays ?? 0;

  if (!Number.isInteger(noticePeriodDays) || noticePeriodDays < 0 || noticePeriodDays > 365) {
    return false;
  }

  if (
    !Number.isInteger(input.interviewRounds) ||
    input.interviewRounds < 1 ||
    input.interviewRounds > 10
  ) {
    return false;
  }

  if (!Array.isArray(input.roundConfigs) || input.roundConfigs.length < 1) return false;

  const invalidRound = input.roundConfigs.some(
    (round) =>
      !Number.isInteger(round.round) ||
      round.round < 1 ||
      round.round > input.interviewRounds ||
      !hasMinText(round.label, 1),
  );

  if (invalidRound) return false;

  if (!Number.isFinite(input.closingDate) || input.closingDate <= now) return false;

  return true;
}

export function createCareerPost(input: CareerPostCreateInput): string | null {
  const posts = readCareerPosts();
  const now = Date.now();

  if (!isValidCareerPostCreateInput(input, now)) return null;

  const post: CareerJobPost = {
    ...input,
    id: uid("cjp"),
    createdAt: now,
    updatedAt: now,
    totalApplications: 0,
    shortlisted: 0,
    inInterview: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
  };

  const next = [post, ...posts];
  writeCareerPosts(next);
  syncToEmployeeCareerSearch(next);

  pushCareerActivity({
    postId: post.id,
    kind: "post_created",
    title: "Career post created",
    body: `${post.jobTitle} at ${post.companyName}. Type: ${post.jobType}. Mode: ${post.workMode}.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", post.id),
  });

  return post.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Clone / Duplicate Post
// ─────────────────────────────────────────────────────────────────────────────

export function cloneCareerPost(
  sourcePostId: string,
  overrides?: Partial<CareerJobPost>,
): string | null {
  const source = getCareerPost(sourcePostId);
  if (!source) return null;
  if (source.status !== "closed" && source.status !== "filled") return null;

  const now = Date.now();
  const cloned: CareerJobPost = {
    ...source,
    ...overrides,
    id: uid("cjp"),
    status: "draft",
    createdAt: now,
    updatedAt: now,
    closingDate: getDefaultRepostClosingDate(now),
    clonedFrom: sourcePostId,
    isTemplate: false,
    totalApplications: 0,
    shortlisted: 0,
    inInterview: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
  };

  const posts = readCareerPosts();
  const next = [cloned, ...posts];
  writeCareerPosts(next);
  syncToEmployeeCareerSearch(next);

  pushCareerActivity({
    postId: cloned.id,
    kind: "post_created",
    title: "Career post cloned",
    body: `Cloned from "${source.jobTitle}". New post: ${cloned.jobTitle}.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", cloned.id),
  });

  return cloned.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Save As Template
// ─────────────────────────────────────────────────────────────────────────────

export function saveCareerPostAsTemplate(postId: string, templateName: string): boolean {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return false;

  const next = posts.map((p) =>
    p.id === postId ? { ...p, isTemplate: true, templateName, updatedAt: Date.now() } : p,
  );
  writeCareerPosts(next);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pause Post (active → paused)
// ─────────────────────────────────────────────────────────────────────────────

export function pauseCareerPost(postId: string): boolean {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post || post.status !== "active") return false;

  const next = posts.map((p) =>
    p.id === postId ? { ...p, status: "paused" as const, updatedAt: Date.now() } : p,
  );
  writeCareerPosts(next);
  syncToEmployeeCareerSearch(next);

  pushCareerActivity({
    postId,
    kind: "post_paused",
    title: "Post paused",
    body: `${post.jobTitle} is no longer visible to applicants.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resume Post (paused → active)
// ─────────────────────────────────────────────────────────────────────────────

export function resumeCareerPost(postId: string): boolean {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  const now = Date.now();

  if (!post || post.status !== "paused") return false;
  if (post.closingDate > 0 && post.closingDate <= now) return false;

  const next = posts.map((p) =>
    p.id === postId ? { ...p, status: "active" as const, updatedAt: now } : p,
  );
  writeCareerPosts(next);
  syncToEmployeeCareerSearch(next);

  pushCareerActivity({
    postId,
    kind: "post_resumed",
    title: "Post resumed",
    body: `${post.jobTitle} is visible to applicants again.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Close Post (any non-terminal → closed)
// ─────────────────────────────────────────────────────────────────────────────

export function closeCareerPost(postId: string): boolean {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post || (post.status !== "active" && post.status !== "paused")) return false;

  const now = Date.now();

  const next = posts.map((p) =>
    p.id === postId ? { ...p, status: "closed" as const, updatedAt: now } : p,
  );
  writeCareerPosts(next);
  syncToEmployeeCareerSearch(next);

  pushCareerActivity({
    postId,
    kind: "post_closed",
    title: "Post closed",
    body: `${post.jobTitle} has been closed. No new applications accepted.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  return true;
}
