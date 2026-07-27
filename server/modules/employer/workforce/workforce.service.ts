import type { AuthUser } from "../../auth/types.js";
import { employerWorkforceRepository, isWorkforceUuid } from "./workforce.repository.js";
import type { WorkforceGroupMemberRow, WorkforceGroupRow } from "../../workforce/types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export const employerWorkforceService = {
  async listGroups(
    employer: AuthUser,
  ): Promise<
    | { ok: true; groups: WorkforceGroupRow[] }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    try {
      const groups = await employerWorkforceRepository.listGroups(employer.id);
      return { ok: true, groups };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to list workforce groups",
        httpStatus: 500,
      };
    }
  },

  async createGroup(
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<
    | { ok: true; group: WorkforceGroupRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    const name = asString(body.name).trim();
    if (name.length < 1) {
      return { ok: false, code: "VALIDATION_ERROR", message: "name required", httpStatus: 400 };
    }
    const statusRaw = asString(body.status, "active");
    const status = statusRaw === "completed" ? "completed" : "active";
    const details = isRecord(body.details) ? body.details : { ...body };

    try {
      const group = await employerWorkforceRepository.createGroup({
        employerUserId: employer.id,
        name,
        description: asString(body.description),
        status,
        details,
      });
      return { ok: true, group };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to create workforce group",
        httpStatus: 500,
      };
    }
  },

  async updateGroup(
    groupId: string,
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<
    | { ok: true; group: WorkforceGroupRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    if (!isWorkforceUuid(groupId)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid group id", httpStatus: 400 };
    }

    const statusRaw = typeof body.status === "string" ? body.status.trim() : undefined;
    if (statusRaw && !["active", "completed"].includes(statusRaw)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid status", httpStatus: 400 };
    }

    const updated = await employerWorkforceRepository.updateGroup(groupId, employer.id, {
      name: typeof body.name === "string" ? body.name : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      status: statusRaw,
      details: isRecord(body.details) ? body.details : undefined,
    });
    if (!updated) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Workforce group not found",
        httpStatus: 404,
      };
    }
    return { ok: true, group: updated };
  },

  async listMembers(
    groupId: string,
    employer: AuthUser,
  ): Promise<
    | { ok: true; members: WorkforceGroupMemberRow[] }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    if (!isWorkforceUuid(groupId)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid group id", httpStatus: 400 };
    }
    const group = await employerWorkforceRepository.findGroupForEmployer(groupId, employer.id);
    if (!group) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Workforce group not found",
        httpStatus: 404,
      };
    }
    try {
      const members = await employerWorkforceRepository.listMembers(groupId);
      return { ok: true, members };
    } catch {
      return { ok: false, code: "DB_ERROR", message: "Failed to list members", httpStatus: 500 };
    }
  },

  async addMember(
    groupId: string,
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<
    | { ok: true; member: WorkforceGroupMemberRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    if (!isWorkforceUuid(groupId)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid group id", httpStatus: 400 };
    }
    const group = await employerWorkforceRepository.findGroupForEmployer(groupId, employer.id);
    if (!group) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Workforce group not found",
        httpStatus: 404,
      };
    }

    const employeeMlId = asString(
      body.employee_ml_id ?? body.employeeMlId ?? body.employeeUniqueId,
    ).trim();
    if (!employeeMlId) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "employee_ml_id required",
        httpStatus: 400,
      };
    }

    const statusRaw = asString(body.status, "active");
    const status = ["active", "exited", "replaced"].includes(statusRaw) ? statusRaw : "active";
    const details = isRecord(body.details) ? body.details : { ...body };

    try {
      const member = await employerWorkforceRepository.addMember({
        groupId,
        employeeUserId: typeof body.employee_user_id === "string" ? body.employee_user_id : null,
        employeeMlId,
        role: asString(body.role ?? body.categoryId),
        status,
        details,
      });
      return { ok: true, member };
    } catch {
      return { ok: false, code: "DB_ERROR", message: "Failed to add member", httpStatus: 500 };
    }
  },

  async removeMember(
    groupId: string,
    memberId: string,
    employer: AuthUser,
  ): Promise<
    | { ok: true; member: WorkforceGroupMemberRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    if (!isWorkforceUuid(groupId) || !isWorkforceUuid(memberId)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid id", httpStatus: 400 };
    }
    const group = await employerWorkforceRepository.findGroupForEmployer(groupId, employer.id);
    if (!group) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Workforce group not found",
        httpStatus: 404,
      };
    }

    const removed = await employerWorkforceRepository.removeMember(groupId, memberId);
    if (!removed) {
      return { ok: false, code: "NOT_FOUND", message: "Member not found", httpStatus: 404 };
    }
    return { ok: true, member: removed };
  },
};
