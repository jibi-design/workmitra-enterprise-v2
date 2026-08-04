/**
 * Phase-0 in-memory Planner plans store (server publish surface).
 * Client LS planner remains primary for AUTH-off lab; AUTH-on live publish goes through here.
 */

export type PlannerPlanRow = {
  readonly id: string;
  readonly employer_user_id: string;
  readonly name: string;
  readonly status: "draft" | "active" | "cancelled";
  readonly details: Record<string, unknown>;
  readonly created_at: string;
  readonly updated_at: string;
};

const plans = new Map<string, PlannerPlanRow>();

function newId(): string {
  return crypto.randomUUID();
}

export const employerPlannerStore = {
  listByEmployer(employerUserId: string): PlannerPlanRow[] {
    return [...plans.values()].filter((p) => p.employer_user_id === employerUserId);
  },

  create(params: {
    employerUserId: string;
    name: string;
    status: "draft" | "active" | "cancelled";
    details: Record<string, unknown>;
  }): PlannerPlanRow {
    const now = new Date().toISOString();
    const row: PlannerPlanRow = {
      id: newId(),
      employer_user_id: params.employerUserId,
      name: params.name,
      status: params.status,
      details: params.details,
      created_at: now,
      updated_at: now,
    };
    plans.set(row.id, row);
    return row;
  },

  update(params: {
    planId: string;
    employerUserId: string;
    name: string;
    status: "draft" | "active" | "cancelled";
    details: Record<string, unknown>;
  }): PlannerPlanRow | null {
    const existing = plans.get(params.planId);
    if (!existing || existing.employer_user_id !== params.employerUserId) return null;
    const row: PlannerPlanRow = {
      ...existing,
      name: params.name,
      status: params.status,
      details: params.details,
      updated_at: new Date().toISOString(),
    };
    plans.set(row.id, row);
    return row;
  },

  findById(planId: string): PlannerPlanRow | null {
    return plans.get(planId) ?? null;
  },
};
