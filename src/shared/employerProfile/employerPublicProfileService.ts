// src/shared/employerProfile/employerPublicProfileService.ts
//
// Employer public profile aggregation service.
// Data source for: search cards, Vault "Verify Employer", workspace pages.
// Combines: employer settings + ratings + shift/career post data.

import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";
import { getEmployerBusinessKey } from "../../features/employer/company/helpers/employerDualId.helpers";
import {
  computeVerificationLevel,
  VERIFICATION_LEVEL_LABELS,
} from "../../features/employer/company/helpers/employerIdentity.helpers";
import { ratingStorage } from "../rating/ratingStorage";
import { isPublicReputationDomain } from "../rating/plannerRating.helpers";
import { employerShiftStorage } from "../../features/employer/shiftJobs/storage/employerShift.storage";
import { getCareerPosts } from "../../features/employer/careerJobs/services/careerPostService";
import type { WorkerEmployerTag } from "../rating/ratingTypes";

/* ── Star reputation tier (NOT identity/business verification) ── */

export type EmployerReputationTier = "new" | "established" | "trusted" | "proven";

/** @deprecated Use EmployerReputationTier — kept as alias for gradual migration. */
export type EmployerLevel = EmployerReputationTier;

export const EMPLOYER_LEVEL_THRESHOLDS: Record<
  EmployerReputationTier,
  {
    min: number;
    max: number;
    label: string;
    description: string;
  }
> = {
  new: { min: 0, max: 4, label: "New", description: "Recently joined" },
  established: { min: 5, max: 14, label: "Established", description: "Building track record" },
  trusted: { min: 15, max: 29, label: "Trusted", description: "Consistently rated well" },
  proven: { min: 30, max: Infinity, label: "Proven", description: "Strong star track record" },
};

export const EMPLOYER_LEVEL_COLORS: Record<EmployerReputationTier, string> = {
  new: "#64748b",
  established: "#0369a1",
  trusted: "#b45309",
  proven: "#16a34a",
};

export const EMPLOYER_LEVEL_BG: Record<EmployerReputationTier, string> = {
  new: "rgba(100,116,139,0.08)",
  established: "rgba(3,105,161,0.08)",
  trusted: "rgba(180,83,9,0.08)",
  proven: "rgba(22,163,74,0.08)",
};

export function calculateEmployerLevel(ratingCount: number): EmployerReputationTier {
  if (ratingCount >= 30) return "proven";
  if (ratingCount >= 15) return "trusted";
  if (ratingCount >= 5) return "established";
  return "new";
}

export function calculateEmployerReputationTier(ratingCount: number): EmployerReputationTier {
  return calculateEmployerLevel(ratingCount);
}

/* ── Public Profile Type ───────────────────────── */

export type EmployerPublicProfile = {
  wmId: string;
  companyName: string;
  industryType: string;
  companySize: string;
  locationCity: string;
  averageStars: number;
  totalRatings: number;
  /** Star reputation tier — never means business KYC verified. */
  reputationTier: EmployerReputationTier;
  reputationLabel: string;
  /** @deprecated Alias of reputationTier for older callers. */
  level: EmployerReputationTier;
  /** @deprecated Alias of reputationLabel. */
  levelLabel: string;
  /** Identity / business verification (document-approved). Distinct from stars. */
  identityBusinessVerified: boolean;
  identityMaturityLabel: string;
  /** Contact OTP verified — unlocks live publish; worker-facing "Contact Verified". */
  contactVerified: boolean;
  workAgainCount: number;
  workAgainTotal: number;
  tagCounts: Record<WorkerEmployerTag, number>;
  totalShiftPosts: number;
  totalCareerPosts: number;
  totalWorkersHired: number;
  activeJobPosts: number;
  memberSince: number | null;
};

/* ── Review Type (for Vault comments list) ─────── */

export type EmployerReview = {
  id: string;
  workerMlId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  comment?: string;
  workAgain: boolean;
  createdAt: number;
  domain: "shift" | "career";
};

/* ── Profile Aggregation ───────────────────────── */

