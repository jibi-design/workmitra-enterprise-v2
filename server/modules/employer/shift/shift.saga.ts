/**
 * Employer Shift confirm saga — server-authoritative.
 * Steps mirror client confirmCandidate() with DB transaction rollback.
 * Planner / diary / pulse services are not on this Node server yet — recorded as shift_events.
 */

import type { AuthUser } from "../../auth/types.js";
import type { ShiftEventRow, ShiftWorkspaceRow } from "../../shift/types.js";
import { emitShiftConfirmedNotification } from "../../notifications/notifications.service.js";
import { employerShiftRepository, isShiftUuid } from "./shift.repository.js";

export type ConfirmShiftCandidateResult =
  | {
      ok: true;
      workspace: ShiftWorkspaceRow;
      events: ShiftEventRow[];
    }
  | { ok: false; code: string; message: string; httpStatus: number };

const CONFIRMABLE = new Set(["applied", "shortlisted", "waiting"]);

export async function confirmShiftCandidate(
  postId: string,
  appId: string,
  employer: AuthUser,
  workerWmIdHint?: string,
): Promise<ConfirmShiftCandidateResult> {
  if (!isShiftUuid(postId) || !isShiftUuid(appId)) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "postId and appId must be valid UUIDs",
      httpStatus: 400,
    };
  }

  const post = await employerShiftRepository.findPostById(postId);
  if (!post) {
    return { ok: false, code: "NOT_FOUND", message: "Shift post not found", httpStatus: 404 };
  }

  if (post.employer_id !== employer.id) {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "You do not own this shift post",
      httpStatus: 403,
    };
  }

  if (post.status !== "active") {
    return {
      ok: false,
      code: "INVALID_STATE",
      message: `Cannot confirm — post is '${post.status}'`,
      httpStatus: 409,
    };
  }

  const application = await employerShiftRepository.findApplicationById(appId);
  if (!application || application.post_id !== postId) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "Shift application not found for this post",
      httpStatus: 404,
    };
  }

  if (application.status === "confirmed") {
    return {
      ok: false,
      code: "ALREADY_CONFIRMED",
      message: "Application is already confirmed",
      httpStatus: 409,
    };
  }

  if (!CONFIRMABLE.has(application.status)) {
    return {
      ok: false,
      code: "NOT_CONFIRMABLE",
      message: `Cannot confirm application in '${application.status}' status`,
      httpStatus: 409,
    };
  }

  const workerWmId = (workerWmIdHint?.trim() || application.worker_wm_id).trim().toUpperCase();
  if (!workerWmId) {
    return {
      ok: false,
      code: "MISSING_MUID",
      message: "worker_wm_id is required to confirm",
      httpStatus: 400,
    };
  }

  const confirmedCount = await employerShiftRepository.countConfirmedForPost(postId);
  if (confirmedCount >= post.vacancies) {
    return {
      ok: false,
      code: "VACANCY_FULL",
      message: "No vacancies remaining on this shift post",
      httpStatus: 409,
    };
  }

  try {
    const result = await employerShiftRepository.withTransaction(async (client) => {
      // Step 1 — Update shift_applications status → confirmed
      const updatedApp = await employerShiftRepository.updateApplicationStatusTx(
        client,
        appId,
        "confirmed",
      );
      if (!updatedApp) {
        throw Object.assign(new Error("Failed to update application status"), {
          code: "APPLICATION_WRITE_ERROR",
          httpStatus: 500,
        });
      }

      // Step 2 — Create / upsert shift_workspaces
      const workspace = await employerShiftRepository.createWorkspaceTx(client, {
        postId,
        appId,
        workerWmId,
      });

      const events: ShiftEventRow[] = [];

      // Step 3 — Planner enroll (no server planner service yet → event stub)
      events.push(
        await employerShiftRepository.insertEventTx(client, {
          postId,
          kind: "planner_enroll_skipped",
          actorId: employer.id,
          meta: { reason: "planner_service_not_available", appId, workerWmId },
        }),
      );

      // Step 4 — Diary sync (no server diary service yet → event stub)
      events.push(
        await employerShiftRepository.insertEventTx(client, {
          postId,
          kind: "diary_sync_skipped",
          actorId: employer.id,
          meta: { reason: "diary_service_not_available", appId, workerWmId },
        }),
      );

      // Step 5 — Pulse emit happens after COMMIT (see below); record intent stub inside txn
      events.push(
        await employerShiftRepository.insertEventTx(client, {
          postId,
          kind: "pulse_emit_pending",
          actorId: employer.id,
          meta: { reason: "will_emit_after_commit", appId, workerWmId },
        }),
      );

      events.push(
        await employerShiftRepository.insertEventTx(client, {
          postId,
          kind: "candidate_confirmed",
          actorId: employer.id,
          meta: {
            appId,
            workerWmId,
            workspaceId: workspace.id,
          },
        }),
      );

      return { workspace, events };
    });

    const details =
      application.details && typeof application.details === "object"
        ? (application.details as Record<string, unknown>)
        : {};
    const applicantUserId =
      typeof details.applicant_user_id === "string" ? details.applicant_user_id : null;

    await emitShiftConfirmedNotification({
      workerWmId,
      applicantUserId,
      postId,
      appId,
      workspaceId: result.workspace.id,
      jobName: post.job_name,
    });

    return { ok: true, workspace: result.workspace, events: result.events };
  } catch (err) {
    const typed = err as { code?: string; message?: string; httpStatus?: number };
    return {
      ok: false,
      code: typed.code ?? "CONFIRM_FAILED",
      message: typed.message ?? "Confirm saga failed",
      httpStatus: typed.httpStatus ?? 500,
    };
  }
}
