import type { AuthUser } from "../../auth/types.js";
import type { ShiftApplicationRow } from "../../shift/types.js";
import { employerShiftRepository, isShiftUuid } from "../../employer/shift/shift.repository.js";
import { employerShiftService } from "../../employer/shift/shift.service.js";

export type ApplyShiftResult =
  | { ok: true; application: ShiftApplicationRow }
  | { ok: false; code: string; message: string; httpStatus: number };

export type ListShiftAppsResult =
  | { ok: true; applications: ShiftApplicationRow[] }
  | { ok: false; code: string; message: string; httpStatus: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveWorkerWmId(employee: AuthUser, body: Record<string, unknown>): string | null {
  const fromBody = typeof body.worker_wm_id === "string" ? body.worker_wm_id.trim() : "";
  if (fromBody) return fromBody.toUpperCase();
  // Fallback: auth user id as stable worker key when legacy wmId missing
  return employee.id.trim().toUpperCase() || null;
}

export const employeeShiftService = {
  async listMyApplications(
    employee: AuthUser,
    workerWmIdHint?: string,
  ): Promise<ListShiftAppsResult> {
    const workerKey = (workerWmIdHint?.trim() || employee.id).toUpperCase();
    const byAuth = await employerShiftRepository.listApplicationsByWorker(workerKey);
    if (
      workerWmIdHint?.trim() &&
      workerWmIdHint.trim().toUpperCase() !== employee.id.toUpperCase()
    ) {
      const byHint = await employerShiftRepository.listApplicationsByWorker(workerWmIdHint.trim());
      const map = new Map<string, ShiftApplicationRow>();
      for (const row of [...byAuth, ...byHint]) map.set(row.id, row);
      return { ok: true, applications: [...map.values()] };
    }
    return { ok: true, applications: byAuth };
  },

  async applyToPost(
    postId: string,
    employee: AuthUser,
    body: Record<string, unknown>,
  ): Promise<ApplyShiftResult> {
    if (!isShiftUuid(postId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "postId must be a valid UUID",
        httpStatus: 400,
      };
    }

    const post = await employerShiftService.getPublishedPost(postId);
    if (!post) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Shift post not found or not active",
        httpStatus: 404,
      };
    }

    const workerWmId = resolveWorkerWmId(employee, body);
    if (!workerWmId) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "worker_wm_id is required",
        httpStatus: 400,
      };
    }

    const existing = await employerShiftRepository.findApplicationByPostAndWorker(
      postId,
      workerWmId,
    );
    if (existing) {
      return {
        ok: false,
        code: "CONFLICT",
        message: "You have already applied to this shift post",
        httpStatus: 409,
      };
    }

    const details = isRecord(body.details) ? { ...body.details } : {};
    details.applicant_user_id = employee.id;

    const application = await employerShiftRepository.createApplication({
      postId,
      workerWmId,
      details,
    });

    return { ok: true, application };
  },
};
