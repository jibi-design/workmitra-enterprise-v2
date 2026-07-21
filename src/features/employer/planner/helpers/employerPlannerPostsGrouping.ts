// Job Mitra | employerPlannerPostsGrouping.ts | Hide planner child posts; group by planId

import { demandPlannerStorage, type DemandPlan } from "../storage/demandPlannerStorage";
import {
  countApplicationsForPost,
  type ShiftPost,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";

export type EmployerPlannerPostGroup = {
  planId: string;
  planName: string;
  dayCount: number;
  childPosts: ShiftPost[];
  totalApplications: number;
  totalConfirmed: number;
  status: DemandPlan["status"];
};

function isPlannerChildPost(post: ShiftPost): boolean {
  return post.source === "planner" && Boolean(post.planId);
}

export function splitEmployerPostsForMyPosts(posts: ShiftPost[]): {
  standalonePosts: ShiftPost[];
  planGroups: EmployerPlannerPostGroup[];
} {
  const standalonePosts: ShiftPost[] = [];
  const byPlan = new Map<string, ShiftPost[]>();

  for (const post of posts) {
    if (isPlannerChildPost(post) && post.planId) {
      const list = byPlan.get(post.planId) ?? [];
      list.push(post);
      byPlan.set(post.planId, list);
    } else {
      standalonePosts.push(post);
    }
  }

  const planGroups: EmployerPlannerPostGroup[] = [];

  for (const [planId, childPosts] of byPlan) {
    const plan = demandPlannerStorage.getById(planId);
    let totalApplications = 0;
    let totalConfirmed = 0;

    for (const post of childPosts) {
      totalApplications += countApplicationsForPost(post.id);
      totalConfirmed += post.confirmedIds.length;
    }

    planGroups.push({
      planId,
      planName: plan?.name ?? childPosts[0]?.jobName ?? "Project Plan",
      dayCount: childPosts.length,
      childPosts,
      totalApplications,
      totalConfirmed,
      status: plan?.status ?? "active",
    });
  }

  planGroups.sort((a, b) => {
    const aTime = demandPlannerStorage.getById(a.planId)?.submittedAt ?? 0;
    const bTime = demandPlannerStorage.getById(b.planId)?.submittedAt ?? 0;
    return bTime - aTime;
  });

  return { standalonePosts, planGroups };
}

export function applyPlanPostsDisplayMode(
  split: { standalonePosts: ShiftPost[]; planGroups: EmployerPlannerPostGroup[] },
  showIndividualPlanDays: boolean,
): { standalonePosts: ShiftPost[]; planGroups: EmployerPlannerPostGroup[] } {
  if (!showIndividualPlanDays) return split;

  return {
    standalonePosts: [...split.standalonePosts, ...split.planGroups.flatMap((g) => g.childPosts)],
    planGroups: [],
  };
}
