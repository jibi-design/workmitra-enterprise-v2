// src/features/employee/workVault/services/vaultCareerAggregator.ts
//
// Reads Career Jobs data + Employment Lifecycle from localStorage and returns
// structured Work Vault sections: Work Experience + Stats + Employment Status.
// Sources: Full HR (wm_employment_lifecycle_v1) + Mini-HR (wm_career_employment_v1).
// No writes — pure read-only aggregation.

import type {
  VaultWorkExperienceEntry,
  WorkExperienceStatus,
  VaultReference,
} from "../types/vaultProfileTypes";
import {
  aggregateMiniHRCompleted,
  aggregateMiniHRActive,
  getMiniHRStats,
  detectMiniHREmployment,
} from "./vaultMiniHRAggregator";

/* ── localStorage Keys (read-only) ── */
const CAREER_POSTS_KEY = "wm_employer_career_posts_v1";
const CAREER_APPS_KEY = "wm_employee_career_applications_v1";
const CAREER_WORKSPACES_KEY = "wm_employee_career_workspaces_v1";
const EMPLOYMENT_KEY = "wm_employment_lifecycle_v1";

/* ── Safe Helpers ── */
type Rec = Record<string, unknown>;

function parse<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as T[]) : [];
  } catch { return []; }
}

function str(r: Rec, k: string): string {
  const v = r[k]; return typeof v === "string" ? v : "";
}

function num(r: Rec, k: string): number {
  const v = r[k]; return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function bool(r: Rec, k: string): boolean { return r[k] === true; }

/* ── Full HR → Work Experience ── */
function mapExitReasonToStatus(reason: string): WorkExperienceStatus {
  switch (reason) {
    case "resigned": case "mutual_agreement": return "left";
    case "terminated": case "layoff": return "terminated";
    case "contract_end": return "completed";
    default: return "left";
  }
}

function aggregateFullHRCompleted(): VaultWorkExperienceEntry[] {
  return parse<Rec>(EMPLOYMENT_KEY)
    .filter((r) => str(r, "status") === "exited" && bool(r, "verified"))
    .map((r): VaultWorkExperienceEntry => ({
      jobId: str(r, "careerPostId") || str(r, "id"),
      companyName: str(r, "companyName") || "Unknown Company",
      jobTitle: str(r, "jobTitle") || "Unknown Position",
      department: str(r, "department"),
      location: str(r, "location"),
      hiredAt: num(r, "joinedAt"),
      endedAt: num(r, "exitedAt") || null,
      status: mapExitReasonToStatus(str(r, "exitReason")),
      employerRating: num(r, "employerRating") || null,
    }))
    .sort((a, b) => (b.endedAt ?? b.hiredAt) - (a.endedAt ?? a.hiredAt));
}

function aggregateFullHRActive(): VaultWorkExperienceEntry[] {
  return parse<Rec>(EMPLOYMENT_KEY)
    .filter((r) => {
      const s = str(r, "status");
      return s === "active" || s === "probation" || s === "resignation_pending" || s === "notice_period";
    })
    .map((r): VaultWorkExperienceEntry => ({
      jobId: str(r, "careerPostId") || str(r, "id"),
      companyName: str(r, "companyName") || "Unknown Company",
      jobTitle: str(r, "jobTitle") || "Unknown Position",
      department: str(r, "department"),
      location: str(r, "location"),
      hiredAt: num(r, "joinedAt"),
      endedAt: null,
      status: "hired",
      employerRating: null,
    }))
    .sort((a, b) => b.hiredAt - a.hiredAt);
}

/* ── Work Experience (Section 3) — Full HR + Mini-HR + Fallback ── */
export function aggregateCareerExperience(): VaultWorkExperienceEntry[] {
  const fullHRCompleted = aggregateFullHRCompleted();
  const fullHRActive = aggregateFullHRActive();
  const miniHRCompleted = aggregateMiniHRCompleted();
  const miniHRActive = aggregateMiniHRActive();

  const apps = parse<Rec>(CAREER_APPS_KEY);
  const posts = parse<Rec>(CAREER_POSTS_KEY);
  const postMap = new Map<string, Rec>();
  for (const p of posts) { const id = str(p, "id"); if (id) postMap.set(id, p); }

  // Collect careerPostIds covered by Full HR + Mini-HR
  const coveredPostIds = new Set<string>();
  for (const r of parse<Rec>(EMPLOYMENT_KEY)) {
    const pid = str(r, "careerPostId"); if (pid) coveredPostIds.add(pid);
  }
  const miniStats = getMiniHRStats();
  for (const pid of miniStats.coveredPostIds) coveredPostIds.add(pid);

  // Fallback: hired apps not tracked in any employment system
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
        status: "hired" as WorkExperienceStatus,
        employerRating: null,
      };
    });

  // Combine: Full HR first (priority), then Mini-HR, then fallback
  const combined = [
    ...fullHRActive, ...miniHRActive,
    ...fullHRCompleted, ...miniHRCompleted,
    ...fallbackEntries,
  ];

  // Deduplicate by jobId — first occurrence wins (Full HR priority)
  const seen = new Set<string>();
  const deduped: VaultWorkExperienceEntry[] = [];
  for (const entry of combined) {
    if (!seen.has(entry.jobId)) { seen.add(entry.jobId); deduped.push(entry); }
  }
  return deduped.sort((a, b) => (b.endedAt ?? b.hiredAt) - (a.endedAt ?? a.hiredAt));
}

