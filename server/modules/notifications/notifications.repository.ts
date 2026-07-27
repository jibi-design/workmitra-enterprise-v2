// server/modules/notifications/notifications.repository.ts

import { getPool } from "../../db/pool.js";
import type {
  EmitNotificationParams,
  NotificationDomain,
  UserNotificationRow,
  UserNotificationView,
} from "./notifications.types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapRow(row: UserNotificationRow): UserNotificationView {
  return {
    id: row.id,
    domain: row.domain,
    eventType: row.event_type,
    title: row.title,
    body: row.body ?? "",
    route: row.route,
    isRead: row.is_read,
    createdAt: new Date(row.created_at).getTime(),
    readAt: row.read_at ? new Date(row.read_at).getTime() : null,
    meta: isRecord(row.meta) ? row.meta : {},
  };
}

const SELECT_COLS = `id, recipient_user_id, recipient_ml_id, domain, event_type,
  title, body, route, is_read, meta, created_at, read_at`;

export async function insertNotification(
  params: EmitNotificationParams,
): Promise<UserNotificationView | null> {
  const pool = getPool();
  const recipientUserId = params.recipientUserId?.trim() || null;
  const recipientMlId = (params.recipientMlId ?? "").trim().toUpperCase();

  if (!recipientUserId && !recipientMlId) return null;

  try {
    const result = await pool.query<UserNotificationRow>(
      `INSERT INTO user_notifications
         (recipient_user_id, recipient_ml_id, domain, event_type, title, body, route, meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING ${SELECT_COLS}`,
      [
        recipientUserId,
        recipientMlId,
        params.domain,
        params.eventType.trim(),
        params.title.trim(),
        (params.body ?? "").trim(),
        params.route?.trim() || null,
        JSON.stringify(params.meta ?? {}),
      ],
    );
    return mapRow(result.rows[0]);
  } catch {
    return null;
  }
}

export async function listNotificationsForUser(
  userId: string,
  mlIdHint?: string,
): Promise<UserNotificationView[]> {
  const pool = getPool();
  const ml = (mlIdHint ?? "").trim().toUpperCase();

  try {
    const result = await pool.query<UserNotificationRow>(
      `SELECT ${SELECT_COLS}
       FROM user_notifications
       WHERE recipient_user_id = $1
          OR ($2 <> '' AND upper(recipient_ml_id) = $2)
       ORDER BY created_at DESC
       LIMIT 200`,
      [userId, ml],
    );
    return result.rows.map(mapRow);
  } catch {
    return [];
  }
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
): Promise<UserNotificationView | null> {
  const pool = getPool();
  try {
    const result = await pool.query<UserNotificationRow>(
      `UPDATE user_notifications
       SET is_read = true, read_at = COALESCE(read_at, NOW())
       WHERE id = $1 AND recipient_user_id = $2
       RETURNING ${SELECT_COLS}`,
      [notificationId, userId],
    );
    if (result.rows.length === 0) return null;
    return mapRow(result.rows[0]);
  } catch {
    return null;
  }
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const pool = getPool();
  try {
    const result = await pool.query(
      `UPDATE user_notifications
       SET is_read = true, read_at = COALESCE(read_at, NOW())
       WHERE recipient_user_id = $1 AND is_read = false`,
      [userId],
    );
    return result.rowCount ?? 0;
  } catch {
    return 0;
  }
}

export function isNotificationDomain(value: string): value is NotificationDomain {
  return (
    value === "shift" ||
    value === "career" ||
    value === "workforce" ||
    value === "employment" ||
    value === "system"
  );
}
