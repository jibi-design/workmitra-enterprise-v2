/** Job Mitra | ratingTypes.ts | C:\projects\WorkMitra_Enterprise_v2\src\shared\rating\ratingTypes.ts */

/**
 * Job Mitra Rating & Trust System — Core Types.
 * Two-way mandatory rating: Employer → Worker + Worker → Employer.
 * Permanent, linked to Mitra Labs ID. Cannot delete/reset/fake.
 *
 * Hybrid A2 P1.5: RatingDomain includes "planner".
 * Reputation subject for planner = legal corporate entity (`employerMlId`).
 * `siteManagerId` / `siteId` are telemetry only (never replace entity score).
 */
export type RatingDomain = "shift" | "career" | "planner";

/**
 * Planner-only metadata. Never use siteManagerId as the reputation subject.
 * jobId for planner ratings should be the roster plan id (or epoch-scoped plan key).
 */
export type RatingPlannerMeta = {
  /** Always the roster / demand plan id. */
  rosterPlanId: string;
  /** 0-based epoch index when rating a milestone summary. */
  epochIndex?: number;
  /** Telemetry only — site supervisor Mitra Labs ID. */
  siteManagerId?: string;
  /** Telemetry only — site / location entity. */
  siteId?: string;
  assignmentId?: string;
};

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
  /**
   * Reputation subject Mitra Labs ID.
   * For planner: must be the legal corporate entity (agency/enterprise), never site manager.
   */
  employerMlId: string;
  /** Worker's unique ID */
  workerMlId: string;
  /** Shift post ID, Career job ID, or Planner plan/epoch job key */
  jobId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: EmployerWorkerTag[];
  comment?: string;
  hireAgain: boolean;
  createdAt: number;
  editedAt: number | null;
  editCount: number;
  /** Present when domain === "planner". */
  meta?: RatingPlannerMeta;
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
  workerMlId: string;
  /**
   * Reputation subject Mitra Labs ID.
   * For planner: legal corporate entity only.
   */
  employerMlId: string;
  /** Shift post ID, Career job ID, or Planner plan/epoch job key */
  jobId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  tags: WorkerEmployerTag[];
  comment?: string;
  workAgain: boolean;
  createdAt: number;
  editedAt: number | null;
  editCount: number;
  /** Present when domain === "planner". */
  meta?: RatingPlannerMeta;
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
  workerMlId: string;
  total: number;
  level: RatingLevel;
  history: PointsHistoryEntry[];
  updatedAt: number;
};

export type WorkerRatingSummary = {
  workerMlId: string;
  totalRatings: number;
  averageStars: number;
  tagCounts: Record<EmployerWorkerTag, number>;
  hireAgainCount: number;
  hireAgainTotal: number;
  level: RatingLevel;
  points: number;
};

export type EmployerRatingSummary = {
  employerMlId: string;
  totalRatings: number;
  averageStars: number;
  tagCounts: Record<WorkerEmployerTag, number>;
  workAgainCount: number;
  workAgainTotal: number;
};
