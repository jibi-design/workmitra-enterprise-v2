// careerPostService.create.ts — Create, clone, template operations

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  buildServerPostCreateBody,
  mergeServerPostIntoLsCache,
} from "../../../career/services/careerPostDbTruth.service";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
} from "../../../career/services/careerGateApi.service";
import type { CareerJobPost } from "../types/careerTypes";
import { uid } from "../helpers/careerStorageUtils";
import { readCareerPosts, writeCareerPosts } from "../helpers/careerNormalizers";
import { pushCareerActivity } from "../helpers/careerNotifications";
import { syncToEmployeeCareerSearch } from "../helpers/careerValidation";
import { getCareerPost } from "./careerPostService.read";

export type CareerPostCreateInput = Omit<
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

export function getDefaultRepostClosingDate(now: number): number {
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

export async function createCareerPost(input: CareerPostCreateInput): Promise<string | null> {
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

  const prior = posts;
  const next = [post, ...posts];
  const writeResult = writeCareerPosts(next);
  if (!writeResult.ok) return null;

  const searchWrite = syncToEmployeeCareerSearch(next);
  if (!searchWrite.ok) {
    writeCareerPosts(prior);
    return null;
  }

  if (isCareerApiSyncEnabled()) {
    try {
      const dto = await careerGateApi.createCareerPost(buildServerPostCreateBody(post));
      const merged = mergeServerPostIntoLsCache(dto, post.id);
      const finalId = merged?.id ?? post.id;
      syncToEmployeeCareerSearch(readCareerPosts());

      pushCareerActivity({
        postId: finalId,
        kind: "post_created",
        title: "Career post created",
        body: `${post.jobTitle} at ${post.companyName}. Type: ${post.jobType}. Mode: ${post.workMode}.`,
        route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", finalId),
      });

      return finalId;
    } catch {
      const rollback = writeCareerPosts(prior);
      if (rollback.ok) {
        syncToEmployeeCareerSearch(prior);
      }
      return null;
    }
  }

  pushCareerActivity({
    postId: post.id,
    kind: "post_created",
    title: "Career post created",
    body: `${post.jobTitle} at ${post.companyName}. Type: ${post.jobType}. Mode: ${post.workMode}.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", post.id),
  });

  return post.id;
}

export async function cloneCareerPost(
  sourcePostId: string,
  overrides?: Partial<CareerJobPost>,
): Promise<string | null> {
  const source = getCareerPost(sourcePostId);
  if (!source) return null;
  if (source.status !== "closed" && source.status !== "filled") return null;

  const now = Date.now();
  const merged = { ...source, ...overrides };

  return createCareerPost({
    employerId: merged.employerId,
    companyName: merged.companyName,
    jobTitle: merged.jobTitle,
    department: merged.department,
    jobType: merged.jobType,
    workMode: merged.workMode,
    location: merged.location,
    vacancies: merged.vacancies,
    probationPeriod: merged.probationPeriod,
    salaryMin: merged.salaryMin,
    salaryMax: merged.salaryMax,
    salaryPeriod: merged.salaryPeriod,
    noticePeriodDays: merged.noticePeriodDays,
    experienceMin: merged.experienceMin,
    experienceMax: merged.experienceMax,
    qualifications: merged.qualifications,
    skills: merged.skills,
    description: merged.description,
    responsibilities: merged.responsibilities,
    interviewRounds: merged.interviewRounds,
    roundConfigs: merged.roundConfigs,
    status: "draft",
    closingDate: getDefaultRepostClosingDate(now),
    screeningQuestions: merged.screeningQuestions,
    isTemplate: false,
    clonedFrom: sourcePostId,
  });
}

export function saveCareerPostAsTemplate(postId: string, templateName: string): boolean {
  const posts = readCareerPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return false;

  const next = posts.map((p) =>
    p.id === postId ? { ...p, isTemplate: true, templateName, updatedAt: Date.now() } : p,
  );
  const writeResult = writeCareerPosts(next);
  return writeResult.ok;
}
