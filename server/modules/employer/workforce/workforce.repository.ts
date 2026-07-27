import { getPool } from "../../../db/pool.js";
import type { WorkforceGroupMemberRow, WorkforceGroupRow } from "../../workforce/types.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isWorkforceUuid(id: string): boolean {
  return UUID_RE.test(id.trim());
}

function asDetails(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export const employerWorkforceRepository = {
  async listGroups(employerUserId: string): Promise<WorkforceGroupRow[]> {
    const result = await getPool().query<WorkforceGroupRow>(
      `SELECT id, employer_user_id, name, description, status,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM workforce_groups
       WHERE employer_user_id = $1
       ORDER BY created_at DESC
       LIMIT 500`,
      [employerUserId],
    );
    return result.rows;
  },

  async findGroupForEmployer(
    groupId: string,
    employerUserId: string,
  ): Promise<WorkforceGroupRow | null> {
    const result = await getPool().query<WorkforceGroupRow>(
      `SELECT id, employer_user_id, name, description, status,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM workforce_groups
       WHERE id = $1 AND employer_user_id = $2`,
      [groupId, employerUserId],
    );
    return result.rows[0] ?? null;
  },

  async createGroup(params: {
    employerUserId: string;
    name: string;
    description: string;
    status: string;
    details: Record<string, unknown>;
  }): Promise<WorkforceGroupRow> {
    const result = await getPool().query<WorkforceGroupRow>(
      `INSERT INTO workforce_groups
         (employer_user_id, name, description, status, details)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id, employer_user_id, name, description, status,
                 COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at`,
      [
        params.employerUserId,
        params.name,
        params.description,
        params.status,
        JSON.stringify(params.details),
      ],
    );
    return result.rows[0];
  },

  async updateGroup(
    groupId: string,
    employerUserId: string,
    patch: {
      name?: string;
      description?: string;
      status?: string;
      details?: Record<string, unknown>;
    },
  ): Promise<WorkforceGroupRow | null> {
    const existing = await this.findGroupForEmployer(groupId, employerUserId);
    if (!existing) return null;

    const nextName = patch.name?.trim() || existing.name;
    const nextDescription =
      typeof patch.description === "string" ? patch.description : existing.description;
    const nextStatus = patch.status?.trim() || existing.status;
    const nextDetails = { ...asDetails(existing.details), ...(patch.details ?? {}) };

    const result = await getPool().query<WorkforceGroupRow>(
      `UPDATE workforce_groups
       SET name = $3,
           description = $4,
           status = $5,
           details = $6::jsonb,
           updated_at = now()
       WHERE id = $1 AND employer_user_id = $2
       RETURNING id, employer_user_id, name, description, status,
                 COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at`,
      [groupId, employerUserId, nextName, nextDescription, nextStatus, JSON.stringify(nextDetails)],
    );
    return result.rows[0] ?? null;
  },

  async listMembers(groupId: string): Promise<WorkforceGroupMemberRow[]> {
    const result = await getPool().query<WorkforceGroupMemberRow>(
      `SELECT id, group_id, employee_user_id, employee_ml_id, role, status, joined_at,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM workforce_group_members
       WHERE group_id = $1
       ORDER BY joined_at DESC
       LIMIT 500`,
      [groupId],
    );
    return result.rows;
  },

  async addMember(params: {
    groupId: string;
    employeeUserId?: string | null;
    employeeMlId: string;
    role: string;
    status: string;
    details: Record<string, unknown>;
  }): Promise<WorkforceGroupMemberRow> {
    const result = await getPool().query<WorkforceGroupMemberRow>(
      `INSERT INTO workforce_group_members
         (group_id, employee_user_id, employee_ml_id, role, status, details)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       RETURNING id, group_id, employee_user_id, employee_ml_id, role, status, joined_at,
                 COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at`,
      [
        params.groupId,
        params.employeeUserId ?? null,
        params.employeeMlId,
        params.role,
        params.status,
        JSON.stringify(params.details),
      ],
    );
    return result.rows[0];
  },

  async removeMember(groupId: string, memberId: string): Promise<WorkforceGroupMemberRow | null> {
    const result = await getPool().query<WorkforceGroupMemberRow>(
      `DELETE FROM workforce_group_members
       WHERE id = $1 AND group_id = $2
       RETURNING id, group_id, employee_user_id, employee_ml_id, role, status, joined_at,
                 COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at`,
      [memberId, groupId],
    );
    return result.rows[0] ?? null;
  },
};
