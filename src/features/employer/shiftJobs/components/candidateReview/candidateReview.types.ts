// App name: Job Mitra
// File name: candidateReview.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateReview\candidateReview.types.ts

export type CandidateMatchFilter = "all" | "strong" | "good" | "needs_review";

export type CandidatePriorityFilter = "all" | "priority" | "good" | "review" | "none";

export type CandidateReviewSortMode = "recommended" | "newest" | "oldest" | "name";

export type CandidateReviewFilters = {
  readonly query: string;
  readonly match: CandidateMatchFilter;
  readonly priority: CandidatePriorityFilter;
  readonly sort: CandidateReviewSortMode;
};

export type CandidateMatchTier = "strong" | "good" | "needs_review";

export type CandidateReviewSummary = {
  readonly total: number;
  readonly visible: number;
  readonly strong: number;
  readonly good: number;
  readonly needsReview: number;
  readonly activeFilters: number;
};
