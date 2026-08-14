/**
 * Demand Planner persistence — Postgres (planner_plans).
 */

import { getPool } from "../../../db/pool.js";

export type PlannerPlanRow = {
  readonly id: string;
  readonly employer_user_id: string;
  readonly name: string;
  readonly status: "draft" | "active" | "cancelled";
  readonly details: Record<string, unknown>;
  readonly created_at: string;
  readonly updated_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapRow(row: Record<string, unknown>): PlannerPlanRow {
  const status = row.status === "active" || row.status === "cancelled" ? row.status : "draft";
  return {
    id: String(row.id),
    employer_user_id: String(row.employer_user_id),
    name: String(row.name),
    status,
    details: isRecord(row.details) ? row.details : {},
    created_at:
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? ""),
    updated_at:
      row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at ?? ""),
  };
}

export const employerPlannerStore = {
  async listByEmployer(employerUserId: string): Promise<PlannerPlanRow[]> {
    const result = await getPool().query(
      `SELECT id, employer_user_id, name, status, details, created_at, updated_at
       FROM planner_plans
       WHERE employer_user_id = $1
       ORDER BY updated_at DESC`,
      [employerUserId],
    );
    return result.rows.map((row) => mapRow(row as Record<string, unknown>));
  },

  async create(params: {
    employerUserId: string;
    name: string;
    status: "draft" | "active" | "cancelled";
    details: Record<string, unknown>;
  }): Promise<PlannerPlanRow> {
    const result = await getPool().query(
      `INSERT INTO planner_plans (employer_user_id, name, status, details)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING id, employer_user_id, name, status, details, created_at, updated_at`,
      [params.employerUserId, params.name, params.status, JSON.stringify(params.details)],
    );
    return mapRow(result.rows[0] as Record<string, unknown>);
  },

  async update(params: {
    planId: string;
    employerUserId: string;
    name: string;
    status: "draft" | "active" | "cancelled";
    details: Record<string, unknown>;
  }): Promise<PlannerPlanRow | null> {
    const result = await getPool().query(
      `UPDATE planner_plans
       SET name = $3, status = $4, details = $5::jsonb, updated_at = now()
       WHERE id = $1 AND employer_user_id = $2
       RETURNING id, employer_user_id, name, status, details, created_at, updated_at`,
      [
        params.planId,
        params.employerUserId,
        params.name,
        params.status,
        JSON.stringify(params.details),
      ],
    );
    const row = result.rows[0];
    return row ? mapRow(row as Record<string, unknown>) : null;
  },

  async findById(planId: string): Promise<PlannerPlanRow | null> {
    const result = await getPool().query(
      `SELECT id, employer_user_id, name, status, details, created_at, updated_at
       FROM planner_plans WHERE id = $1`,
      [planId],
    );
    const row = result.rows[0];
    return row ? mapRow(row as Record<string, unknown>) : null;
  },
};
