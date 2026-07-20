import { getPool } from "../../db/pool.js";
import { PRODUCT_SCOPE_JOBMITRA } from "./constants.js";
import type { AuthUser, UserRole } from "./types.js";

export interface DbUserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  status: string;
  locked_until: Date | null;
  failed_login_count: number;
  failed_login_window_start: Date | null;
}

export interface DbSessionRow {
  id: string;
  user_id: string;
  expires_at: Date;
  idle_expires_at: Date;
  revoked_at: Date | null;
}

export const authRepository = {
  async findUserByEmail(email: string): Promise<DbUserRow | null> {
    const result = await getPool().query<DbUserRow>(
      `SELECT id, email, password_hash, full_name, status, locked_until,
              failed_login_count, failed_login_window_start
       FROM auth_users WHERE email = $1 AND status != 'deleted'`,
      [email],
    );
    return result.rows[0] ?? null;
  },

  async findUserById(userId: string): Promise<DbUserRow | null> {
    const result = await getPool().query<DbUserRow>(
      `SELECT id, email, password_hash, full_name, status, locked_until,
              failed_login_count, failed_login_window_start
       FROM auth_users WHERE id = $1 AND status != 'deleted'`,
      [userId],
    );
    return result.rows[0] ?? null;
  },

  async getPrimaryRole(userId: string, productScope: string): Promise<UserRole | null> {
    const result = await getPool().query<{ role: UserRole }>(
      `SELECT role FROM auth_user_roles
       WHERE user_id = $1 AND product_scope = $2 AND is_primary = true
       LIMIT 1`,
      [userId, productScope],
    );
    return result.rows[0]?.role ?? null;
  },

  async toAuthUser(
    row: DbUserRow,
    productScope: string = PRODUCT_SCOPE_JOBMITRA,
  ): Promise<AuthUser | null> {
    const role = await this.getPrimaryRole(row.id, productScope);
    if (!role) return null;
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role,
    };
  },

  async createSession(params: {
    userId: string;
    sessionTokenHash: string;
    expiresAt: Date;
    idleExpiresAt: Date;
    ipHash: string | null;
    userAgent: string | null;
  }): Promise<string> {
    const result = await getPool().query<{ id: string }>(
      `INSERT INTO auth_sessions
         (user_id, session_token_hash, expires_at, idle_expires_at, ip_hash, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        params.userId,
        params.sessionTokenHash,
        params.expiresAt,
        params.idleExpiresAt,
        params.ipHash,
        params.userAgent,
      ],
    );
    return result.rows[0].id;
  },

  async findSessionByTokenHash(tokenHash: string): Promise<DbSessionRow | null> {
    const result = await getPool().query<DbSessionRow>(
      `SELECT id, user_id, expires_at, idle_expires_at, revoked_at
       FROM auth_sessions WHERE session_token_hash = $1`,
      [tokenHash],
    );
    return result.rows[0] ?? null;
  },

  async renewSessionIdle(sessionId: string, idleExpiresAt: Date): Promise<void> {
    await getPool().query(
      `UPDATE auth_sessions SET last_seen_at = now(), idle_expires_at = $2 WHERE id = $1`,
      [sessionId, idleExpiresAt],
    );
  },

  async revokeSessionByTokenHash(tokenHash: string): Promise<string | null> {
    const result = await getPool().query<{ id: string }>(
      `UPDATE auth_sessions SET revoked_at = now()
       WHERE session_token_hash = $1 AND revoked_at IS NULL
       RETURNING id`,
      [tokenHash],
    );
    return result.rows[0]?.id ?? null;
  },

  async revokeAllSessionsForUser(userId: string): Promise<void> {
    await getPool().query(
      `UPDATE auth_sessions SET revoked_at = now()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );
  },

  async recordLoginAttempt(email: string, ipHash: string, success: boolean): Promise<void> {
    await getPool().query(
      `INSERT INTO auth_login_attempts (email_normalized, ip_hash, success) VALUES ($1, $2, $3)`,
      [email, ipHash, success],
    );
  },

  async countFailedAttemptsInWindow(
    email: string,
    ipHash: string,
    windowSec: number,
  ): Promise<number> {
    const result = await getPool().query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM auth_login_attempts
       WHERE email_normalized = $1 AND ip_hash = $2 AND success = false
         AND attempted_at > now() - ($3::int * interval '1 second')`,
      [email, ipHash, windowSec],
    );
    return Number(result.rows[0]?.count ?? 0);
  },

  async incrementUserFailedLogins(
    userId: string,
    windowSec: number,
    lockThreshold: number,
    lockDurationSec: number,
  ): Promise<void> {
    await getPool().query(
      `UPDATE auth_users SET
         failed_login_count = CASE
           WHEN failed_login_window_start IS NULL
             OR failed_login_window_start < now() - ($2::int * interval '1 second')
           THEN 1
           ELSE failed_login_count + 1
         END,
         failed_login_window_start = CASE
           WHEN failed_login_window_start IS NULL
             OR failed_login_window_start < now() - ($2::int * interval '1 second')
           THEN now()
           ELSE failed_login_window_start
         END,
         status = CASE
           WHEN (
             CASE
               WHEN failed_login_window_start IS NULL
                 OR failed_login_window_start < now() - ($2::int * interval '1 second')
               THEN 1
               ELSE failed_login_count + 1
             END
           ) >= $3 THEN 'locked'
           ELSE status
         END,
         locked_until = CASE
           WHEN (
             CASE
               WHEN failed_login_window_start IS NULL
                 OR failed_login_window_start < now() - ($2::int * interval '1 second')
               THEN 1
               ELSE failed_login_count + 1
             END
           ) >= $3 THEN now() + ($4::int * interval '1 second')
           ELSE locked_until
         END,
         updated_at = now()
       WHERE id = $1`,
      [userId, windowSec, lockThreshold, lockDurationSec],
    );
  },

  async resetUserFailedLogins(userId: string): Promise<void> {
    await getPool().query(
      `UPDATE auth_users SET
         failed_login_count = 0,
         failed_login_window_start = NULL,
         status = CASE WHEN status = 'locked' THEN 'active' ELSE status END,
         locked_until = NULL,
         updated_at = now()
       WHERE id = $1`,
      [userId],
    );
  },

  async unlockExpiredAccounts(): Promise<void> {
    await getPool().query(
      `UPDATE auth_users SET
         status = 'active',
         locked_until = NULL,
         failed_login_count = 0,
         failed_login_window_start = NULL,
         updated_at = now()
       WHERE status = 'locked' AND locked_until IS NOT NULL AND locked_until <= now()`,
    );
  },

  async insertAuditEvent(params: {
    eventType: string;
    userId?: string | null;
    sessionId?: string | null;
    ipHash?: string | null;
    userAgent?: string | null;
    requestId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await getPool().query(
      `INSERT INTO auth_audit_events
         (event_type, user_id, session_id, ip_hash, user_agent, request_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        params.eventType,
        params.userId ?? null,
        params.sessionId ?? null,
        params.ipHash ?? null,
        params.userAgent ?? null,
        params.requestId ?? null,
        JSON.stringify(params.metadata ?? {}),
      ],
    );
  },
};
