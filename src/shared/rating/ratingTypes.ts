/** Job Mitra | ratingTypes.ts | C:\projects\WorkMitra_Enterprise_v2\src\shared\rating\ratingTypes.ts */

/**
 * Job Mitra Rating & Trust System — Core Types.
 * Two-way mandatory rating: Employer → Worker + Worker → Employer.
 * Permanent, linked to Job Mitra ID. Cannot delete/reset/fake.
 */
export type RatingDomain = "shift" | "career";

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
  /** Employer's unique ID */
  employerWmId: string;
  /** Worker's unique ID */
  workerWmId: string;
  /** Shift post ID or Career job ID */
  jobId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: EmployerWorkerTag[];
  comment?: string;
  hireAgain: boolean;
  createdAt: number;
  editedAt: number | null;
  editCount: number;
};

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
  /** Worker's unique ID */
  workerWmId: string;
  /** Employer's unique ID */
  employerWmId: string;
  /** Shift post ID or Career job ID */
  jobId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: WorkerEmployerTag[];
  comment?: string;
  workAgain: boolean;
  createdAt: number;
  editedAt: number | null;
  editCount: number;
};

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

export type EmployerRatingSummary = {
  employerWmId: string;
  totalRatings: number;
  averageStars: number;
  tagCounts: Record<WorkerEmployerTag, number>;
  workAgainCount: number;
  workAgainTotal: number;
};