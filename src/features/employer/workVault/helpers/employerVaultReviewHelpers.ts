// App name: Job Mitra
// File name: employerVaultReviewHelpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\helpers\employerVaultReviewHelpers.ts

import type {
  EmployerToWorkerRating,
  WorkerToEmployerRating,
} from "../../../../shared/rating/ratingTypes";
import type { ShiftWorkspace } from "../../shiftJobs/types/shiftWorkspaceTypes";
import { fmtDateRange } from "../../shiftJobs/types/shiftWorkspaceTypes";
import type {
  EmployerCompletedWorkRecord,
  EmployerCompletedWorkSummary,
  EmployerGivenWorkerRatingRecord,
  EmployerGivenWorkerRatingSummary,
  EmployerWorkerReviewRecord,
  EmployerWorkerReviewSummary,
} from "../types/employerVaultReview.types";

const FALLBACK_SHIFT_TITLE = "Shift Work Record";
const FALLBACK_WORKER_CODE = "Available after completed work";

export function buildEmployerWorkerReviewRecords(
  reviews: WorkerToEmployerRating[],
  workspaces: ShiftWorkspace[],
): EmployerWorkerReviewRecord[] {
  return reviews
    .filter((review) => review.domain === "shift")
    .map((review) => {
      const workspace = workspaces.find((item) => item.postId === review.jobId);

      return {
        id: review.id,
        source: review,
        domain: review.domain,
        workerWmId: getSafeWorkerCode(review.workerWmId),
        employerWmId: review.employerWmId,
        jobId: review.jobId,
        workspaceId: workspace?.id,
        title: workspace ? getSafeWorkspaceTitle(workspace) : `Shift ${review.jobId.slice(0, 8)}`,
        subtitle: workspace?.locationName ?? "Shift work record",
        stars: review.stars,
        tags: review.tags,
        comment: review.comment,
        workAgain: review.workAgain,
        createdAt: review.createdAt,
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function buildEmployerWorkerReviewSummary(
  records: EmployerWorkerReviewRecord[],
): EmployerWorkerReviewSummary {
  const totalReviews = records.length;

  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageStars: 0,
      workAgainCount: 0,
      workAgainTotal: 0,
      topTags: [],
    };
  }

  const averageStars =
    Math.round((records.reduce((sum, record) => sum + record.stars, 0) / totalReviews) * 10) / 10;

  const workAgainCount = records.filter((record) => record.workAgain).length;
  const tagCounts = new Map<string, number>();

  for (const record of records) {
    for (const tag of record.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);

  return {
    totalReviews,
    averageStars,
    workAgainCount,
    workAgainTotal: totalReviews,
    topTags,
  };
}

export function buildEmployerGivenWorkerRatingRecords(
  ratings: EmployerToWorkerRating[],
  workspaces: ShiftWorkspace[],
): EmployerGivenWorkerRatingRecord[] {
  return ratings
    .filter((rating) => rating.domain === "shift")
    .map((rating) => {
      const workspace = workspaces.find((item) => item.postId === rating.jobId);

      return {
        id: rating.id,
        source: rating,
        domain: rating.domain,
        employerWmId: rating.employerWmId,
        workerWmId: getSafeWorkerCode(rating.workerWmId),
        jobId: rating.jobId,
        workspaceId: workspace?.id,
        title: workspace ? getSafeWorkspaceTitle(workspace) : `Shift ${rating.jobId.slice(0, 8)}`,
        subtitle: workspace?.locationName ?? "Shift work record",
        stars: rating.stars,
        tags: rating.tags,
        comment: rating.comment,
        hireAgain: rating.hireAgain,
        createdAt: rating.createdAt,
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function buildEmployerGivenWorkerRatingSummary(
  records: EmployerGivenWorkerRatingRecord[],
): EmployerGivenWorkerRatingSummary {
  const totalRatings = records.length;

  if (totalRatings === 0) {
    return {
      totalRatings: 0,
      averageStars: 0,
      hireAgainCount: 0,
      hireAgainTotal: 0,
      topTags: [],
    };
  }

  const averageStars =
    Math.round((records.reduce((sum, record) => sum + record.stars, 0) / totalRatings) * 10) / 10;

  const hireAgainCount = records.filter((record) => record.hireAgain).length;
  const tagCounts = new Map<string, number>();

  for (const record of records) {
    for (const tag of record.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);

  return {
    totalRatings,
    averageStars,
    hireAgainCount,
    hireAgainTotal: totalRatings,
    topTags,
  };
}

export function buildEmployerCompletedWorkRecords(
  workspaces: ShiftWorkspace[],
  workerReviews: WorkerToEmployerRating[],
  workerRatings: EmployerToWorkerRating[],
): EmployerCompletedWorkRecord[] {
  return workspaces
    .filter((workspace) => workspace.status === "completed")
    .map((workspace) => ({
      id: workspace.id,
      postId: workspace.postId,
      title: getSafeWorkspaceTitle(workspace),
      subtitle: workspace.locationName || "Location not specified",
      status: "completed" as const,
      dateRange: fmtDateRange(workspace.startAt, workspace.endAt),
      lastActivityAt: workspace.lastActivityAt,
      updateCount: workspace.updates.length,
      hasEmployerRating: workerRatings.some(
        (rating) => rating.domain === "shift" && rating.jobId === workspace.postId,
      ),
      hasWorkerReview: workerReviews.some(
        (review) => review.domain === "shift" && review.jobId === workspace.postId,
      ),
    }))
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
}

export function buildEmployerCompletedWorkSummary(
  records: EmployerCompletedWorkRecord[],
): EmployerCompletedWorkSummary {
  const totalCompleted = records.length;
  const employerRatedCount = records.filter((record) => record.hasEmployerRating).length;
  const workerReviewedCount = records.filter((record) => record.hasWorkerReview).length;

  return {
    totalCompleted,
    employerRatedCount,
    workerReviewedCount,
    pendingEmployerRatingCount: totalCompleted - employerRatedCount,
  };
}

export function formatEmployerVaultDate(value: number): string {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Date not available";
  }
}

function getSafeWorkspaceTitle(workspace: ShiftWorkspace): string {
  const companyName = workspace.companyName.trim();
  const jobName = workspace.jobName.trim();

  if (isDemoText(companyName) || isDemoText(jobName)) {
    return FALLBACK_SHIFT_TITLE;
  }

  if (!companyName && !jobName) return FALLBACK_SHIFT_TITLE;
  if (!companyName) return jobName || FALLBACK_SHIFT_TITLE;
  if (!jobName) return companyName || FALLBACK_SHIFT_TITLE;

  return `${companyName} - ${jobName}`;
}

function getSafeWorkerCode(workerCode: string): string {
  const normalized = workerCode.trim();

  if (!normalized || isDemoText(normalized)) {
    return FALLBACK_WORKER_CODE;
  }

  return normalized;
}

function isDemoText(value: string): boolean {
  const normalized = value.trim().toLowerCase();

  if (!normalized) return true;

  return [
    "asdf",
    "qwe",
    "test",
    "demo",
    "sample",
    "dummy",
    "placeholder",
    "xxx",
    "xxxx",
    "na",
    "n/a",
  ].includes(normalized);
}
