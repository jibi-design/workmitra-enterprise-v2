/** Job Mitra | plannerGateApi.client.ts | GET/POST/PATCH /v1/jobmitra/employer/planner/plans */

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { apiService } from "../../../../shared/services/apiService";
import { isPlannerServerUuid } from "../utils/plannerPlanIdBridge";
import {
  EMPLOYER_PLANNER_PLANS,
  type PlannerApiEnvelope,
  type ServerPlannerPlanDto,
} from "./plannerGateApi.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPlannerApiSyncEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

export function asServerPlannerPlan(value: unknown): ServerPlannerPlanDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  if (!isPlannerServerUuid(id)) return null;
  const detailsRaw = value.details;
  return {
    id,
    employer_user_id: typeof value.employer_user_id === "string" ? value.employer_user_id : "",
    name: typeof value.name === "string" ? value.name : "",
    status: typeof value.status === "string" ? value.status : "draft",
    details: isRecord(detailsRaw) ? detailsRaw : {},
    created_at: typeof value.created_at === "string" ? value.created_at : "",
    updated_at: typeof value.updated_at === "string" ? value.updated_at : "",
  };
}

export const plannerGateApi = {
  async listMyPlans(): Promise<ServerPlannerPlanDto[]> {
    const res =
      await apiService.get<PlannerApiEnvelope<{ plans: unknown }>>(EMPLOYER_PLANNER_PLANS);
    const raw = res.data.plans;
    if (!Array.isArray(raw)) return [];
    return raw.map(asServerPlannerPlan).filter((row): row is ServerPlannerPlanDto => row !== null);
  },

  async createPlan(body: Record<string, unknown>): Promise<ServerPlannerPlanDto> {
    const res = await apiService.post<PlannerApiEnvelope<{ plan: unknown }>>(
      EMPLOYER_PLANNER_PLANS,
      body,
    );
    const plan = asServerPlannerPlan(res.data.plan);
    if (!plan) throw new Error("Invalid create plan response: missing plan UUID");
    return plan;
  },

  async updatePlan(planId: string, body: Record<string, unknown>): Promise<ServerPlannerPlanDto> {
    const res = await apiService.patch<PlannerApiEnvelope<{ plan: unknown }>>(
      `${EMPLOYER_PLANNER_PLANS}/${encodeURIComponent(planId)}`,
      body,
    );
    const plan = asServerPlannerPlan(res.data.plan);
    if (!plan) throw new Error("Invalid update plan response: missing plan UUID");
    return plan;
  },
};
