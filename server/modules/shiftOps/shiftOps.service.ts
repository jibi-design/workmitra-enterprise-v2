import { randomBytes, timingSafeEqual } from "node:crypto";
import type { AuthUser } from "../auth/types.js";
import { hashQrToken, shiftOpsRepository } from "./shiftOps.repository.js";

export type ShiftOpsResult<T> =
  { ok: true; data: T } | { ok: false; code: string; message: string; httpStatus: number };

function asUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function hashesEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length || ba.length === 0) return false;
  return timingSafeEqual(ba, bb);
}

function workerMatches(workerWmId: string, user: AuthUser): boolean {
  return workerWmId.trim().toLowerCase() === user.id.toLowerCase();
}

export const shiftOpsService = {
  async issueCheckinToken(
    workspaceId: string,
    employer: AuthUser,
  ): Promise<ShiftOpsResult<{ qrToken: string; workspaceId: string }>> {
    if (!asUuid(workspaceId)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid workspace", httpStatus: 400 };
    }
    const ws = await shiftOpsRepository.findWorkspaceWithPost(workspaceId);
    if (!ws || ws.employer_id !== employer.id) {
      return { ok: false, code: "NOT_FOUND", message: "Workspace not found", httpStatus: 404 };
    }
    const qrToken = randomBytes(24).toString("base64url");
    await shiftOpsRepository.upsertQrHash(workspaceId, hashQrToken(qrToken), employer.id);
    return { ok: true, data: { qrToken, workspaceId } };
  },

  async checkIn(
    workspaceId: string,
    employee: AuthUser,
    qrToken: string,
  ): Promise<ShiftOpsResult<{ attendance: unknown; elapsedMs: number }>> {
    if (!asUuid(workspaceId) || !qrToken.trim()) {
      return { ok: false, code: "VALIDATION_ERROR", message: "QR token required", httpStatus: 400 };
    }
    const ws = await shiftOpsRepository.findWorkspaceWithPost(workspaceId);
    if (!ws || ws.status !== "active" || !workerMatches(ws.worker_wm_id, employee)) {
      return { ok: false, code: "FORBIDDEN", message: "Not your workspace", httpStatus: 403 };
    }
    const stored = await shiftOpsRepository.findQrHash(workspaceId);
    if (!stored || !hashesEqual(stored, hashQrToken(qrToken.trim()))) {
      return { ok: false, code: "INVALID_QR", message: "QR token mismatch", httpStatus: 403 };
    }
    const open = await shiftOpsRepository.findOpenAttendance(workspaceId);
    if (open) {
      const elapsedMs = Date.now() - new Date(open.checked_in_at).getTime();
      return { ok: true, data: { attendance: open, elapsedMs } };
    }
    const attendance = await shiftOpsRepository.insertCheckIn(workspaceId, employee.id);
    return { ok: true, data: { attendance, elapsedMs: 0 } };
  },

  async checkOut(
    workspaceId: string,
    employee: AuthUser,
  ): Promise<ShiftOpsResult<{ attendance: unknown; elapsedMs: number }>> {
    if (!asUuid(workspaceId)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid workspace", httpStatus: 400 };
    }
    const ws = await shiftOpsRepository.findWorkspaceWithPost(workspaceId);
    if (!ws || !workerMatches(ws.worker_wm_id, employee)) {
      return { ok: false, code: "FORBIDDEN", message: "Not your workspace", httpStatus: 403 };
    }
    const open = await shiftOpsRepository.findOpenAttendance(workspaceId);
    if (!open) {
      return { ok: false, code: "NOT_FOUND", message: "No open attendance", httpStatus: 404 };
    }
    const attendance = await shiftOpsRepository.checkOut(open.id, employee.id);
    if (!attendance) {
      return { ok: false, code: "NOT_FOUND", message: "No open attendance", httpStatus: 404 };
    }
    const elapsedMs =
      new Date(attendance.checked_out_at ?? Date.now()).getTime() -
      new Date(attendance.checked_in_at).getTime();
    return { ok: true, data: { attendance, elapsedMs } };
  },

  async listAttendance(
    workspaceId: string,
    user: AuthUser,
    role: "employee" | "employer",
  ): Promise<ShiftOpsResult<{ sessions: unknown[]; openElapsedMs: number | null }>> {
    const ws = await shiftOpsRepository.findWorkspaceWithPost(workspaceId);
    if (!ws) {
      return { ok: false, code: "NOT_FOUND", message: "Workspace not found", httpStatus: 404 };
    }
    if (role === "employer" && ws.employer_id !== user.id) {
      return { ok: false, code: "FORBIDDEN", message: "Not your post", httpStatus: 403 };
    }
    if (role === "employee" && !workerMatches(ws.worker_wm_id, user)) {
      return { ok: false, code: "FORBIDDEN", message: "Not your workspace", httpStatus: 403 };
    }
    const sessions = await shiftOpsRepository.listAttendance(workspaceId);
    const open = sessions.find((s) => s.checked_out_at == null);
    return {
      ok: true,
      data: {
        sessions,
        openElapsedMs: open ? Date.now() - new Date(open.checked_in_at).getTime() : null,
      },
    };
  },

  async submitReview(
    user: AuthUser,
    role: "employee" | "employer",
    body: Record<string, unknown>,
  ): Promise<ShiftOpsResult<{ id: string }>> {
    const rating = typeof body.rating === "number" ? body.rating : Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "rating 1-5 required",
        httpStatus: 400,
      };
    }
    const workspaceId =
      typeof body.workspaceId === "string" && asUuid(body.workspaceId) ? body.workspaceId : null;
    const employmentId =
      typeof body.employmentId === "string" && asUuid(body.employmentId) ? body.employmentId : null;
    if (!workspaceId && !employmentId) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "workspaceId or employmentId required",
        httpStatus: 400,
      };
    }
    let revieweeUserId = typeof body.revieweeUserId === "string" ? body.revieweeUserId.trim() : "";
    if (workspaceId) {
      const ws = await shiftOpsRepository.findWorkspaceWithPost(workspaceId);
      if (!ws) {
        return { ok: false, code: "NOT_FOUND", message: "Workspace not found", httpStatus: 404 };
      }
      if (role === "employer") {
        if (ws.employer_id !== user.id) {
          return { ok: false, code: "FORBIDDEN", message: "Not your post", httpStatus: 403 };
        }
        revieweeUserId = asUuid(ws.worker_wm_id) ? ws.worker_wm_id : revieweeUserId;
      } else {
        if (!workerMatches(ws.worker_wm_id, user)) {
          return { ok: false, code: "FORBIDDEN", message: "Not your workspace", httpStatus: 403 };
        }
        revieweeUserId = ws.employer_id;
      }
    }
    if (employmentId && !workspaceId) {
      const emp = await shiftOpsRepository.findEmployment(employmentId);
      if (!emp) {
        return { ok: false, code: "NOT_FOUND", message: "Employment not found", httpStatus: 404 };
      }
      if (role === "employer") {
        if (emp.employer_user_id !== user.id) {
          return { ok: false, code: "FORBIDDEN", message: "Not your staff", httpStatus: 403 };
        }
        revieweeUserId = emp.employee_user_id;
      } else {
        if (emp.employee_user_id !== user.id) {
          return { ok: false, code: "FORBIDDEN", message: "Not your employment", httpStatus: 403 };
        }
        revieweeUserId = emp.employer_user_id;
      }
    }
    if (!asUuid(revieweeUserId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "revieweeUserId required",
        httpStatus: 400,
      };
    }
    const row = await shiftOpsRepository.insertReview({
      workspaceId,
      employmentId,
      reviewerUserId: user.id,
      revieweeUserId,
      direction: role === "employer" ? "employer_to_employee" : "employee_to_employer",
      rating,
      body: typeof body.body === "string" ? body.body.trim() : "",
    });
    return { ok: true, data: row };
  },
};
