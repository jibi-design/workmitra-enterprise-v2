// src/features/employee/workVault/services/vaultMiniHRAggregator.ts
// Session 17: Aggregates Career Jobs Mini-HR employment data for Work Vault.
// Read-only — no writes. Source: wm_career_employment_v1 (Session 17 mini-HR).
// Consumed by vaultCareerAggregator.ts — never imported directly by components.

import type { VaultWorkExperienceEntry, WorkExperienceStatus } from "../types/vaultProfileTypes";

/* ── Storage Key (Mini-HR — Session 17) ── */
const MINI_HR_KEY = "wm_career_employment_v1";

/* ── Safe Helpers ── */
type Rec = Record<string, unknown>;

function parseRecords(): Rec[] {
  try {
    const raw = localStorage.getItem(MINI_HR_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as Rec[]) : [];
  } catch { return []; }
}

function str(r: Rec, k: string): string {
  const v = r[k]; return typeof v === "string" ? v : "";
}

function num(r: Rec, k: string): number {
  const v = r[k]; return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/* ── Exit Type → Vault Work Experience Status ── */
function mapExitType(exitType: string): WorkExperienceStatus {
  if (exitType === "terminated") return "terminated";
  if (exitType === "resigned") return "left";
  return "completed";
}

/* ── Completed Records → Work History Entries ── */
export function aggregateMiniHRCompleted(): VaultWorkExperienceEntry[] {
  return parseRecords()
    .filter((r) => str(r, "status") === "completed")
    .map((r): VaultWorkExperienceEntry => ({
      jobId: str(r, "careerPostId") || str(r, "id"),
      companyName: str(r, "companyName") || "Unknown Company",
      jobTitle: str(r, "jobTitle") || "Unknown Position",
      department: str(r, "department"),
      location: "",
      hiredAt: num(r, "joinedAt") || num(r, "acceptedAt"),
      endedAt: num(r, "completedAt") || null,
      status: mapExitType(str(r, "exitType")),
      employerRating: null,
    }))
    .sort((a, b) => (b.endedAt ?? b.hiredAt) - (a.endedAt ?? a.hiredAt));
}

/* ── Active Records → Current Employment Entries ── */
export function aggregateMiniHRActive(): VaultWorkExperienceEntry[] {
  return parseRecords()
    .filter((r) => {
      const s = str(r, "status");
      return s === "working" || s === "notice";
    })
    .map((r): VaultWorkExperienceEntry => ({
      jobId: str(r, "careerPostId") || str(r, "id"),
      companyName: str(r, "companyName") || "Unknown Company",
      jobTitle: str(r, "jobTitle") || "Unknown Position",
      department: str(r, "department"),
      location: "",
      hiredAt: num(r, "joinedAt") || num(r, "acceptedAt"),
      endedAt: null,
      status: "hired",
      employerRating: null,
    }))
    .sort((a, b) => b.hiredAt - a.hiredAt);
}

/* ── Stats Helper (for aggregateCareerStats merge) ── */
export function getMiniHRStats(): {
  completedCount: number;
  coveredPostIds: Set<string>;
  companies: Set<string>;
} {
  const records = parseRecords();
  const coveredPostIds = new Set<string>();
  const companies = new Set<string>();
  let completedCount = 0;

  for (const r of records) {
    const postId = str(r, "careerPostId");
    if (postId) coveredPostIds.add(postId);
    const name = str(r, "companyName").toLowerCase().trim();
    if (name) companies.add(name);
    if (str(r, "status") === "completed") completedCount++;
  }

  return { completedCount, coveredPostIds, companies };
}

/* ── Employment Status Detection ── */
export function detectMiniHREmployment(): {
  isEmployed: boolean;
  currentCompany: string;
  currentJobTitle: string;
} {
  const active = parseRecords().find((r) => {
    const s = str(r, "status");
    return s === "working" || s === "notice";
  });

  if (active) {
    return {
      isEmployed: true,
      currentCompany: str(active, "companyName"),
      currentJobTitle: str(active, "jobTitle"),
    };
  }
  return { isEmployed: false, currentCompany: "", currentJobTitle: "" };
}