/** Job Mitra | demandPlanner.schema.ts | Hybrid A2 P1.1 DemandPlan schema v2 */

/** Planner-owned experience label (mirrors Shift union; no shiftJobs import). */
export type ExperienceLabel = "helper" | "fresher_ok" | "experienced";

/** Storage key remains v1 for compatibility; payload schemaVersion tracks shape. */
export const DEMAND_PLANS_STORAGE_KEY = "wm_employer_demand_plans_v1";
export const DEMAND_PLANS_CHANGED_EVENT = "wm:employer-demand-plans-changed";

export const DEMAND_PLAN_SCHEMA_VERSION = 2 as const;
export const DEFAULT_PLANNER_EPOCH_DAYS = 30;

export type WorkingDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Employer-defined role crew buckets on a DemandPlan (Kitchen, Security, …). */
export type PlanRoleGroup = {
  id: string;
  label: string;
  color?: string;
  workerMlIds: string[];
};

export type DaySlot = {
  date: string;
  workers: number;
  payPerDay: number;
  category?: string;
  /**
   * Legacy Phase-0 Shift post id.
   * P1.7+: new publishes do not create child posts; keep when already present for legacy plans.
   */
  postId?: string;
  /** Stable planner-owned slot identity (schema v2). */
  slotId?: string;
  /** Reserved for Planner assignment binding (Section 3+). */
  assignmentId?: string;
};

export type DemandPlanStatus = "draft" | "active" | "completed" | "cancelled";
export type PublishStatus = "idle" | "publishing" | "published" | "failed";

/**
 * DemandPlan schema v2 (Hybrid A2).
 * Readers always normalize to this shape via migrateDemandPlanToV2.
 */
export type DemandPlan = {
  id: string;
  name: string;
  companyName: string;
  locationName: string;
  /** Work area code for commute matching. Empty = no nearby matches. */
  locationPincode?: string;
  category: string;
  experience: ExperienceLabel;
  startDate: string;
  endDate: string;
  workingDays: WorkingDay[];
  slots: DaySlot[];
  status: DemandPlanStatus;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  description?: string;
  draftStep?: 1 | 2 | 3;
  publishStatus?: PublishStatus;
  publishRequestId?: string;
  publishError?: string;
  cancelledAt?: number;
  cancelReason?: string;
  /** Always 2 after migrate / create. */
  schemaVersion: typeof DEMAND_PLAN_SCHEMA_VERSION;
  /** Legal corporate entity Mitra Labs ID (rating reputation subject). */
  legalEntityMlId: string;
  /** Optional site / location entity for telemetry. */
  siteId?: string;
  /** Site supervisor — telemetry only; never public reputation subject. */
  siteManagerId?: string;
  /** Extra backup workers beyond per-day slot.workers (soft capacity only). */
  waitingBuffer?: number;
  /** Optional role groups for crew assignment / targeted broadcast. */
  roleGroups?: PlanRoleGroup[];
  /** Milestone epoch length in days (default 30). */
  epochDays: number;
  /** Next epoch index to commit (0-based). */
  milestoneCursor: number;
  offboardedAt?: number;
  completedAt?: number;
};

export type DemandPlanCreateInput = Omit<
  DemandPlan,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "schemaVersion"
  | "legalEntityMlId"
  | "epochDays"
  | "milestoneCursor"
> & {
  legalEntityMlId?: string;
  epochDays?: number;
  milestoneCursor?: number;
  siteId?: string;
  siteManagerId?: string;
  waitingBuffer?: number;
  roleGroups?: PlanRoleGroup[];
};

export function buildPlannerSlotId(planId: string, date: string): string {
  const safeDate = date.trim() || "unknown";
  const safePlan = planId.trim() || "plan";
  return `sl_${safePlan}_${safeDate}`;
}
