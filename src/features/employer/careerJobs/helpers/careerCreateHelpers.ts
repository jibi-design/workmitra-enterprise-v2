// App name: Job Mitra
// File name: careerCreateHelpers.ts
// Career create/publish helpers — duplicate detection and display formatting.

import type {
  CareerJobPost,
  CareerJobType,
  CareerSalaryPeriod,
  CareerWorkMode,
} from "../types/careerTypes";

export type CareerDuplicateWarning = {
  id: string;
  jobTitle: string;
  companyName: string;
  department: string;
  location: string;
  jobType: CareerJobType;
  reason: string;
};

type DuplicateCareerCandidate = {
  jobTitle: string;
  companyName: string;
  department: string;
  jobType: CareerJobType;
  workMode: CareerWorkMode;
  location: string;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isPlaceholderDepartment(value: string): boolean {
  const normalized = normalizeText(value);
  return (
    normalized === "" ||
    normalized === "department" ||
    normalized === "other" ||
    normalized === "general"
  );
}

function resolveCareerLocation(workMode: CareerWorkMode, location: string): string {
  if (workMode === "remote") return "remote";
  return normalizeText(location);
}

function isSameCareerLocation(
  postWorkMode: CareerWorkMode,
  postLocationRaw: string,
  candidateWorkMode: CareerWorkMode,
  candidateLocationRaw: string,
): boolean {
  const postLocation = resolveCareerLocation(postWorkMode, postLocationRaw);
  const candidateLocation = resolveCareerLocation(candidateWorkMode, candidateLocationRaw);

  if (postLocation === "remote" && candidateLocation === "remote") return true;
  if (!postLocation || !candidateLocation) return false;

  return postLocation.includes(candidateLocation) || candidateLocation.includes(postLocation);
}

function formatJobTypeLabel(jobType: CareerJobType): string {
  if (jobType === "full-time") return "Full-time";
  if (jobType === "part-time") return "Part-time";
  return "Contract";
}

function formatWorkModeLabel(workMode: CareerWorkMode): string {
  if (workMode === "remote") return "Remote";
  if (workMode === "hybrid") return "Hybrid";
  return "On-site";
}

export function formatCareerJobType(jobType: CareerJobType): string {
  return formatJobTypeLabel(jobType);
}

export function formatCareerWorkMode(workMode: CareerWorkMode): string {
  return formatWorkModeLabel(workMode);
}

export function formatCareerSalaryDisplay(
  salaryMin: number,
  salaryMax: number,
  salaryPeriod: CareerSalaryPeriod,
): string {
  if (salaryMin <= 0 && salaryMax <= 0) return "Not disclosed";

  const periodLabel = salaryPeriod === "yearly" ? "yr" : "mo";
  const minLabel = salaryMin > 0 ? salaryMin.toLocaleString() : "—";
  const maxLabel = salaryMax > 0 ? salaryMax.toLocaleString() : minLabel;

  if (minLabel === maxLabel) return `₹${minLabel}/${periodLabel}`;
  return `₹${minLabel} – ₹${maxLabel}/${periodLabel}`;
}

const ACTIVE_POST_STATUSES = new Set<CareerJobPost["status"]>(["draft", "active", "paused"]);

export function findDuplicateCareerWarnings(
  posts: CareerJobPost[],
  candidate: DuplicateCareerCandidate,
): CareerDuplicateWarning[] {
  const jobTitle = normalizeText(candidate.jobTitle);
  const companyName = normalizeText(candidate.companyName);
  const candidateDepartment = normalizeText(candidate.department);

  if (!jobTitle || !companyName) return [];

  return posts
    .filter((post) => ACTIVE_POST_STATUSES.has(post.status))
    .filter((post) => {
      const sameTitle = normalizeText(post.jobTitle) === jobTitle;
      const sameCompany = normalizeText(post.companyName) === companyName;
      const sameJobType = post.jobType === candidate.jobType;
      const sameLocation = isSameCareerLocation(
        post.workMode,
        post.location,
        candidate.workMode,
        candidate.location,
      );

      if (!sameTitle || !sameCompany || !sameJobType || !sameLocation) return false;

      const postDepartment = normalizeText(post.department);
      const sameDepartment = postDepartment === candidateDepartment;
      const departmentNotReliable =
        isPlaceholderDepartment(postDepartment) || isPlaceholderDepartment(candidateDepartment);

      return sameDepartment || departmentNotReliable;
    })
    .slice(0, 3)
    .map((post) => {
      const postDepartment = normalizeText(post.department);
      const sameDepartment = postDepartment === candidateDepartment;
      const departmentNotReliable =
        isPlaceholderDepartment(postDepartment) || isPlaceholderDepartment(candidateDepartment);

      const locationLabel =
        post.workMode === "remote" ? "Remote" : post.location.trim() || "Location not set";

      return {
        id: post.id,
        jobTitle: post.jobTitle,
        companyName: post.companyName,
        department: post.department.trim() || "Department not set",
        location: locationLabel,
        jobType: post.jobType,
        reason:
          sameDepartment && !departmentNotReliable
            ? "Similar active career job already exists for the same title, company, department, location, and job type."
            : "Similar active career job already exists for the same title, company, location, and job type. Department was not reliable enough to ignore it.",
      };
    });
}
