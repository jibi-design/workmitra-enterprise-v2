import type { AuthUser } from "../../auth/types.js";
import { isLivePlannerStatus } from "../verification/employerMaturity.policy.js";
import { employerVerificationService } from "../verification/employerVerification.service.js";
import { parsePincode } from "../../location/pincode.js";
import { employerPlannerStore, type PlannerPlanRow } from "./planner.store.js";

export type PlannerMutationResult =
  | { ok: true; plan: PlannerPlanRow }
  | {
      ok: false;
      code: string;
      message: string;
      httpStatus: number;
      reason?: string;
      maturityStage?: string;
    };

export type PlannerListResult =
  | { ok: true; plans: PlannerPlanRow[] }
  | { ok: false; code: string; message: string; httpStatus: number };

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergePlannerDetails(
  body: Record<string, unknown>,
  existing?: Record<string, unknown>,
): Record<string, unknown> {
  const details = {
    ...(existing ?? {}),
    ...(isRecord(body.details) ? body.details : {}),
  };
  const pin =
    parsePincode(typeof body.locationPincode === "string" ? body.locationPincode : null) ??
    parsePincode(typeof details.locationPincode === "string" ? details.locationPincode : null);
  if (pin) details.locationPincode = pin;
  return details;
}

function gateLivePublish(employer: AuthUser, status: string): PlannerMutationResult | null {
  if (!isLivePlannerStatus(status)) return null;
  const gate = employerVerificationService.assertEmployerCanPublishLive(employer);
  if (gate.ok) return null;
  return {
    ok: false,
    code: gate.code,
    reason: gate.reason,
    message: gate.message,
    httpStatus: gate.httpStatus,
    maturityStage: gate.maturityStage,
  };
}

export const employerPlannerService = {
  async listMyPlans(employer: AuthUser): Promise<PlannerListResult> {
    return { ok: true, plans: await employerPlannerStore.listByEmployer(employer.id) };
  },

  async createPlan(
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<PlannerMutationResult> {
    const name = asNonEmptyString(body.name) ?? asNonEmptyString(body.title);
    if (!name) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "name is required",
        httpStatus: 400,
      };
    }

    const statusRaw = typeof body.status === "string" ? body.status.trim() : "active";
    if (statusRaw !== "draft" && statusRaw !== "active" && statusRaw !== "cancelled") {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "status must be draft, active, or cancelled",
        httpStatus: 400,
      };
    }

    const denied = gateLivePublish(employer, statusRaw);
    if (denied) return denied;

    const details = mergePlannerDetails(body);
    const plan = await employerPlannerStore.create({
      employerUserId: employer.id,
      name,
      status: statusRaw,
      details,
    });
    return { ok: true, plan };
  },

  async updatePlan(
    planId: string,
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<PlannerMutationResult> {
    const existing = await employerPlannerStore.findById(planId);
    if (!existing) {
      return { ok: false, code: "NOT_FOUND", message: "Plan not found", httpStatus: 404 };
    }
    if (existing.employer_user_id !== employer.id) {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "You do not own this plan",
        httpStatus: 403,
      };
    }

    const name = asNonEmptyString(body.name) ?? asNonEmptyString(body.title) ?? existing.name;
    const statusRaw = typeof body.status === "string" ? body.status.trim() : existing.status;
    if (statusRaw !== "draft" && statusRaw !== "active" && statusRaw !== "cancelled") {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "status must be draft, active, or cancelled",
        httpStatus: 400,
      };
    }

    const denied = gateLivePublish(employer, statusRaw);
    if (denied) return denied;

    const details = mergePlannerDetails(body, isRecord(existing.details) ? existing.details : {});

    const plan = await employerPlannerStore.update({
      planId,
      employerUserId: employer.id,
      name,
      status: statusRaw,
      details,
    });
    if (!plan) {
      return { ok: false, code: "NOT_FOUND", message: "Plan not found", httpStatus: 404 };
    }
    return { ok: true, plan };
  },
};
