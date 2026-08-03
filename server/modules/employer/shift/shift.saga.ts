/**
 * Employer Shift confirm saga — server-authoritative.
 * Steps mirror client confirmCandidate() with DB transaction rollback.
 * Planner / diary / pulse services are not on this Node server yet — recorded as shift_events.
 *
 * Wave-1: vacancy count + status CAS run INSIDE the transaction under SELECT … FOR UPDATE.
 */

import type { AuthUser } from "../../auth/types.js";
import type { ShiftApplicationRow, ShiftEventRow, ShiftWorkspaceRow } from "../../shift/types.js";
import { emitShiftConfirmedNotification } from "../../notifications/notifications.service.js";
import { logSecurityEvent } from "../../../observability/securityEvents.js";
import { employerShiftRepository, isShiftUuid } from "./shift.repository.js";
import { shiftDirectInviteStore } from "./shiftDirectInvite.store.js";

export type ConfirmShiftCandidateResult =
  | {
      ok: true;
      workspace: ShiftWorkspaceRow;
      application: ShiftApplicationRow;
      events: ShiftEventRow[];
    }
  | { ok: false; code: string; message: string; httpStatus: number };

const CONFIRMABLE = ["applied", "shortlisted", "waiting"] as const;
const CONFIRMABLE_SET = new Set<string>(CONFIRMABLE);

function fail(code: string, message: string, httpStatus: number): ConfirmShiftCandidateResult {
  return { ok: false, code, message, httpStatus };
}

function throwConfirmError(code: string, message: string, httpStatus: number): never {
  throw Object.assign(new Error(message), { code, httpStatus });
}

async function runConfirmInTransaction(params: {
  postId: string;
  appId: string;
  actorId: string;
  workerWmId: string;
}): Promise<{
  workspace: ShiftWorkspaceRow;
  application: ShiftApplicationRow;
  events: ShiftEventRow[];
}> {
  const { postId, appId, actorId, workerWmId } = params;

  return employerShiftRepository.withTransaction(async (client) => {
    const lockedPost = await employerShiftRepository.lockPostForUpdateTx(client, postId);
    if (!lockedPost) {
      throwConfirmError("NOT_FOUND", "Shift post not found", 404);
    }
    if (lockedPost.status !== "active") {
      throwConfirmError("INVALID_STATE", `Cannot confirm — post is '${lockedPost.status}'`, 409);
    }

    const confirmedCount = await employerShiftRepository.countConfirmedForPostTx(client, postId);
    if (confirmedCount >= lockedPost.vacancies) {
      throwConfirmError("VACANCY_FULL", "No vacancies remaining on this shift post", 409);
    }

    const lockedApp = await employerShiftRepository.findApplicationByIdTx(client, appId);
    if (!lockedApp || lockedApp.post_id !== postId) {
      throwConfirmError("NOT_FOUND", "Shift application not found for this post", 404);
    }
    if (lockedApp.status === "confirmed") {
      throwConfirmError("ALREADY_CONFIRMED", "Application is already confirmed", 409);
    }
    if (!CONFIRMABLE_SET.has(lockedApp.status)) {
      throwConfirmError(
        "NOT_CONFIRMABLE",
        `Cannot confirm application in '${lockedApp.status}' status`,
        409,
      );
    }

    const updatedApp = await employerShiftRepository.updateApplicationStatusIfConfirmableTx(
      client,
      appId,
      "confirmed",
      CONFIRMABLE,
    );
    if (!updatedApp) {
      throwConfirmError(
        "CONFIRM_RACE",
        "Application status changed concurrently — confirm aborted",
        409,
      );
    }

    const workspace = await employerShiftRepository.createWorkspaceTx(client, {
      postId,
      appId,
      workerWmId,
    });

    const events: ShiftEventRow[] = [];

    events.push(
      await employerShiftRepository.insertEventTx(client, {
        postId,
        kind: "planner_enroll_skipped",
        actorId,
        meta: { reason: "planner_service_not_available", appId, workerWmId },
      }),
    );

    events.push(
      await employerShiftRepository.insertEventTx(client, {
        postId,
        kind: "diary_sync_skipped",
        actorId,
        meta: { reason: "diary_service_not_available", appId, workerWmId },
      }),
    );

    events.push(
      await employerShiftRepository.insertEventTx(client, {
        postId,
        kind: "pulse_emit_pending",
        actorId,
        meta: { reason: "will_emit_after_commit", appId, workerWmId },
      }),
    );

    events.push(
      await employerShiftRepository.insertEventTx(client, {
        postId,
        kind: "candidate_confirmed",
        actorId,
        meta: {
          appId,
          workerWmId,
          workspaceId: workspace.id,
        },
      }),
    );

    return { workspace, application: updatedApp, events };
  });
}

