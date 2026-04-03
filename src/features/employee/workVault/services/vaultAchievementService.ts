// src/features/employee/workVault/services/vaultAchievementService.ts
//
// Auto-generates achievements based on employee data from all domains.
// No writes — pure read-only computation.

import type { VaultAchievement, AchievementId } from "../types/vaultProfileTypes";
import type { VaultWorkStats, VaultPerformanceRecord } from "../types/vaultProfileTypes";
import { employeeProfileStorage } from "../../../employee/profile/storage/employeeProfile.storage";

// ─────────────────────────────────────────────────────────────────────────────
// Achievement definitions
// ─────────────────────────────────────────────────────────────────────────────

type AchievementDef = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  check: (ctx: AchievementContext) => boolean;
};

type AchievementContext = {
  stats: VaultWorkStats;
  performance: VaultPerformanceRecord;
  profileComplete: boolean;
};

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_shift",
    title: "First Shift",
    description: "Completed your first shift assignment",
    icon: "\u{1F31F}",
    check: (ctx) => ctx.stats.totalShiftsCompleted >= 1,
  },
  {
    id: "shifts_5",
    title: "Shift Veteran",
    description: "Completed 5 shift assignments",
    icon: "\u{1F4AA}",
    check: (ctx) => ctx.stats.totalShiftsCompleted >= 5,
  },
  {
    id: "shifts_10",
    title: "Shift Expert",
    description: "Completed 10 shift assignments",
    icon: "\u{1F525}",
    check: (ctx) => ctx.stats.totalShiftsCompleted >= 10,
  },
  {
    id: "shifts_25",
    title: "Shift Master",
    description: "Completed 25 shift assignments",
    icon: "\u{1F3C6}",
    check: (ctx) => ctx.stats.totalShiftsCompleted >= 25,
  },
  {
    id: "first_career_hire",
    title: "Career Started",
    description: "Got hired for your first career position",
    icon: "\u{1F4BC}",
    check: (ctx) => ctx.stats.totalCareerPositions >= 1,
  },
  {
    id: "career_hires_3",
    title: "Career Builder",
    description: "Hired for 3 career positions",
    icon: "\u{1F680}",
    check: (ctx) => ctx.stats.totalCareerPositions >= 3,
  },
  {
    id: "first_review",
    title: "First Review",
    description: "Received your first employer review",
    icon: "\u{2B50}",
    check: (ctx) => ctx.performance.totalReviews >= 1,
  },
  {
    id: "reviews_10",
    title: "Well Reviewed",
    description: "Received 10 employer reviews",
    icon: "\u{1F31F}",
    check: (ctx) => ctx.performance.totalReviews >= 10,
  },
  {
    id: "first_5star",
    title: "Five Star Worker",
    description: "Received a 5-star rating from an employer",
    icon: "\u{1F451}",
    check: (ctx) => ctx.performance.ratingBreakdown.star5 >= 1,
  },
  {
    id: "star_streak_3",
    title: "Star Streak",
    description: "Received 3 or more 5-star ratings",
    icon: "\u{1F4AB}",
    check: (ctx) => ctx.performance.ratingBreakdown.star5 >= 3,
  },
  {
    id: "zero_cancellations",
    title: "Reliable Worker",
    description: "Reliability score of 100% — zero cancellations",
    icon: "\u{1F91D}",
    check: (ctx) => ctx.performance.reliabilityScore === 100,
  },
  {
    id: "profile_complete",
    title: "Profile Pro",
    description: "Completed 100% of your profile",
    icon: "\u{2705}",
    check: (ctx) => ctx.profileComplete,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Profile completion check
// ─────────────────────────────────────────────────────────────────────────────

function isProfileComplete(): boolean {
  const p = employeeProfileStorage.get();
  return (
    !!p.fullName.trim() &&
    !!p.city.trim() &&
    p.skills.length > 0 &&
    !!p.experience &&
    p.languages.length > 0 &&
    (p.preferShiftJobs || p.preferCareerJobs) &&
    (p.availability.weekdays || p.availability.weekends) &&
    (p.availability.morning || p.availability.afternoon || p.availability.evening)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────────────────────────────────────

export function computeAchievements(
  stats: VaultWorkStats,
  performance: VaultPerformanceRecord,
): VaultAchievement[] {
  const ctx: AchievementContext = {
    stats,
    performance,
    profileComplete: isProfileComplete(),
  };

  return ACHIEVEMENT_DEFS.map((def): VaultAchievement => {
    const earned = def.check(ctx);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      earned,
      earnedAt: earned ? Date.now() : null,
    };
  });
}