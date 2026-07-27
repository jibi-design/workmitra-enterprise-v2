// App: Job Mitra / WorkMitra_Enterprise_v2
// File: vaultAchievementService.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\services\vaultAchievementService.ts

import type {
  AchievementDisplayState,
  AchievementGroup,
  VaultAchievement,
  VaultPerformanceRecord,
  VaultWorkStats,
} from "../types/vaultProfileTypes";
import { employeeProfileStorage } from "../../../employee/profile/storage/employeeProfile.storage";

const SHIFT_TARGETS = [1, 5, 10, 25, 50, 75, 100, 150, 200, 250, 500];
const CAREER_TARGETS = [1, 3, 5, 10, 15, 25];
const PLANNER_TARGETS = [1, 3, 5, 10, 15, 25, 50];
const REVIEW_TARGETS = [1, 5, 10, 25, 50, 100];
const FIVE_STAR_TARGETS = [1, 5, 10, 25, 50];
const NEXT_GOAL_LIMIT = 2;

function isProfileComplete(): boolean {
  const profile = employeeProfileStorage.get();

  return (
    !!profile.fullName.trim() &&
    !!profile.city.trim() &&
    profile.skills.length > 0 &&
    !!profile.experience &&
    profile.languages.length > 0 &&
    (profile.preferShiftJobs || profile.preferCareerJobs) &&
    (profile.availability.weekdays || profile.availability.weekends) &&
    (profile.availability.morning || profile.availability.afternoon || profile.availability.evening)
  );
}

function latestEarnedTarget(currentValue: number, targets: readonly number[]): number | null {
  const earned = targets.filter((target) => currentValue >= target);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

function nextTargets(currentValue: number, targets: readonly number[], limit: number): number[] {
  return targets.filter((target) => target > currentValue).slice(0, limit);
}

function createAchievement(data: {
  id: string;
  title: string;
  description: string;
  group: AchievementGroup;
  displayState: AchievementDisplayState;
  earned: boolean;
  currentValue: number;
  targetValue: number;
  icon: string;
}): VaultAchievement {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    icon: data.icon,
    earned: data.earned,
    earnedAt: data.earned ? Date.now() : null,
    group: data.group,
    displayState: data.displayState,
    currentValue: data.currentValue,
    targetValue: data.targetValue,
  };
}

function shiftTitle(target: number): string {
  if (target === 1) return "First Shift";
  return `${target} Shifts`;
}

function shiftDescription(target: number, earned: boolean): string {
  if (earned) return `${target} completed shift assignment${target === 1 ? "" : "s"}.`;
  return `Next goal: complete ${target} shift assignment${target === 1 ? "" : "s"}.`;
}

function careerTitle(target: number): string {
  if (target === 1) return "First Career Job";
  return `${target} Career Jobs`;
}

function careerDescription(target: number, earned: boolean): string {
  if (earned) return `${target} completed Career Jobs record${target === 1 ? "" : "s"}.`;
  return `Next goal: reach ${target} Career Jobs record${target === 1 ? "" : "s"}.`;
}

function plannerTitle(target: number): string {
  if (target === 1) return "First Planner Epoch";
  return `${target} Planner Epochs`;
}

function plannerDescription(target: number, earned: boolean): string {
  if (earned) {
    return `${target} Gig Project / Planner epoch${target === 1 ? "" : "s"} recorded.`;
  }
  return `Next goal: complete ${target} Planner epoch${target === 1 ? "" : "s"}.`;
}

function reviewTitle(target: number): string {
  if (target === 1) return "First Work Review";
  if (target === 10) return "Trusted Review Record";
  return `${target} Work Reviews`;
}

function reviewDescription(target: number, earned: boolean): string {
  if (earned) {
    return `${target} completed work review${target === 1 ? "" : "s"} across eligible domains.`;
  }
  return `Next goal: collect ${target} completed work review${target === 1 ? "" : "s"}.`;
}

function fiveStarTitle(target: number): string {
  if (target === 1) return "First 5-Star Work Review";
  if (target === 5) return "Five Star Worker";
  return `${target} Five-Star Reviews`;
}

function fiveStarDescription(target: number, earned: boolean): string {
  if (target === 1) {
    return earned
      ? "First 5-star completed work review earned. More reviews strengthen reputation."
      : "Next goal: receive your first 5-star completed work review.";
  }

  return earned
    ? `${target} five-star completed work reviews earned.`
    : `Next goal: reach ${target} five-star completed work reviews.`;
}

