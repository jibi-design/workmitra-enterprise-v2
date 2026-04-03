// src/shared/employerProfile/employerPublicProfileService.ts
//
// Employer public profile aggregation service.
// Data source for: search cards, Vault "Verify Employer", workspace pages.
// Combines: employer settings + ratings + shift/career post data.

import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";
import { ratingStorage } from "../rating/ratingStorage";
import { employerShiftStorage } from "../../features/employer/shiftJobs/storage/employerShift.storage";
import { getCareerPosts } from "../../features/employer/careerJobs/services/careerPostService";
import type { WorkerEmployerTag } from "../rating/ratingTypes";

/* ── Employer Level System ─────────────────────── */

export type EmployerLevel = "new" | "established" | "trusted" | "verified";

export const EMPLOYER_LEVEL_THRESHOLDS: Record<EmployerLevel, {
  min: number; max: number; label: string; description: string;
}> = {
  new:         { min: 0,  max: 4,        label: "New",         description: "Recently joined" },
  established: { min: 5,  max: 14,       label: "Established", description: "Building track record" },
  trusted:     { min: 15, max: 29,       label: "Trusted",     description: "Consistently rated well" },
  verified:    { min: 30, max: Infinity,  label: "Verified",    description: "Proven employer" },
};

export const EMPLOYER_LEVEL_COLORS: Record<EmployerLevel, string> = {
  new:         "#64748b",
  established: "#0369a1",
  trusted:     "#b45309",
  verified:    "#16a34a",
};

export const EMPLOYER_LEVEL_BG: Record<EmployerLevel, string> = {
  new:         "rgba(100,116,139,0.08)",
  established: "rgba(3,105,161,0.08)",
  trusted:     "rgba(180,83,9,0.08)",
  verified:    "rgba(22,163,74,0.08)",
};

export function calculateEmployerLevel(ratingCount: number): EmployerLevel {
  if (ratingCount >= 30) return "verified";
  if (ratingCount >= 15) return "trusted";
  if (ratingCount >= 5) return "established";
  return "new";
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
  level: EmployerLevel;
  levelLabel: string;
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
  workerWmId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  comment?: string;
  workAgain: boolean;
  createdAt: number;
  domain: "shift" | "career";
};

/* ── Profile Aggregation ───────────────────────── */

export function getEmployerPublicProfile(employerWmId: string): EmployerPublicProfile | null {
  if (!employerWmId) return null;

  const profile = employerSettingsStorage.get();
  if (!profile.uniqueId || profile.uniqueId !== employerWmId) return null;
  if (!profile.companyName.trim()) return null;

  const summary = ratingStorage.getEmployerSummary(employerWmId);
  const level = calculateEmployerLevel(summary.totalRatings);

  const shiftPosts = employerShiftStorage.getPosts();
  const careerPosts = getCareerPosts();

  const activeShifts = shiftPosts.filter((p) => p.status === "active").length;
  const activeCareer = careerPosts.filter((p) => p.status === "active").length;

  const shiftHired = shiftPosts.reduce((sum, p) => sum + p.confirmedIds.length, 0);
  const careerHired = careerPosts.reduce((sum, p) => sum + p.hired, 0);

  const memberSince = deriveMemberSince(shiftPosts, careerPosts, employerWmId);

  return {
    wmId: employerWmId,
    companyName: profile.companyName,
    industryType: profile.industryType,
    companySize: profile.companySize,
    locationCity: profile.locationCity,
    averageStars: summary.averageStars,
    totalRatings: summary.totalRatings,
    level,
    levelLabel: EMPLOYER_LEVEL_THRESHOLDS[level].label,
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

export function getEmployerReviews(employerWmId: string): EmployerReview[] {
  if (!employerWmId) return [];

  return ratingStorage
    .getAllWRRatings()
    .filter((r) => r.employerWmId === employerWmId)
    .map((r) => ({
      id: r.id,
      workerWmId: r.workerWmId,
      stars: r.stars,
      tags: [...r.tags],
      comment: r.comment,
      workAgain: r.workAgain,
      createdAt: r.createdAt,
      domain: r.domain,
    }));
}

/* ── Quick lookup (search cards — lightweight) ──── */

export function getEmployerQuickInfo(employerWmId: string): {
  wmId: string;
  companyName: string;
  averageStars: number;
  totalRatings: number;
  level: EmployerLevel;
  levelLabel: string;
} | null {
  if (!employerWmId) return null;

  const profile = employerSettingsStorage.get();
  if (!profile.uniqueId || profile.uniqueId !== employerWmId) return null;

  const summary = ratingStorage.getEmployerSummary(employerWmId);
  const level = calculateEmployerLevel(summary.totalRatings);

  return {
    wmId: employerWmId,
    companyName: profile.companyName,
    averageStars: summary.averageStars,
    totalRatings: summary.totalRatings,
    level,
    levelLabel: EMPLOYER_LEVEL_THRESHOLDS[level].label,
  };
}

/* ── Internal helpers ──────────────────────────── */

function deriveMemberSince(
  shiftPosts: { startAt: number }[],
  careerPosts: { createdAt: number }[],
  employerWmId: string,
): number | null {
  const timestamps: number[] = [];

  for (const p of shiftPosts) {
    if (typeof p.startAt === "number" && p.startAt > 0) timestamps.push(p.startAt);
  }
  for (const p of careerPosts) {
    if (typeof p.createdAt === "number" && p.createdAt > 0) timestamps.push(p.createdAt);
  }

  const ratings = ratingStorage.getAllWRRatings().filter((r) => r.employerWmId === employerWmId);
  for (const r of ratings) {
    if (typeof r.createdAt === "number" && r.createdAt > 0) timestamps.push(r.createdAt);
  }

  return timestamps.length > 0 ? Math.min(...timestamps) : null;
}