export function getEmployerPublicProfile(employerMlId: string): EmployerPublicProfile | null {
  if (!employerMlId) return null;

  const profile = employerSettingsStorage.get();
  const businessKey = getEmployerBusinessKey(profile);
  if (!businessKey || businessKey !== employerMlId) return null;
  if (!profile.companyName.trim()) return null;

  const summary = ratingStorage.getEmployerSummary(employerMlId);
  const reputationTier = calculateEmployerReputationTier(summary.totalRatings);
  const identityLevel = computeVerificationLevel({
    registrationNo: profile.registrationNo,
    contactVerified: profile.contactVerified,
    verificationAudit: profile.verificationAudit,
    verificationTrack: profile.verificationTrack,
    enterpriseTrack: profile.enterpriseTrack,
    microTrack: profile.microTrack,
  });

  const shiftPosts = employerShiftStorage.getPosts();
  const careerPosts = getCareerPosts();

  const activeShifts = shiftPosts.filter((p) => p.status === "active").length;
  const activeCareer = careerPosts.filter((p) => p.status === "active").length;

  const shiftHired = shiftPosts.reduce((sum, p) => sum + p.confirmedIds.length, 0);
  const careerHired = careerPosts.reduce((sum, p) => sum + p.hired, 0);

  const memberSince = deriveMemberSince(shiftPosts, careerPosts, employerMlId);

  return {
    wmId: employerMlId,
    companyName: profile.companyName,
    industryType: profile.industryType,
    companySize: profile.companySize,
    locationCity: profile.locationCity,
    averageStars: summary.averageStars,
    totalRatings: summary.totalRatings,
    reputationTier,
    reputationLabel: EMPLOYER_LEVEL_THRESHOLDS[reputationTier].label,
    level: reputationTier,
    levelLabel: EMPLOYER_LEVEL_THRESHOLDS[reputationTier].label,
    identityBusinessVerified: identityLevel === 3,
    identityMaturityLabel: VERIFICATION_LEVEL_LABELS[identityLevel],
    contactVerified: profile.contactVerified === true || identityLevel >= 1,
    workAgainCount: summary.workAgainCount,
    workAgainTotal: summary.workAgainTotal,
    tagCounts: summary.tagCounts,
    totalShiftPosts: shiftPosts.length,
    totalCareerPosts: careerPosts.length,
    totalWorkersHired: shiftHired + careerHired,
    activeJobPosts: activeShifts + activeCareer,
    memberSince,
  };
}

/* ── Reviews for Vault tab ─────────────────────── */

export function getEmployerReviews(employerMlId: string): EmployerReview[] {
  if (!employerMlId) return [];

  return ratingStorage
    .getAllWRRatings()
    .filter((r) => r.employerMlId === employerMlId && isPublicReputationDomain(r.domain))
    .map((r) => ({
      id: r.id,
      workerMlId: r.workerMlId,
      stars: r.stars,
      tags: [...r.tags],
      comment: r.comment,
      workAgain: r.workAgain,
      createdAt: r.createdAt,
      domain: r.domain as "shift" | "career",
    }));
}

/* ── Quick lookup (search cards — lightweight) ──── */

export function getEmployerQuickInfo(employerMlId: string): {
  wmId: string;
  companyName: string;
  averageStars: number;
  totalRatings: number;
  reputationTier: EmployerReputationTier;
  reputationLabel: string;
  level: EmployerReputationTier;
  levelLabel: string;
  identityBusinessVerified: boolean;
  identityMaturityLabel: string;
  contactVerified: boolean;
} | null {
  if (!employerMlId) return null;

  const profile = employerSettingsStorage.get();
  const businessKey = getEmployerBusinessKey(profile);
  if (!businessKey || businessKey !== employerMlId) return null;

  const summary = ratingStorage.getEmployerSummary(employerMlId);
  const reputationTier = calculateEmployerReputationTier(summary.totalRatings);
  const identityLevel = computeVerificationLevel({
    registrationNo: profile.registrationNo,
    contactVerified: profile.contactVerified,
    verificationAudit: profile.verificationAudit,
    verificationTrack: profile.verificationTrack,
    enterpriseTrack: profile.enterpriseTrack,
    microTrack: profile.microTrack,
  });

  return {
    wmId: employerMlId,
    companyName: profile.companyName,
    averageStars: summary.averageStars,
    totalRatings: summary.totalRatings,
    reputationTier,
    reputationLabel: EMPLOYER_LEVEL_THRESHOLDS[reputationTier].label,
    level: reputationTier,
    levelLabel: EMPLOYER_LEVEL_THRESHOLDS[reputationTier].label,
    identityBusinessVerified: identityLevel === 3,
    identityMaturityLabel: VERIFICATION_LEVEL_LABELS[identityLevel],
    contactVerified: profile.contactVerified === true || identityLevel >= 1,
  };
}

/* ── Internal helpers ──────────────────────────── */

function deriveMemberSince(
  shiftPosts: { startAt: number }[],
  careerPosts: { createdAt: number }[],
  employerMlId: string,
): number | null {
  const timestamps: number[] = [];

  for (const p of shiftPosts) {
    if (typeof p.startAt === "number" && p.startAt > 0) timestamps.push(p.startAt);
  }
  for (const p of careerPosts) {
    if (typeof p.createdAt === "number" && p.createdAt > 0) timestamps.push(p.createdAt);
  }

  const ratings = ratingStorage.getAllWRRatings().filter((r) => r.employerMlId === employerMlId);
  for (const r of ratings) {
    if (typeof r.createdAt === "number" && r.createdAt > 0) timestamps.push(r.createdAt);
  }

  return timestamps.length > 0 ? Math.min(...timestamps) : null;
}
