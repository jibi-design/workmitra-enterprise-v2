/** Job Mitra | plannerGateApi.types.ts | Employer Planner plans API DTOs */

export interface PlannerApiEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

export type ServerPlannerPlanDto = {
  id: string;
  employer_user_id: string;
  name: string;
  status: string;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export const EMPLOYER_PLANNER_PLANS = "/v1/jobmitra/employer/planner/plans";