export async function confirmShiftCandidate(
  postId: string,
  appId: string,
  employer: AuthUser,
  workerWmIdHint?: string,
): Promise<ConfirmShiftCandidateResult> {
  if (!isShiftUuid(postId) || !isShiftUuid(appId)) {
    return fail("VALIDATION_ERROR", "postId and appId must be valid UUIDs", 400);
  }

  const post = await employerShiftRepository.findPostById(postId);
  if (!post) {
    return fail("NOT_FOUND", "Shift post not found", 404);
  }

  if (post.employer_id !== employer.id) {
    return fail("FORBIDDEN", "You do not own this shift post", 403);
  }

  if (post.status !== "active") {
    return fail("INVALID_STATE", `Cannot confirm — post is '${post.status}'`, 409);
  }

  const application = await employerShiftRepository.findApplicationById(appId);
  if (!application || application.post_id !== postId) {
    return fail("NOT_FOUND", "Shift application not found for this post", 404);
  }

  if (application.status === "confirmed") {
    return fail("ALREADY_CONFIRMED", "Application is already confirmed", 409);
  }

  if (!CONFIRMABLE_SET.has(application.status)) {
    return fail(
      "NOT_CONFIRMABLE",
      `Cannot confirm application in '${application.status}' status`,
      409,
    );
  }

  // Wave-5: bind workspace MUID strictly to application — never trust body
  const workerWmId = application.worker_wm_id.trim().toUpperCase();
  if (!workerWmId) {
    return fail("MISSING_MUID", "Application is missing worker_wm_id", 400);
  }
  const hint = workerWmIdHint?.trim().toUpperCase();
  if (hint && hint !== workerWmId) {
    logSecurityEvent({
      event: "MUID_MISMATCH_ATTEMPT",
      path: `/employer/shift/posts/${postId}/applications/${appId}/confirm`,
      method: "POST",
      httpStatus: 409,
      meta: { source: "confirm_hint", mismatch: true },
    });
    return fail(
      "MUID_MISMATCH",
      "body.worker_wm_id must match the application worker identity",
      409,
    );
  }

  try {
    const result = await runConfirmInTransaction({
      postId,
      appId,
      actorId: employer.id,
      workerWmId,
    });

    const details =
      application.details && typeof application.details === "object"
        ? (application.details as Record<string, unknown>)
        : {};
    const applicantUserId =
      typeof details.applicant_user_id === "string" ? details.applicant_user_id : null;

    // Wave-5: post-commit notification must not flip confirm to HTTP failure (split-brain)
    try {
      await emitShiftConfirmedNotification({
        workerWmId,
        applicantUserId,
        postId,
        appId,
        workspaceId: result.workspace.id,
        jobName: post.job_name,
      });
    } catch (notifyErr) {
      console.warn(
        "[shift.confirm] notification failed after commit — confirm still success:",
        notifyErr instanceof Error ? notifyErr.message : "unknown",
      );
    }

    return {
      ok: true,
      workspace: result.workspace,
      application: result.application,
      events: result.events,
    };
  } catch (err) {
    const typed = err as { code?: string; message?: string; httpStatus?: number };
    return fail(
      typed.code ?? "CONFIRM_FAILED",
      typed.message ?? "Confirm saga failed",
      typed.httpStatus ?? 500,
    );
  }
}

/**
 * Wave-1: employee direct-invite accept — find-or-create application + vacancy-locked confirm
 * in one transaction (same CAS path as employer confirm).
 */
