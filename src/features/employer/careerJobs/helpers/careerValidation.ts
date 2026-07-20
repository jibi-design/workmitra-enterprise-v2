// App name: Job Mitra
// File name: careerValidation.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerValidation.ts

import type {
  CareerApplicationStage,
  CareerJobPost,
  CareerApplication,
} from "../types/careerTypes";

import {
  safeWrite,
  EMPLOYEE_SEARCH_CAREER_KEY,
  type CareerStorageWriteResult,
} from "./careerStorageUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Stage Transition Rules (one-directional, no backwards movement)
// ─────────────────────────────────────────────────────────────────────────────

const VALID_STAGE_TRANSITIONS: Record<CareerApplicationStage, CareerApplicationStage[]> = {
  applied: ["shortlisted", "rejected", "withdrawn"],
  shortlisted: ["interview", "rejected", "withdrawn"],
  interview: ["offered", "rejected", "withdrawn"],
  offered: ["offer_accepted", "rejected", "withdrawn"],
  offer_accepted: ["hired", "rejected", "withdrawn"],
  hired: [],
  rejected: [],
  withdrawn: [],
};

export function canTransition(from: CareerApplicationStage, to: CareerApplicationStage): boolean {
  const allowed = VALID_STAGE_TRANSITIONS[from];
  return allowed !== undefined && allowed.includes(to);
}

// ─────────────────────────────────────────────────────────────────────────────
// Post Analytics Recompute
// ─────────────────────────────────────────────────────────────────────────────

export function recomputePostAnalytics(
  post: CareerJobPost,
  allApps: CareerApplication[],
): CareerJobPost {
  const postApps = allApps.filter((a) => a.jobId === post.id);
  return {
    ...post,
    totalApplications: postApps.length,
    shortlisted: postApps.filter((a) => a.stage === "shortlisted").length,
    inInterview: postApps.filter((a) => a.stage === "interview").length,
    offered: postApps.filter((a) => a.stage === "offered" || a.stage === "offer_accepted").length,
    hired: postApps.filter((a) => a.stage === "hired").length,
    rejected: postApps.filter((a) => a.stage === "rejected").length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync Active Posts to Employee Search
// ─────────────────────────────────────────────────────────────────────────────

export function syncToEmployeeCareerSearch(posts: CareerJobPost[]): CareerStorageWriteResult {
  const now = Date.now();

  const searchable = posts
    .filter((p) => p.status === "active" && (!p.closingDate || p.closingDate >= now))
    .map((p) => ({
      id: p.id,
      companyName: p.companyName,
      jobTitle: p.jobTitle,
      department: p.department,
      jobType: p.jobType,
      workMode: p.workMode,
      location: p.location,
      salaryMin: p.salaryMin,
      salaryMax: p.salaryMax,
      salaryPeriod: p.salaryPeriod,
      experienceMin: p.experienceMin,
      experienceMax: p.experienceMax,
      noticePeriodDays: p.noticePeriodDays,
      qualifications: p.qualifications,
      skills: p.skills,
      description: p.description,
      responsibilities: p.responsibilities,
      interviewRounds: p.interviewRounds,
      closingDate: p.closingDate,
      createdAt: p.createdAt,
      screeningQuestions: p.screeningQuestions ?? [],
    }));

  return safeWrite(EMPLOYEE_SEARCH_CAREER_KEY, searchable);
}
