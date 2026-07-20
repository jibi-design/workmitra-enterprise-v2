// App name: Job Mitra
// File name: careerSearchFilters.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerSearchFilters.ts

import {
  normalizeExperienceRange,
  normalizeNoticePeriod,
  normalizeSalaryRange,
} from "./careerSearchSanitizers";
import type {
  CareerSearchPost,
  ExperienceFilter,
  JobTypeFilter,
  WorkModeFilter,
} from "./careerSearchTypes";

export function filterCareerPosts(
  posts: CareerSearchPost[],
  query: string,
  jobType: JobTypeFilter,
  workMode: WorkModeFilter,
  experience: ExperienceFilter,
  department: string,
  locationQuery = "",
): CareerSearchPost[] {
  const q = query.trim().toLowerCase();
  const loc = locationQuery.trim().toLowerCase();

  return posts.filter((p) => {
    if (q) {
      const hay =
        `${p.jobTitle} ${p.companyName} ${p.location} ${p.department} ${p.skills.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (loc) {
      const locationHay = `${p.location}`.toLowerCase();
      if (!locationHay.includes(loc)) return false;
    }

    if (jobType !== "any" && p.jobType !== jobType) return false;
    if (workMode !== "any" && p.workMode !== workMode) return false;
    if (department !== "any" && p.department !== department) return false;

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

export function fmtSalaryRange(min: number, max: number, period: string): string {
  const salary = normalizeSalaryRange(min, max);
  const periodLabel = period === "yearly" ? "Annual" : period === "monthly" ? "Monthly" : period;

  if (salary.min === 0 && salary.max === 0) return "Pay not specified";
  if (salary.min === salary.max) return `${salary.min.toLocaleString()} (${periodLabel})`;
  return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} (${periodLabel})`;
}

export function fmtExperience(min: number, max: number): string {
  const experience = normalizeExperienceRange(min, max);

  if (experience.min === 0 && experience.max === 0) return "Fresher welcome";
  if (experience.min === experience.max)
    return `${experience.min} year${experience.min > 1 ? "s" : ""}`;
  return `${experience.min} - ${experience.max} years`;
}

export function fmtNoticePeriod(days: number | undefined): string {
  const safeDays = normalizeNoticePeriod(days);

  if (safeDays === undefined) return "Not specified";
  if (safeDays <= 0) return "No notice";
  if (safeDays === 1) return "1 day";
  return `${safeDays} days`;
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
