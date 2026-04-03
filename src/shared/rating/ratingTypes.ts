// src/shared/rating/ratingTypes.ts
//
// WorkMitra Rating & Trust System — Core Types.
// Two-way mandatory rating: Employer → Worker + Worker → Employer.
// Permanent, linked to WM ID. Cannot delete/reset/fake.

/* ------------------------------------------------ */
/* Domain                                           */
/* ------------------------------------------------ */
export type RatingDomain = "shift" | "career";

/* ------------------------------------------------ */
/* Employer → Worker Rating                         */
/* ------------------------------------------------ */
export type EmployerWorkerTag =
  | "On time"
  | "Skilled"
  | "Professional"
  | "Reliable"
  | "Hard working"
  | "Good communication"
  | "Would hire again";

export type EmployerToWorkerRating = {
  id: string;
  domain: RatingDomain;
  /** Employer's WM ID */
  employerWmId: string;
  /** Worker's WM ID */
  workerWmId: string;
  /** Shift post ID or Career job ID */
  jobId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: EmployerWorkerTag[];
  comment?: string;
  hireAgain: boolean;
  createdAt: number;
  /** Timestamp of edit — null if never edited */
  editedAt: number | null;
  /** 0 = not edited, 1 = max one edit allowed */
  editCount: number;
};

/* ------------------------------------------------ */
/* Worker → Employer Rating                         */
/* ------------------------------------------------ */
export type WorkerEmployerTag =
  | "Paid on time"
  | "Respectful"
  | "Safe workplace"
  | "Good communication"
  | "Clear instructions"
  | "Would work again";

export type WorkerToEmployerRating = {
  id: string;
  domain: RatingDomain;
  /** Worker's WM ID */
  workerWmId: string;
  /** Employer's WM ID */
  employerWmId: string;
  /** Shift post ID or Career job ID */
  jobId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: WorkerEmployerTag[];
  comment?: string;
  workAgain: boolean;
  createdAt: number;
  /** Timestamp of edit — null if never edited */
  editedAt: number | null;
  /** 0 = not edited, 1 = max one edit allowed */
  editCount: number;
};

/* ------------------------------------------------ */
/* Worker Points & Level                            */
/* ------------------------------------------------ */
export type RatingLevel = "bronze" | "silver" | "gold" | "platinum";

export type PointsEventType =
  | "shift_complete"
  | "rating_5star"
  | "rating_4star"
  | "tag_reliable"
  | "zero_cancellations_month"
  | "hire_again"
  | "career_proper_exit"
  | "proper_resignation_rated"
  | "cancel_confirmed"
  | "no_show"
  | "rating_1or2star"
  | "late_arrival"
  | "leave_without_resignation";

export type PointsHistoryEntry = {
  id: string;
  eventType: PointsEventType;
  delta: number;
  jobId?: string;
  createdAt: number;
  note: string;
};

export type WorkerPoints = {
  workerWmId: string;
  total: number;
  level: RatingLevel;
  history: PointsHistoryEntry[];
  updatedAt: number;
};

/* ------------------------------------------------ */
/* Aggregated Worker Rating Summary                 */
/* ------------------------------------------------ */
export type WorkerRatingSummary = {
  workerWmId: string;
  totalRatings: number;
  averageStars: number;
  tagCounts: Record<EmployerWorkerTag, number>;
  hireAgainCount: number;
  hireAgainTotal: number;
  level: RatingLevel;
  points: number;
};

/* ------------------------------------------------ */
/* Aggregated Employer Rating Summary               */
/* ------------------------------------------------ */
export type EmployerRatingSummary = {
  employerWmId: string;
  totalRatings: number;
  averageStars: number;
  tagCounts: Record<WorkerEmployerTag, number>;
  workAgainCount: number;
  workAgainTotal: number;
};