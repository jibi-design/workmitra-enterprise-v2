// App name: Job Mitra
// File name: employerVaultReview.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\types\employerVaultReview.types.ts

import type {
  EmployerToWorkerRating,
  WorkerToEmployerRating,
} from "../../../../shared/rating/ratingTypes";

export type EmployerWorkerReviewRecord = {
  id: string;
  source: WorkerToEmployerRating;
  domain: "shift" | "career";
  workerMlId: string;
  employerMlId: string;
  jobId: string;
  workspaceId?: string;
  title: string;
  subtitle: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  comment?: string;
  workAgain: boolean;
  createdAt: number;
};

export type EmployerWorkerReviewSummary = {
  totalReviews: number;
  averageStars: number;
  workAgainCount: number;
  workAgainTotal: number;
  topTags: string[];
};

export type EmployerGivenWorkerRatingRecord = {
  id: string;
  source: EmployerToWorkerRating;
  domain: "shift" | "career";
  employerMlId: string;
  workerMlId: string;
  jobId: string;
  workspaceId?: string;
  title: string;
  subtitle: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  comment?: string;
  hireAgain: boolean;
  createdAt: number;
};

export type EmployerGivenWorkerRatingSummary = {
  totalRatings: number;
  averageStars: number;
  hireAgainCount: number;
  hireAgainTotal: number;
  topTags: string[];
};

export type EmployerCompletedWorkRecord = {
  id: string;
  postId: string;
  title: string;
  subtitle: string;
  status: "completed";
  dateRange: string;
  lastActivityAt: number;
  updateCount: number;
  hasEmployerRating: boolean;
  hasWorkerReview: boolean;
};

export type EmployerCompletedWorkSummary = {
  totalCompleted: number;
  employerRatedCount: number;
  workerReviewedCount: number;
  pendingEmployerRatingCount: number;
};
