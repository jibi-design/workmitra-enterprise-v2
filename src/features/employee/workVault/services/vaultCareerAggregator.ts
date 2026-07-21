// src/features/employee/workVault/services/vaultCareerAggregator.ts

import type { VaultWorkExperienceEntry, VaultReference } from "../types/vaultProfileTypes";
import {
  aggregateMiniHRCompleted,
  aggregateMiniHRActive,
  getMiniHRStats,
  detectMiniHREmployment,
} from "./vaultMiniHRAggregator";
import { employeeProfileStorage } from "../../../employee/profile/storage/employeeProfile.storage";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { getVaultCareerHistory } from "../storage/vaultCareerHistory.storage";
import {
  aggregateFullHRActive,
  aggregateFullHRCompleted,
  bool,
  CAREER_APPS_KEY,
  CAREER_POSTS_KEY,
  CAREER_WORKSPACES_KEY,
  EMPLOYMENT_KEY,
  num,
  parse,
  str,
} from "./vaultCareerAggregator.helpers";

export function aggregateCareerExperience(): VaultWorkExperienceEntry[] {
  const fullHRCompleted = aggregateFullHRCompleted();
  const fullHRActive = aggregateFullHRActive();
  const miniHRCompleted = aggregateMiniHRCompleted();
  const miniHRActive = aggregateMiniHRActive();

  const apps = parse<Record<string, unknown>>(CAREER_APPS_KEY);
  const posts = parse<Record<string, unknown>>(CAREER_POSTS_KEY);
  const postMap = new Map<string, Record<string, unknown>>();
  for (const p of posts) {
    const id = str(p, "id");
    if (id) postMap.set(id, p);
  }

  const coveredPostIds = new Set<string>();
  for (const r of parse<Record<string, unknown>>(EMPLOYMENT_KEY)) {
    const pid = str(r, "careerPostId");
    if (pid) coveredPostIds.add(pid);
  }
  const miniStats = getMiniHRStats();
  for (const pid of miniStats.coveredPostIds) coveredPostIds.add(pid);

  const fallbackEntries = apps
    .filter((a) => str(a, "stage") === "hired" && !coveredPostIds.has(str(a, "jobId")))
    .map((app): VaultWorkExperienceEntry => {
      const jobId = str(app, "jobId");
      const post = postMap.get(jobId);
      return {
        jobId,
        companyName: post ? str(post, "companyName") : "Unknown Company",
        jobTitle: post ? str(post, "jobTitle") : "Unknown Position",
        department: post ? str(post, "department") : "",
        location: post ? str(post, "location") : "",
        hiredAt: num(app, "hiredAt") || num(app, "appliedAt"),
        endedAt: null,
        status: "hired",
        employerRating: null,
      };
    });

  const combined = [
    ...fullHRActive,
    ...miniHRActive,
    ...fullHRCompleted,
    ...miniHRCompleted,
    ...fallbackEntries,
  ];

  const seen = new Set<string>();
  const deduped: VaultWorkExperienceEntry[] = [];
  for (const entry of combined) {
    if (!seen.has(entry.jobId)) {
      seen.add(entry.jobId);
      deduped.push(entry);
    }
  }
  return deduped.sort((a, b) => (b.endedAt ?? b.hiredAt) - (a.endedAt ?? a.hiredAt));
}

