/** Pro Candidate (Employee) dashboard — derived metrics from career/vault/profile SoT. */

import type { AppLite } from "../../careerJobs/types/careerApplicationTypes";
import type { CareerSearchPost } from "../../careerJobs/helpers/careerSearchTypes";
import type { EmployeeProfile } from "../../profile/storage/employeeProfile.storage";
import { getProfileCompletion } from "../../profile/services/profileCompletionService";
import type { VaultDocument } from "../../workVault/types/vaultTypes";

export type CandidateMetricKey = "applied" | "shortlisted" | "interviews" | "saved";

export type CandidateMetrics = Record<CandidateMetricKey, number>;

export type CandidatePipelineStatus = "In Review" | "Shortlisted" | "Interview" | "Offer" | "Closed";

export type CandidatePipelineRow = {
  readonly id: string;
  readonly jobId: string;
  readonly title: string;
  readonly company: string;
  readonly status: CandidatePipelineStatus;
  readonly updatedAt: number;
};

export type CandidateRecommendation = {
  readonly postId: string;
  readonly title: string;
  readonly company: string;
  readonly location: string;
  readonly matchPercent: number;
};

export type ProfileCompleteness = {
  readonly percent: number;
  readonly missing: readonly string[];
  readonly filled: number;
  readonly total: number;
};

export type VaultQuickDoc = {
  readonly id: string;
  readonly folderId: string;
  readonly name: string;
  readonly fileType: string;
  readonly uploadedAt: number;
};

const CLOSED_STAGES = new Set(["rejected", "withdrawn", "hired", "offer_declined"]);

export function mapApplicationStatus(stage: string): CandidatePipelineStatus {
  const s = stage.toLowerCase();
  if (s.includes("interview") || s === "interview") return "Interview";
  if (s.includes("shortlist")) return "Shortlisted";
  if (s.includes("offer") || s === "hired") return "Offer";
  if (CLOSED_STAGES.has(s)) return "Closed";
  return "In Review";
}

export function computeCandidateMetrics(
  apps: readonly AppLite[],
  savedCount: number,
): CandidateMetrics {
  let shortlisted = 0;
  let interviews = 0;
  for (const app of apps) {
    const stage = String(app.stage ?? "").toLowerCase();
    if (stage.includes("shortlist")) shortlisted += 1;
    if (stage.includes("interview") || (app.totalScheduled ?? 0) > 0) interviews += 1;
  }
  return {
    applied: apps.length,
    shortlisted,
    interviews,
    saved: savedCount,
  };
}

export function buildPipelineRows(
  apps: readonly AppLite[],
  postsById: ReadonlyMap<string, CareerSearchPost>,
  limit = 8,
): CandidatePipelineRow[] {
  return [...apps]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
    .map((app) => {
      const post = postsById.get(app.jobId);
      return {
        id: app.id,
        jobId: app.jobId,
        title: post?.jobTitle?.trim() || app.offerDetails?.jobTitle?.trim() || "Career role",
        company: post?.companyName?.trim() || "Employer",
        status: mapApplicationStatus(String(app.stage)),
        updatedAt: app.updatedAt,
      };
    });
}

export function computeMatchPercent(profile: EmployeeProfile, post: CareerSearchPost): number {
  const skills = profile.skills.map((s) => s.trim().toLowerCase()).filter(Boolean);
  const postSkills = (post.skills ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (skills.length === 0 || postSkills.length === 0) {
    return profile.preferCareerJobs ? 42 : 28;
  }
  const skillSet = new Set(skills);
  let hits = 0;
  for (const s of postSkills) {
    if (skillSet.has(s)) hits += 1;
  }
  const skillScore = Math.round((hits / postSkills.length) * 70);
  const cityBonus =
    profile.city.trim() &&
    post.location.toLowerCase().includes(profile.city.trim().toLowerCase())
      ? 15
      : 0;
  const preferenceBonus = profile.preferCareerJobs ? 10 : 0;
  return Math.min(99, Math.max(18, skillScore + cityBonus + preferenceBonus));
}

export function buildRecommendations(
  profile: EmployeeProfile,
  posts: readonly CareerSearchPost[],
  appliedJobIds: ReadonlySet<string>,
  limit = 5,
): CandidateRecommendation[] {
  return posts
    .filter((p) => !appliedJobIds.has(p.id))
    .map((post) => ({
      postId: post.id,
      title: post.jobTitle,
      company: post.companyName,
      location: post.location,
      matchPercent: computeMatchPercent(profile, post),
    }))
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, limit);
}

export function computeProfileCompleteness(profile: EmployeeProfile): ProfileCompleteness {
  // Single SoT with Profile page checklist (counts only → percent for teaser).
  void profile;
  const status = getProfileCompletion();
  return {
    percent: status.totalCount
      ? Math.round((status.doneCount / status.totalCount) * 100)
      : 0,
    missing: status.missingLabels,
    filled: status.doneCount,
    total: status.totalCount,
  };
}

export function mapVaultQuickDocs(docs: readonly VaultDocument[], limit = 5): VaultQuickDoc[] {
  return [...docs]
    .sort((a, b) => b.uploadedAt - a.uploadedAt)
    .slice(0, limit)
    .map((d) => ({
      id: d.id,
      folderId: d.folderId,
      name: d.name,
      fileType: d.fileType,
      uploadedAt: d.uploadedAt,
    }));
}

export function formatRelativeDay(ts: number): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
