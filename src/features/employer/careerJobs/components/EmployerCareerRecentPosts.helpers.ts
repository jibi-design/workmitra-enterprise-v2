import type { CareerJobPost } from "../types/careerTypes";

export function formatDisplayTitle(value: string): string {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function formatJobType(value: CareerJobPost["jobType"]): string {
  if (value === "full-time") return "Full-time";
  if (value === "part-time") return "Part-time";
  return "Contract";
}

export function formatWorkMode(value: CareerJobPost["workMode"]): string {
  if (value === "on-site") return "On-site";
  if (value === "remote") return "Remote";
  return "Hybrid";
}

export function formatSalary(post: CareerJobPost): string {
  const period = post.salaryPeriod === "yearly" ? "Annual" : "Monthly";

  if (post.salaryMin <= 0 && post.salaryMax <= 0) return `Not specified (${period})`;

  const max = post.salaryMax > 0 ? post.salaryMax : post.salaryMin;

  if (post.salaryMin === max) {
    return `${post.salaryMin.toLocaleString()} (${period})`;
  }

  return `${post.salaryMin.toLocaleString()} - ${max.toLocaleString()} (${period})`;
}

export function formatExperience(post: CareerJobPost): string {
  if (post.experienceMin <= 0 && post.experienceMax <= 0) return "Fresher / Any";

  if (post.experienceMin === post.experienceMax) {
    return `${post.experienceMin} year${post.experienceMin === 1 ? "" : "s"}`;
  }

  return `${post.experienceMin} - ${post.experienceMax} years`;
}

export function formatClosingDate(value: number): string {
  if (!value) return "No closing date";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "No closing date";
  }
}

export type EmployerCareerRecentPostsProps = {
  posts: CareerJobPost[];
  onOpenPost: (postId: string) => void;
  onCreate: () => void;
};
