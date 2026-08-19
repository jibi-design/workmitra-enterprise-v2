import type { AuthUser } from "../../auth/types.js";
import type { ShiftApplicationRow } from "../../shift/types.js";
import { employerShiftRepository, isShiftUuid } from "../../employer/shift/shift.repository.js";
import { employerShiftService } from "../../employer/shift/shift.service.js";
import { logSecurityEvent } from "../../../observability/securityEvents.js";
import { emitShiftInboxNotification } from "../../notifications/shiftNotifications.emit.js";

export type ApplyShiftResult =
  | { ok: true; application: ShiftApplicationRow }
  | { ok: false; code: string; message: string; httpStatus: number };

export type ListShiftAppsResult =
  | { ok: true; applications: ShiftApplicationRow[] }
  | { ok: false; code: string; message: string; httpStatus: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Wave-4: session identity binds the worker key.
 * Never trust body.worker_wm_id (or query hints) over authenticated employee.id.
 */
function resolveWorkerWmId(employee: AuthUser, _body?: Record<string, unknown>): string | null {
  void _body;
  return employee.id.trim().toUpperCase() || null;
}

/** Defense Layer 2 — alert when client tries to supply a conflicting MUID (ignored by bind). */
function alertClaimedMuidMismatch(
  sessionWmId: string,
  claimed: string | undefined,
  source: string,
): void {
  const claim = claimed?.trim().toUpperCase();
  if (!claim || claim === sessionWmId) return;
  logSecurityEvent({
    event: "MUID_MISMATCH_ATTEMPT",
    httpStatus: 409,
    meta: { source, mismatch: true },
  });
}

export const employeeShiftService = {
  async listMyApplications(
    employee: AuthUser,
    workerWmIdHint?: string,
  ): Promise<ListShiftAppsResult> {
    const workerKey = employee.id.trim().toUpperCase();
    if (!workerKey) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Authenticated employee identity is required",
        httpStatus: 400,
      };
    }
    alertClaimedMuidMismatch(workerKey, workerWmIdHint, "list_applications_hint");
    const byAuth = await employerShiftRepository.listApplicationsByWorker(workerKey);
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

    const claimed =
      typeof body.worker_wm_id === "string"
        ? body.worker_wm_id
        : typeof body.workerWmId === "string"
          ? body.workerWmId
          : undefined;
    alertClaimedMuidMismatch(workerWmId, claimed, "apply_body");

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

    void emitShiftInboxNotification({
      recipientUserId: post.employer_id,
      eventType: "SHIFT_APPLICATION_SUBMITTED",
      title: "New shift application received",
      body: `A worker applied to ${post.job_name}.`,
      route: "/employer/shift",
      postId,
      appId: application.id,
      actorRole: "employee",
    });

    return { ok: true, application };
  },

  async withdrawApplication(
    applicationId: string,
    employee: AuthUser,
  ): Promise<ApplyShiftResult> {
    if (!isShiftUuid(applicationId)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "applicationId must be a valid UUID",
        httpStatus: 400,
      };
    }

    const workerKey = employee.id.trim().toUpperCase();
    try {
      const withdrawn = await employerShiftRepository.withTransaction(async (client) => {
        const locked = await employerShiftRepository.findApplicationByIdTx(client, applicationId);
        if (!locked) {
          throw Object.assign(new Error("Application not found"), {
            code: "NOT_FOUND",
            httpStatus: 404,
          });
        }
        if (locked.worker_wm_id.trim().toUpperCase() !== workerKey) {
          throw Object.assign(new Error("Application not found"), {
            code: "NOT_FOUND",
            httpStatus: 404,
          });
        }
        const updated = await employerShiftRepository.updateApplicationStatusIfConfirmableTx(
          client,
          applicationId,
          "withdrawn",
          ["applied", "shortlisted", "waiting"],
        );
        if (!updated) {
          throw Object.assign(new Error("Application cannot be withdrawn from its current status"), {
            code: "INVALID_STATE",
            httpStatus: 409,
          });
        }
        return updated;
      });

      const post = await employerShiftRepository.findPostById(withdrawn.post_id);
      if (post) {
        void emitShiftInboxNotification({
          recipientUserId: post.employer_id,
          eventType: "SHIFT_APPLICATION_WITHDRAWN",
          title: "Shift application withdrawn",
          body: `A worker withdrew from ${post.job_name}.`,
          route: "/employer/shift",
          postId: withdrawn.post_id,
          appId: withdrawn.id,
          actorRole: "employee",
        });
      }

      return { ok: true, application: withdrawn };
    } catch (err) {
      const code = typeof err === "object" && err && "code" in err ? String(err.code) : "ERROR";
      const httpStatus =
        typeof err === "object" && err && "httpStatus" in err
          ? Number((err as { httpStatus: number }).httpStatus)
          : 500;
      return {
        ok: false,
        code,
        message: err instanceof Error ? err.message : "Withdraw failed",
        httpStatus: Number.isFinite(httpStatus) ? httpStatus : 500,
      };
    }
  },
};