export function aggregateCareerStats(): {
  totalCareerPositions: number;
  verifiedPositions: number;
  uniqueCompanies: string[];
} {
  const apps = parse<Record<string, unknown>>(CAREER_APPS_KEY);
  const posts = parse<Record<string, unknown>>(CAREER_POSTS_KEY);
  const employment = parse<Record<string, unknown>>(EMPLOYMENT_KEY);
  const postMap = new Map<string, Record<string, unknown>>();
  for (const p of posts) {
    const id = str(p, "id");
    if (id) postMap.set(id, p);
  }

  const hiredApps = apps.filter((a) => str(a, "stage") === "hired");
  const fullHRVerified = employment.filter(
    (r) => str(r, "status") === "exited" && bool(r, "verified"),
  );

  const companies = new Set<string>();
  for (const app of hiredApps) {
    const post = postMap.get(str(app, "jobId"));
    if (post) {
      const name = str(post, "companyName").toLowerCase().trim();
      if (name) companies.add(name);
    }
  }
  for (const r of employment) {
    const name = str(r, "companyName").toLowerCase().trim();
    if (name) companies.add(name);
  }

  const miniStats = getMiniHRStats();
  for (const c of miniStats.companies) companies.add(c);

  return {
    totalCareerPositions: hiredApps.length,
    verifiedPositions: fullHRVerified.length + miniStats.completedCount,
    uniqueCompanies: Array.from(companies),
  };
}

export function aggregateCareerRatings(): {
  ratings: number[];
  ratedCompanies: { companyName: string; rating: number }[];
} {
  const workerMlId = employeeProfileStorage.get().uniqueId?.trim() || "";
  if (!workerMlId) {
    return { ratings: [], ratedCompanies: [] };
  }

  const posts = parse<Record<string, unknown>>(CAREER_POSTS_KEY);
  const postMap = new Map<string, Record<string, unknown>>();
  for (const post of posts) {
    const id = str(post, "id");
    if (id) postMap.set(id, post);
  }

  const ratings: number[] = [];
  const ratedCompanies: { companyName: string; rating: number }[] = [];
  const coveredJobIds = new Set<string>();
  const normalizedWorkerId = workerMlId.toUpperCase();

  for (const entry of getVaultCareerHistory()) {
    if (entry.employeeMlId.trim().toUpperCase() !== normalizedWorkerId) continue;

    const employerRating = entry.employerRating;
    if (typeof employerRating !== "number" || employerRating <= 0) continue;

    ratings.push(employerRating);
    ratedCompanies.push({ companyName: entry.companyName, rating: employerRating });
    coveredJobIds.add(entry.careerPostId);
  }

  for (const rating of ratingStorage.getAllERRatings()) {
    if (rating.domain !== "career" || rating.workerMlId !== workerMlId) continue;
    if (coveredJobIds.has(rating.jobId)) continue;

    ratings.push(rating.stars);
    const post = postMap.get(rating.jobId);
    ratedCompanies.push({
      companyName: post ? str(post, "companyName") || "Employer" : "Employer",
      rating: rating.stars,
    });
  }

  return { ratings, ratedCompanies };
}

export function aggregateCareerReferences(): VaultReference[] {
  return parse<Record<string, unknown>>(EMPLOYMENT_KEY)
    .filter(
      (r) => str(r, "status") === "exited" && bool(r, "verified") && num(r, "employerRating") > 0,
    )
    .map((r): VaultReference => ({
      companyName: str(r, "companyName") || "Unknown Company",
      rating: num(r, "employerRating"),
      source: "career",
    }));
}

export function detectCareerEmploymentStatus(): {
  isEmployed: boolean;
  currentCompany: string;
  currentJobTitle: string;
} {
  const miniHR = detectMiniHREmployment();
  if (miniHR.isEmployed) return miniHR;

  const activeEmp = parse<Record<string, unknown>>(EMPLOYMENT_KEY).find((r) => {
    const s = str(r, "status");
    return s === "active" || s === "probation";
  });
  if (activeEmp) {
    return {
      isEmployed: true,
      currentCompany: str(activeEmp, "companyName"),
      currentJobTitle: str(activeEmp, "jobTitle"),
    };
  }

  const active = parse<Record<string, unknown>>(CAREER_WORKSPACES_KEY).find(
    (w) => str(w, "status") === "active" || str(w, "status") === "onboarding",
  );
  if (active) {
    return {
      isEmployed: true,
      currentCompany: str(active, "companyName"),
      currentJobTitle: str(active, "jobTitle"),
    };
  }
  return { isEmployed: false, currentCompany: "", currentJobTitle: "" };
}
