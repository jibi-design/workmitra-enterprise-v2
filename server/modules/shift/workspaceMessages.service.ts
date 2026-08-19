/** Job Mitra API | Cross-device shift workspace messages via shift_events. */

import type { AuthUser } from "../auth/types.js";
import { employerShiftRepository, isShiftUuid } from "../employer/shift/shift.repository.js";
import { emitUserNotification } from "../notifications/notifications.service.js";
import {
  insertWorkspaceEvent,
  listWorkspaceEvents,
  listWorkspaceEventsForEmployee,
  listWorkspaceEventsForEmployer,
  type WorkspaceEventKind,
} from "./workspaceMessages.repository.js";
import type { ShiftApplicationRow, ShiftEventRow } from "./types.js";

export type WorkspaceMessageView = {
  id: string;
  postId: string;
  kind: "broadcast" | "direct";
  title: string;
  body: string;
  actorRole: "employee" | "employer";
  createdAt: number;
};

type AccessResult =
  | { ok: true; postEmployerId: string; application: ShiftApplicationRow | null }
  | { ok: false; code: string; message: string; httpStatus: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toView(row: ShiftEventRow): WorkspaceMessageView | null {
  const meta = isRecord(row.meta) ? row.meta : {};
  const title = typeof meta.title === "string" ? meta.title.trim() : "";
  if (!title) return null;
  const body = typeof meta.body === "string" ? meta.body : "";
  const actorRole = meta.actorRole === "employee" ? "employee" : "employer";
  const kind = row.kind === "workspace_broadcast" ? "broadcast" : "direct";
  return {
    id: row.id,
    postId: row.post_id,
    kind,
    title,
    body,
    actorRole,
    createdAt: new Date(row.created_at).getTime(),
  };
}

async function findEmployeeApplication(
  postId: string,
  employee: AuthUser,
): Promise<ShiftApplicationRow | null> {
  const byAuth = await employerShiftRepository.findApplicationByPostAndWorker(postId, employee.id);
  if (byAuth) return byAuth;
  const apps = await employerShiftRepository.listApplicationsByPostId(postId);
  return (
    apps.find((app) => {
      const details = isRecord(app.details) ? app.details : {};
      return details.applicant_user_id === employee.id;
    }) ?? null
  );
}

async function authorizeAccess(
  user: AuthUser,
  role: "employee" | "employer",
  postId: string,
): Promise<AccessResult> {
  if (!isShiftUuid(postId)) {
    return { ok: false, code: "VALIDATION_ERROR", message: "Invalid post id", httpStatus: 400 };
  }
  const post = await employerShiftRepository.findPostById(postId);
  if (!post) {
    return { ok: false, code: "NOT_FOUND", message: "Shift post not found", httpStatus: 404 };
  }
  if (role === "employer") {
    if (post.employer_id !== user.id) {
      return { ok: false, code: "FORBIDDEN", message: "Not your shift post", httpStatus: 403 };
    }
    return { ok: true, postEmployerId: post.employer_id, application: null };
  }
  const application = await findEmployeeApplication(postId, user);
  if (!application || application.status === "withdrawn" || application.status === "rejected") {
    return { ok: false, code: "FORBIDDEN", message: "No workspace access", httpStatus: 403 };
  }
  return { ok: true, postEmployerId: post.employer_id, application };
}

export async function listShiftWorkspaceMessages(
  user: AuthUser,
  role: "employee" | "employer",
  postId: string,
): Promise<
  { ok: true; messages: WorkspaceMessageView[] } | { ok: false; code: string; message: string; httpStatus: number }
> {
  const access = await authorizeAccess(user, role, postId);
  if (!access.ok) return access;
  const rows = await listWorkspaceEvents(postId);
  return {
    ok: true,
    messages: rows.map(toView).filter((row): row is WorkspaceMessageView => row !== null),
  };
}

export async function postShiftWorkspaceMessage(
  user: AuthUser,
  role: "employee" | "employer",
  postId: string,
  input: { kind: "broadcast" | "direct"; title: string; body: string },
): Promise<
  | { ok: true; message: WorkspaceMessageView }
  | { ok: false; code: string; message: string; httpStatus: number }
> {
  const access = await authorizeAccess(user, role, postId);
  if (!access.ok) return access;
  if (role === "employee" && input.kind !== "direct") {
    return { ok: false, code: "FORBIDDEN", message: "Workers send replies only", httpStatus: 403 };
  }

  const kind: WorkspaceEventKind =
    input.kind === "broadcast" ? "workspace_broadcast" : "workspace_direct";
  const title = input.title.trim() || (input.kind === "broadcast" ? "Announcement" : "Reply");
  const body = input.body.trim();
  if (!body && input.kind === "direct") {
    return { ok: false, code: "VALIDATION_ERROR", message: "Message body is required", httpStatus: 400 };
  }

  const row = await insertWorkspaceEvent({
    postId,
    kind,
    actorId: user.id,
    meta: { title, body, actorRole: role, kind: input.kind },
  });
  const view = toView(row);
  if (!view) {
    return { ok: false, code: "SERVER_ERROR", message: "Could not save message", httpStatus: 500 };
  }

  try {
    if (role === "employer") {
      const apps = await employerShiftRepository.listApplicationsByPostId(postId);
      for (const app of apps) {
        if (app.status !== "confirmed") continue;
        const details = isRecord(app.details) ? app.details : {};
        const recipient =
          typeof details.applicant_user_id === "string" ? details.applicant_user_id.trim() : "";
        await emitUserNotification({
          recipientUserId: recipient || null,
          recipientMlId: app.worker_wm_id,
          domain: "shift",
          eventType: input.kind === "broadcast" ? "GENERAL_BROADCAST" : "GROUP_UPDATE",
          title: title,
          body: body || title,
          route: "/employee/shift/workspaces",
          meta: { type: "SHIFT_WORKSPACE_MESSAGE", postId, eventId: view.id, actorRole: role, kind: input.kind },
        });
      }
    } else {
      await emitUserNotification({
        recipientUserId: access.postEmployerId,
        domain: "shift",
        eventType: "GROUP_UPDATE",
        title: title,
        body: body || title,
        route: "/employer/shift/workspaces",
        meta: { type: "SHIFT_WORKSPACE_MESSAGE", postId, eventId: view.id, actorRole: role, kind: input.kind },
      });
    }
  } catch {
    /* message already stored */
  }

  return { ok: true, message: view };
}

export async function listAllShiftWorkspaceMessages(
  user: AuthUser,
  role: "employee" | "employer",
): Promise<{ ok: true; messages: WorkspaceMessageView[] }> {
  const rows =
    role === "employer"
      ? await listWorkspaceEventsForEmployer(user.id)
      : await listWorkspaceEventsForEmployee(user.id);
  return {
    ok: true,
    messages: rows.map(toView).filter((row): row is WorkspaceMessageView => row !== null),
  };
}
