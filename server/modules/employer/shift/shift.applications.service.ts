import { emitShiftInboxNotification } from "../../notifications/shiftNotifications.emit.js";
import type { AuthUser } from "../../auth/types.js";
import type { ShiftApplicationRow } from "../../shift/types.js";
import { authService } from "../../auth/auth.service.js";
import { employerShiftRepository, isShiftUuid } from "./shift.repository.js";
import { employerShiftService } from "./shift.service.js";

export type ShiftApplicationListResult =
  | { ok: true; applications: ShiftApplicationRow[] }
  | { ok: false; code: string; message: string; httpStatus: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function withApplicantSnapshot(
  app: ShiftApplicationRow,
  fullName: string,
): ShiftApplicationRow {
  const details = isRecord(app.details) ? { ...app.details } : {};
  const snap = isRecord(details.profileSnapshot) ? { ...details.profileSnapshot } : {};
  const name = fullName.trim();
  if (typeof snap.fullName !== "string" || !snap.fullName.trim()) {
    if (name) snap.fullName = name;
  }
  if (typeof snap.uniqueId !== "string" || !snap.uniqueId.trim()) {
    snap.uniqueId = app.worker_wm_id;
  }
  return { ...app, details: { ...details, profileSnapshot: snap } };
}

export async function listApplicationsForOwnedPost(
  postId: string,
  employer: AuthUser,
): Promise<ShiftApplicationListResult> {
  const owned = await employerShiftService.getOwnedPost(postId, employer);
  if (!owned.ok) {
    return {
      ok: false,
      code: owned.code,
      message: owned.message,
      httpStatus: owned.httpStatus,
    };
  }
  const applications = await employerShiftRepository.listApplicationsByPostId(postId);
  const enriched = await Promise.all(
    applications.map(async (app) => {
      const user = await authService.getUserById(app.worker_wm_id);
      return withApplicantSnapshot(app, user?.fullName ?? "");
    }),
  );
  return { ok: true, applications: enriched };
}

const PIPELINE_FROM = ["applied", "shortlisted", "waiting"] as const;

const STATUS_INBOX: Record<
  "shortlisted" | "waiting" | "rejected",
  { eventType: "SHIFT_EMPLOYEE_SHORTLISTED" | "SHIFT_EMPLOYEE_WAITLISTED" | "SHIFT_APPLICATION_REJECTED"; title: string; body: string }
> = {
  shortlisted: {
    eventType: "SHIFT_EMPLOYEE_SHORTLISTED",
    title: "You have been shortlisted",
    body: "The employer shortlisted you for a shift. Open My Applications.",
  },
  waiting: {
    eventType: "SHIFT_EMPLOYEE_WAITLISTED",
    title: "You are on the waiting list",
    body: "The employer placed you on the backup list for a shift.",
  },
  rejected: {
    eventType: "SHIFT_APPLICATION_REJECTED",
    title: "Shift application update",
    body: "Your shift application status was updated.",
  },
};

export async function patchOwnedApplicationStatus(
  postId: string,
  appId: string,
  status: "shortlisted" | "waiting" | "rejected",
  employer: AuthUser,
): Promise<
  | { ok: true; application: ShiftApplicationRow }
  | { ok: false; code: string; message: string; httpStatus: number }
> {
  if (!isShiftUuid(postId) || !isShiftUuid(appId)) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "postId and appId must be valid UUIDs",
      httpStatus: 400,
    };
  }

  const owned = await employerShiftService.getOwnedPost(postId, employer);
  if (!owned.ok) {
    return {
      ok: false,
      code: owned.code,
      message: owned.message,
      httpStatus: owned.httpStatus,
    };
  }

  try {
    const application = await employerShiftRepository.withTransaction(async (client) => {
      const locked = await employerShiftRepository.findApplicationByIdTx(client, appId);
      if (!locked || locked.post_id !== postId) {
        throw Object.assign(new Error("Application not found"), {
          code: "NOT_FOUND",
          httpStatus: 404,
        });
      }
      const updated = await employerShiftRepository.updateApplicationStatusIfConfirmableTx(
        client,
        appId,
        status,
        PIPELINE_FROM,
      );
      if (!updated) {
        throw Object.assign(new Error("Cannot change application from its current status"), {
          code: "INVALID_STATE",
          httpStatus: 409,
        });
      }
      return updated;
    });

    const copy = STATUS_INBOX[status];
    const workerId = application.worker_wm_id.trim();
    const details =
      application.details && typeof application.details === "object"
        ? (application.details as Record<string, unknown>)
        : {};
    const applicant =
      typeof details.applicant_user_id === "string" ? details.applicant_user_id.trim() : "";
    const recipientUserId = applicant || workerId.toLowerCase();

    void emitShiftInboxNotification({
      recipientUserId,
      eventType: copy.eventType,
      title: copy.title,
      body: `${copy.body} (${owned.post.job_name})`,
      route: "/employee/shift/applications",
      postId,
      appId,
      actorRole: "employer",
    });

    return { ok: true, application };
  } catch (err) {
    const code = typeof err === "object" && err && "code" in err ? String(err.code) : "ERROR";
    const httpStatus =
      typeof err === "object" && err && "httpStatus" in err
        ? Number((err as { httpStatus: number }).httpStatus)
        : 500;
    return {
      ok: false,
      code,
      message: err instanceof Error ? err.message : "Status update failed",
      httpStatus: Number.isFinite(httpStatus) ? httpStatus : 500,
    };
  }
}