/* ── Career Stats (Section 4) ── */
export function aggregateCareerStats(): {
  totalCareerPositions: number;
  verifiedPositions: number;
  uniqueCompanies: string[];
} {
  const apps = parse<Rec>(CAREER_APPS_KEY);
  const posts = parse<Rec>(CAREER_POSTS_KEY);
  const employment = parse<Rec>(EMPLOYMENT_KEY);
  const postMap = new Map<string, Rec>();
  for (const p of posts) { const id = str(p, "id"); if (id) postMap.set(id, p); }

  const hiredApps = apps.filter((a) => str(a, "stage") === "hired");
  const fullHRVerified = employment.filter((r) => str(r, "status") === "exited" && bool(r, "verified"));

  const companies = new Set<string>();
  for (const app of hiredApps) {
    const post = postMap.get(str(app, "jobId"));
    if (post) { const name = str(post, "companyName").toLowerCase().trim(); if (name) companies.add(name); }
  }
  for (const r of employment) {
    const name = str(r, "companyName").toLowerCase().trim(); if (name) companies.add(name);
  }

  // Merge Mini-HR stats
  const miniStats = getMiniHRStats();
  for (const c of miniStats.companies) companies.add(c);

  return {
    totalCareerPositions: hiredApps.length,
    verifiedPositions: fullHRVerified.length + miniStats.completedCount,
    uniqueCompanies: Array.from(companies),
  };
}

/* ── Career References (Full HR verified exits with ratings) ── */
// TODO: Add Mini-HR completed records with ratings when rating
// integration is built. Currently employerRating=null — Full HR only.
export function aggregateCareerReferences(): VaultReference[] {
  return parse<Rec>(EMPLOYMENT_KEY)
    .filter((r) => str(r, "status") === "exited" && bool(r, "verified") && num(r, "employerRating") > 0)
    .map((r): VaultReference => ({
      companyName: str(r, "companyName") || "Unknown Company",
      rating: num(r, "employerRating"),
      source: "career",
    }));
}

/* ── Auto-detect Employment Status (Section 2) ── */
export function detectCareerEmploymentStatus(): {
  isEmployed: boolean;
  currentCompany: string;
  currentJobTitle: string;
} {
  // Mini-HR check first (Session 17 — most current source)
  const miniHR = detectMiniHREmployment();
  if (miniHR.isEmployed) return miniHR;

  // Full HR check
  const activeEmp = parse<Rec>(EMPLOYMENT_KEY).find((r) => {
    const s = str(r, "status"); return s === "active" || s === "probation";
  });
  if (activeEmp) {
    return { isEmployed: true, currentCompany: str(activeEmp, "companyName"), currentJobTitle: str(activeEmp, "jobTitle") };
  }

  // Fallback: career workspaces
  const active = parse<Rec>(CAREER_WORKSPACES_KEY).find(
    (w) => str(w, "status") === "active" || str(w, "status") === "onboarding",
  );
  if (active) {
    return { isEmployed: true, currentCompany: str(active, "companyName"), currentJobTitle: str(active, "jobTitle") };
  }
  return { isEmployed: false, currentCompany: "", currentJobTitle: "" };
}