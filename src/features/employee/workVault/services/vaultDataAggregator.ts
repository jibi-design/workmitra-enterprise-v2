// src/features/employee/workVault/services/vaultDataAggregator.ts
//
// Master aggregator — combines Career, Shift, Workforce data + manual profile
// into a single structured object for Work Vault v2 sections.
// UI pages call getVaultSectionData() for everything in one shot.

import { employeeProfileStorage } from "../../../employee/profile/storage/employeeProfile.storage";

import {
  aggregateCareerExperience,
  aggregateCareerStats,
  aggregateCareerReferences,
  detectCareerEmploymentStatus,
} from "./vaultCareerAggregator";

import {
  aggregateShiftStats,
  aggregateShiftRatings,
  aggregateShiftReferences,
} from "./vaultShiftAggregator";

import {
  aggregateWorkforceStats,
  aggregateWorkforceRatings,
  aggregateAttendanceRate,
  aggregateReliabilityScore,
  aggregateWorkforceReferences,
} from "./vaultWorkforceAggregator";

import { vaultProfileService } from "./vaultProfileService";
import { computeAchievements } from "./vaultAchievementService";

import type {
  VaultWorkExperienceEntry,
  VaultWorkStats,
  VaultPerformanceRecord,
  VaultReference,
  VaultActivityData,
  VaultSkillEntry,
  VaultAchievement,
  VaultProfessionalSummary,
  VaultEducation,
  EmploymentStatus,
} from "../types/vaultProfileTypes";

// ─────────────────────────────────────────────────────────────────────────────
// Combined Result Type
// ─────────────────────────────────────────────────────────────────────────────

export type VaultSectionData = {
  /** Section 1: Identity */
  identity: {
    fullName: string;
    city: string;
    photoDataUrl: string;
    uniqueId: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    memberSince: number;
  };

  /** Section 2: Professional Summary */
  professionalSummary: VaultProfessionalSummary & {
    resolvedStatus: EmploymentStatus;
    resolvedCompany: string;
  };

  /** Section 3: Work Experience */
  workExperience: VaultWorkExperienceEntry[];

  /** Section 4: Work Stats */
  workStats: VaultWorkStats;

  /** Section 5: Education */
  education: VaultEducation;

  /** Section 6: Skills */
  skills: VaultSkillEntry[];

  /** Section 7: Performance */
  performance: VaultPerformanceRecord;

  /** Section 8: References */
  references: VaultReference[];

  /** Section 9: Achievements */
  achievements: VaultAchievement[];

  /** Section 10: Activity */
  activity: VaultActivityData;
};

// ─────────────────────────────────────────────────────────────────────────────
// Rating Math Helpers
// ─────────────────────────────────────────────────────────────────────────────

function computeOverallRating(allRatings: number[]): number | null {
  if (allRatings.length === 0) return null;
  const sum = allRatings.reduce((a, b) => a + b, 0);
  return Math.round((sum / allRatings.length) * 10) / 10;
}

function computeBreakdown(allRatings: number[]) {
  const b = { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 };
  for (const r of allRatings) {
    if (r === 5) b.star5++;
    else if (r === 4) b.star4++;
    else if (r === 3) b.star3++;
    else if (r === 2) b.star2++;
    else if (r === 1) b.star1++;
  }
  return b;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Aggregation Function
// ─────────────────────────────────────────────────────────────────────────────

export function getVaultSectionData(): VaultSectionData {
  // ── Profile ──
  const profile = employeeProfileStorage.get();
  const manual = vaultProfileService.get();

  // ── Section 2: Auto-detect employment ──
  const careerStatus = detectCareerEmploymentStatus();
  const summary = manual.professionalSummary;

  let resolvedStatus: EmploymentStatus = summary.employmentStatus;
  let resolvedCompany = summary.currentCompany;

  if (summary.employmentStatusAuto && careerStatus.isEmployed) {
    resolvedStatus = "employed";
    resolvedCompany = careerStatus.currentCompany;
  }

  // ── Section 3: Work Experience ──
  const workExperience = aggregateCareerExperience();

  // ── Section 4: Work Stats ──
  const careerStats = aggregateCareerStats();
  const shiftStats = aggregateShiftStats();
  const wfStats = aggregateWorkforceStats();

  const allCompanies = new Set<string>([
    ...careerStats.uniqueCompanies,
    ...shiftStats.uniqueCompanies,
  ]);

  const workStats: VaultWorkStats = {
    totalCareerPositions: careerStats.totalCareerPositions,
    verifiedPositions: careerStats.verifiedPositions,
    totalShiftsCompleted: shiftStats.totalShiftsCompleted,
    totalWorkforceCompanies: wfStats.totalWorkforceCompanies,
    totalCompaniesWorked: allCompanies.size,
  };

  // ── Section 6: Skills ──
  const proficiencies = manual.skillProficiencies;
  const skills: VaultSkillEntry[] = profile.skills.map((name) => ({
    name,
    proficiency: proficiencies[name.toLowerCase().trim()] ?? "beginner",
    endorsedByCount: 0,
    endorsedByCompanies: [],
  }));

  // ── Section 7: Performance ──
  const shiftRatings = aggregateShiftRatings();
  const wfRatings = aggregateWorkforceRatings();

  const allRatings = [...shiftRatings.ratings, ...wfRatings.ratings];
  if (wfRatings.staffRating !== null) {
    allRatings.push(wfRatings.staffRating);
  }

  const performance: VaultPerformanceRecord = {
    overallRating: computeOverallRating(allRatings),
    totalReviews: allRatings.length,
    ratingBreakdown: computeBreakdown(allRatings),
    attendanceRate: aggregateAttendanceRate(),
    reliabilityScore: aggregateReliabilityScore(),
  };

  // ── Section 8: References ──
  const shiftRefs = aggregateShiftReferences();
  const wfRefs = aggregateWorkforceReferences();
  const careerRefs = aggregateCareerReferences();
  const references = [...careerRefs, ...shiftRefs, ...wfRefs];

  // ── Section 9: Achievements ──
  const achievements = computeAchievements(workStats, performance);

   // ── Section 10: Activity ──
  const activity: VaultActivityData = {
    memberSince: profile.createdAt ?? Date.now(),
    lastActive: Date.now(),
    responseRate: null,
    profileViewsThisMonth: null,
  };

  // ── Assemble ──
  return {
    identity: {
      fullName: profile.fullName,
      city: profile.city,
      photoDataUrl: profile.photoDataUrl ?? "",
      uniqueId: profile.uniqueId ?? "",
      phoneVerified: false,
      emailVerified: false,
      memberSince: activity.memberSince,
    },
    professionalSummary: {
      ...summary,
      resolvedStatus,
      resolvedCompany,
    },
    workExperience,
    workStats,
    education: manual.education,
    skills,
    performance,
    references,
    achievements,
    activity,
  };
}