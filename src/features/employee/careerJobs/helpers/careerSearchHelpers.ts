// src/features/employee/careerJobs/helpers/careerSearchHelpers.ts
//
// Read synced career posts from employee search key.
// Cached snapshot + subscription for useSyncExternalStore.
// Filter helpers for search page.

// ─────────────────────────────────────────────────────────────────────────────
// Search Post Type (subset synced by employer via syncToEmployeeCareerSearch)
// ─────────────────────────────────────────────────────────────────────────────

export type CareerSearchPost = {
  id: string;
  companyName: string;
  jobTitle: string;
  department: string;
  jobType: "full-time" | "part-time" | "contract";
  workMode: "on-site" | "remote" | "hybrid";
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: "monthly" | "yearly";
  experienceMin: number;
  experienceMax: number;
  qualifications: string[];
  skills: string[];
  description: string;
  responsibilities: string[];
  interviewRounds: number;
  closingDate: number;
  createdAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage Key & Events
// ─────────────────────────────────────────────────────────────────────────────

const SEARCH_KEY = "wm_employee_career_posts_search_v1";
const CAREER_POSTS_CHANGED = "wm:employer-career-posts-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Safe Parser
// ─────────────────────────────────────────────────────────────────────────────

type Rec = Record<string, unknown>;

function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function str(r: Rec, k: string): string | undefined {
  const v = r[k];
  return typeof v === "string" ? v : undefined;
}

function num(r: Rec, k: string): number | undefined {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function strArr(r: Rec, k: string): string[] {
  const v = r[k];
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function clampJobType(x: unknown): CareerSearchPost["jobType"] {
  if (x === "full-time" || x === "part-time" || x === "contract") return x;
  return "full-time";
}

function clampWorkMode(x: unknown): CareerSearchPost["workMode"] {
  if (x === "on-site" || x === "remote" || x === "hybrid") return x;
  return "on-site";
}

function clampSalaryPeriod(x: unknown): CareerSearchPost["salaryPeriod"] {
  if (x === "monthly" || x === "yearly") return x;
  return "monthly";
}

function parseSearchPosts(raw: string | null): CareerSearchPost[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: CareerSearchPost[] = [];
    for (const item of parsed) {
      if (!isRec(item)) continue;
      const id = str(item, "id");
      const companyName = str(item, "companyName");
      const jobTitle = str(item, "jobTitle");
      if (!id || !companyName || !jobTitle) continue;
      out.push({
        id,
        companyName,
        jobTitle,
        department: str(item, "department") ?? "",
        jobType: clampJobType(item["jobType"]),
        workMode: clampWorkMode(item["workMode"]),
        location: str(item, "location") ?? "",
        salaryMin: num(item, "salaryMin") ?? 0,
        salaryMax: num(item, "salaryMax") ?? 0,
        salaryPeriod: clampSalaryPeriod(item["salaryPeriod"]),
        experienceMin: num(item, "experienceMin") ?? 0,
        experienceMax: num(item, "experienceMax") ?? 0,
        qualifications: strArr(item, "qualifications"),
        skills: strArr(item, "skills"),
        description: str(item, "description") ?? "",
        responsibilities: strArr(item, "responsibilities"),
        interviewRounds: num(item, "interviewRounds") ?? 1,
        closingDate: num(item, "closingDate") ?? 0,
        createdAt: num(item, "createdAt") ?? 0,
      });
    }
    return out.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cached Snapshot
// ─────────────────────────────────────────────────────────────────────────────

let cacheRaw: string | null = null;
let cacheList: CareerSearchPost[] = [];

export function getCareerSearchSnapshot(): CareerSearchPost[] {
  const raw = localStorage.getItem(SEARCH_KEY);
  if (raw === cacheRaw) return cacheList;
  cacheRaw = raw;
  cacheList = parseSearchPosts(raw);
  return cacheList;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription
// ─────────────────────────────────────────────────────────────────────────────

export function subscribeCareerSearch(cb: () => void): () => void {
  const handler = () => cb();
  const events = ["storage", "focus", CAREER_POSTS_CHANGED];
  for (const ev of events) window.addEventListener(ev, handler);
  document.addEventListener("visibilitychange", handler);
  return () => {
    for (const ev of events) window.removeEventListener(ev, handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Types
// ─────────────────────────────────────────────────────────────────────────────

export type JobTypeFilter = "any" | "full-time" | "part-time" | "contract";
export type WorkModeFilter = "any" | "on-site" | "remote" | "hybrid";
export type ExperienceFilter = "any" | "0-1" | "1-3" | "3-7" | "7+";

// ─────────────────────────────────────────────────────────────────────────────
// Filter Logic
// ─────────────────────────────────────────────────────────────────────────────

export function filterCareerPosts(
  posts: CareerSearchPost[],
  query: string,
  jobType: JobTypeFilter,
  workMode: WorkModeFilter,
  experience: ExperienceFilter,
  department: string,
): CareerSearchPost[] {
  const q = query.trim().toLowerCase();

  return posts.filter((p) => {
    // Text search
    if (q) {
      const hay = `${p.jobTitle} ${p.companyName} ${p.location} ${p.department} ${p.skills.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // Job type
    if (jobType !== "any" && p.jobType !== jobType) return false;

    // Work mode
    if (workMode !== "any" && p.workMode !== workMode) return false;

    // Department
    if (department !== "any" && p.department !== department) return false;

    // Experience
    if (experience !== "any") {
      const minYears = experienceFilterToMin(experience);
      const maxYears = experienceFilterToMax(experience);
      if (p.experienceMin > maxYears || p.experienceMax < minYears) return false;
    }

    return true;
  });
}

function experienceFilterToMin(f: ExperienceFilter): number {
  if (f === "0-1") return 0;
  if (f === "1-3") return 1;
  if (f === "3-7") return 3;
  if (f === "7+") return 7;
  return 0;
}

function experienceFilterToMax(f: ExperienceFilter): number {
  if (f === "0-1") return 1;
  if (f === "1-3") return 3;
  if (f === "3-7") return 7;
  if (f === "7+") return 99;
  return 99;
}

// ─────────────────────────────────────────────────────────────────────────────
// Format Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function fmtSalaryRange(min: number, max: number, period: string): string {
  if (min === 0 && max === 0) return "Not specified";
  if (min === max) return `${min.toLocaleString()} / ${period}`;
  return `${min.toLocaleString()} - ${max.toLocaleString()} / ${period}`;
}

export function fmtExperience(min: number, max: number): string {
  if (min === 0 && max === 0) return "Fresher welcome";
  if (min === max) return `${min} year${min > 1 ? "s" : ""}`;
  return `${min} - ${max} years`;
}

export function fmtJobType(t: string): string {
  if (t === "full-time") return "Full-time";
  if (t === "part-time") return "Part-time";
  if (t === "contract") return "Contract";
  return t;
}

export function fmtWorkMode(m: string): string {
  if (m === "on-site") return "On-site";
  if (m === "remote") return "Remote";
  if (m === "hybrid") return "Hybrid";
  return m;
}