function buildCountMilestones(data: {
  group: AchievementGroup;
  prefix: string;
  currentValue: number;
  targets: readonly number[];
  nextLimit: number;
  titleFor: (target: number) => string;
  descriptionFor: (target: number, earned: boolean) => string;
  icon: string;
}): VaultAchievement[] {
  const achievements: VaultAchievement[] = [];
  const latest = latestEarnedTarget(data.currentValue, data.targets);

  if (latest !== null) {
    achievements.push(
      createAchievement({
        id: `${data.prefix}_${latest}`,
        title: data.titleFor(latest),
        description: data.descriptionFor(latest, true),
        group: data.group,
        displayState: "latest_earned",
        earned: true,
        currentValue: data.currentValue,
        targetValue: latest,
        icon: data.icon,
      }),
    );
  }

  for (const target of nextTargets(data.currentValue, data.targets, data.nextLimit)) {
    achievements.push(
      createAchievement({
        id: `${data.prefix}_${target}`,
        title: data.titleFor(target),
        description: data.descriptionFor(target, false),
        group: data.group,
        displayState: "next_goal",
        earned: false,
        currentValue: data.currentValue,
        targetValue: target,
        icon: data.icon,
      }),
    );
  }

  return achievements;
}

function buildShiftMilestones(stats: VaultWorkStats): VaultAchievement[] {
  return buildCountMilestones({
    group: "shift",
    prefix: "shift",
    currentValue: stats.totalShiftsCompleted,
    targets: SHIFT_TARGETS,
    nextLimit: NEXT_GOAL_LIMIT,
    titleFor: shiftTitle,
    descriptionFor: shiftDescription,
    icon: "shift",
  });
}

function buildCareerMilestones(stats: VaultWorkStats): VaultAchievement[] {
  return buildCountMilestones({
    group: "career",
    prefix: "career",
    currentValue: stats.totalCareerPositions,
    targets: CAREER_TARGETS,
    nextLimit: NEXT_GOAL_LIMIT,
    titleFor: careerTitle,
    descriptionFor: careerDescription,
    icon: "career",
  });
}

function buildPlannerMilestones(stats: VaultWorkStats): VaultAchievement[] {
  return buildCountMilestones({
    group: "planner",
    prefix: "planner",
    currentValue: stats.totalPlannerEpochs,
    targets: PLANNER_TARGETS,
    nextLimit: NEXT_GOAL_LIMIT,
    titleFor: plannerTitle,
    descriptionFor: plannerDescription,
    icon: "planner",
  });
}

function buildReputationMilestones(performance: VaultPerformanceRecord): VaultAchievement[] {
  const reviewMilestones = buildCountMilestones({
    group: "reputation",
    prefix: "review",
    currentValue: performance.totalReviews,
    targets: REVIEW_TARGETS,
    nextLimit: 1,
    titleFor: reviewTitle,
    descriptionFor: reviewDescription,
    icon: "review",
  });

  const fiveStarMilestones = buildCountMilestones({
    group: "reputation",
    prefix: "five_star",
    currentValue: performance.ratingBreakdown.star5,
    targets: FIVE_STAR_TARGETS,
    nextLimit: 1,
    titleFor: fiveStarTitle,
    descriptionFor: fiveStarDescription,
    icon: "star",
  });

  return [...reviewMilestones, ...fiveStarMilestones];
}

function buildProfileMilestones(profileComplete: boolean): VaultAchievement[] {
  return [
    createAchievement({
      id: "profile_complete",
      title: "Profile Pro",
      description: profileComplete
        ? "Work Vault profile is complete."
        : "Next goal: complete your Work Vault profile.",
      group: "profile",
      displayState: profileComplete ? "latest_earned" : "next_goal",
      earned: profileComplete,
      currentValue: profileComplete ? 1 : 0,
      targetValue: 1,
      icon: "profile",
    }),
  ];
}

export function computeAchievements(
  stats: VaultWorkStats,
  performance: VaultPerformanceRecord,
): VaultAchievement[] {
  const profileComplete = isProfileComplete();

  return [
    ...buildShiftMilestones(stats),
    ...buildCareerMilestones(stats),
    ...buildPlannerMilestones(stats),
    ...buildReputationMilestones(performance),
    ...buildProfileMilestones(profileComplete),
  ];
}