export async function acceptDirectInviteShift(
  postId: string,
  employee: AuthUser,
  body: Record<string, unknown>,
): Promise<ConfirmShiftCandidateResult> {
  if (!isShiftUuid(postId)) {
    return fail("VALIDATION_ERROR", "postId must be a valid UUID", 400);
  }

  const post = await employerShiftRepository.findPostById(postId);
  if (!post) {
    return fail("NOT_FOUND", "Shift post not found", 404);
  }
  if (post.status !== "active") {
    return fail("INVALID_STATE", `Cannot accept invite — post is '${post.status}'`, 409);
  }

  // Wave-4: bind to authenticated session identity — ignore body.worker_wm_id
  const workerWmId = employee.id.trim().toUpperCase();
  if (!workerWmId) {
    return fail("VALIDATION_ERROR", "Authenticated employee identity is required", 400);
  }

  const claimedBodyWm =
    typeof body.worker_wm_id === "string"
      ? body.worker_wm_id
      : typeof body.workerWmId === "string"
        ? body.workerWmId
        : undefined;
  if (claimedBodyWm?.trim() && claimedBodyWm.trim().toUpperCase() !== workerWmId) {
    logSecurityEvent({
      event: "MUID_MISMATCH_ATTEMPT",
      path: `/employee/shift/posts/${postId}/direct-accept`,
      method: "POST",
      httpStatus: 409,
      meta: { source: "direct_accept_body", mismatch: true },
    });
  }

  const inviteId =
    typeof body.invite_id === "string"
      ? body.invite_id.trim()
      : typeof body.inviteId === "string"
        ? body.inviteId.trim()
        : undefined;
  const inviteToken =
    typeof body.invite_token === "string"
      ? body.invite_token.trim()
      : typeof body.inviteToken === "string"
        ? body.inviteToken.trim()
        : undefined;

  // Wave-5.1 R2: token mandatory (id alone is insufficient)
  const proof = shiftDirectInviteStore.validateAcceptProof({
    postId,
    workerWmId,
    inviteId,
    token: inviteToken,
  });
  if (!proof.ok) {
    return fail(proof.code, proof.message, proof.httpStatus);
  }

  const detailsIn =
    body.details && typeof body.details === "object" && !Array.isArray(body.details)
      ? { ...(body.details as Record<string, unknown>) }
      : {};
  detailsIn.applicant_user_id = employee.id;
  detailsIn.source = "direct_invite";

  try {
    const result = await employerShiftRepository.withTransaction(async (client) => {
      // Wave-5.1 R1: consume invite atomically inside the same txn as vacancy CAS
      const inviteResult = await shiftDirectInviteStore.consumePendingTx(client, {
        postId,
        workerWmId,
        token: proof.token,
        inviteId: proof.inviteId,
      });
      if (!inviteResult.ok) {
        throwConfirmError(inviteResult.code, inviteResult.message, inviteResult.httpStatus);
      }
      detailsIn.invite_id = inviteResult.invite.id;

      const lockedPost = await employerShiftRepository.lockPostForUpdateTx(client, postId);
      if (!lockedPost) {
        throwConfirmError("NOT_FOUND", "Shift post not found", 404);
      }
      if (lockedPost.status !== "active") {
        throwConfirmError(
          "INVALID_STATE",
          `Cannot accept invite — post is '${lockedPost.status}'`,
          409,
        );
      }

      const confirmedCount = await employerShiftRepository.countConfirmedForPostTx(client, postId);
      if (confirmedCount >= lockedPost.vacancies) {
        throwConfirmError("VACANCY_FULL", "No vacancies remaining on this shift post", 409);
      }

      let app = await employerShiftRepository.findApplicationByPostAndWorkerTx(
        client,
        postId,
        workerWmId,
      );

      if (!app) {
        app = await employerShiftRepository.createApplicationTx(client, {
          postId,
          workerWmId,
          details: detailsIn,
        });
      } else {
        const applicantUserId =
          app.details && typeof app.details === "object"
            ? (app.details as Record<string, unknown>).applicant_user_id
            : undefined;
        const ownedByEmployee =
          (typeof applicantUserId === "string" && applicantUserId === employee.id) ||
          app.worker_wm_id.trim().toUpperCase() === workerWmId;
        if (!ownedByEmployee) {
          throwConfirmError("FORBIDDEN", "This application belongs to another worker", 403);
        }
        if (app.status === "confirmed") {
          throwConfirmError("ALREADY_CONFIRMED", "You are already confirmed for this shift", 409);
        }
        if (!CONFIRMABLE_SET.has(app.status)) {
          throwConfirmError(
            "NOT_CONFIRMABLE",
            `Cannot accept invite in '${app.status}' status`,
            409,
          );
        }
      }

      const updatedApp = await employerShiftRepository.updateApplicationStatusIfConfirmableTx(
        client,
        app.id,
        "confirmed",
        CONFIRMABLE,
      );
      if (!updatedApp) {
        throwConfirmError(
          "CONFIRM_RACE",
          "Application status changed concurrently — accept aborted",
          409,
        );
      }

      const workspace = await employerShiftRepository.createWorkspaceTx(client, {
        postId,
        appId: updatedApp.id,
        workerWmId,
      });

      const events: ShiftEventRow[] = [
        await employerShiftRepository.insertEventTx(client, {
          postId,
          kind: "direct_invite_accepted",
          actorId: employee.id,
          meta: {
            appId: updatedApp.id,
            workerWmId,
            workspaceId: workspace.id,
            inviteId: inviteResult.invite.id,
          },
        }),
        await employerShiftRepository.insertEventTx(client, {
          postId,
          kind: "candidate_confirmed",
          actorId: employee.id,
          meta: {
            appId: updatedApp.id,
            workerWmId,
            workspaceId: workspace.id,
            via: "direct_invite",
            inviteId: inviteResult.invite.id,
          },
        }),
      ];

      return { workspace, application: updatedApp, events };
    });

    try {
      await emitShiftConfirmedNotification({
        workerWmId,
        applicantUserId: employee.id,
        postId,
        appId: result.application.id,
        workspaceId: result.workspace.id,
        jobName: post.job_name,
      });
    } catch (notifyErr) {
      console.warn(
        "[shift.directAccept] notification failed after commit — accept still success:",
        notifyErr instanceof Error ? notifyErr.message : "unknown",
      );
    }

    return {
      ok: true,
      workspace: result.workspace,
      application: result.application,
      events: result.events,
    };
  } catch (err) {
    const typed = err as { code?: string; message?: string; httpStatus?: number };
    return fail(
      typed.code ?? "ACCEPT_FAILED",
      typed.message ?? "Direct invite accept failed",
      typed.httpStatus ?? 500,
    );
  }
}
