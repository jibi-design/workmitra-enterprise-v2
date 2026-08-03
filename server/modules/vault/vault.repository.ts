// server/modules/vault/vault.repository.ts
//
// Work Vault DB layer.
// All multi-step mutations use explicit BEGIN/COMMIT transactions with
// SELECT FOR UPDATE to prevent race conditions (Law 1 — Saga Law).
// Repository functions return typed results — they never throw to callers
// (Law 2 — Tier Law: db_error is CRITICAL, surfaces to service layer).

import { getPool } from "../../db/pool.js";
import {
  applyTransactionGuards,
  isTransientDbError,
  withTransientRetry,
} from "../../db/resilient.js";
import { verifyPassword } from "../auth/password.js";
import type {
  CreateOtpParams,
  VerifyOtpAndCreateSessionParams,
  VaultOtpGenerateResult,
  VaultOtpVerifyResult,
  VaultRevokeResult,
  VaultSessionListResult,
  VaultSessionRow,
  VaultSessionView,
} from "./vault.types.js";

const MAX_OTP_ATTEMPTS = 5;
const VAULT_SESSION_INTERVAL = "30 minutes";

/* ── Mappers ─────────────────────────────────────────────────────────────── */

function mapSessionRow(row: VaultSessionRow): VaultSessionView {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employerId: row.employer_id,
    employerName: row.employer_name,
    employerWmId: row.employer_wm_id,
    visibleFolderIds: row.visible_folder_ids ?? [],
    status: row.status,
    startedAt: new Date(row.started_at).getTime(),
    expiresAt: new Date(row.expires_at).getTime(),
    revokedAt: row.revoked_at ? new Date(row.revoked_at).getTime() : null,
  };
}

/* ── OTP: create ─────────────────────────────────────────────────────────── */

export async function insertOtp(params: CreateOtpParams): Promise<VaultOtpGenerateResult> {
  const pool = getPool();
  try {
    const result = await pool.query<{ id: string; expires_at: Date }>(
      `INSERT INTO vault_otps (employee_id, code_hash, visible_folder_ids, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, expires_at`,
      [params.employeeId, params.codeHash, params.visibleFolderIds, params.expiresAt],
    );
    const row = result.rows[0];
    return {
      ok: true,
      otpId: row.id,
      code: "",
      expiresAt: new Date(row.expires_at).getTime(),
    };
  } catch (error) {
    // TIER: CRITICAL — vault OTP creation failure. Must surface to caller.
    return { ok: false, reason: "db_error", error };
  }
}

/* ── OTP: invalidate prior active OTPs for employee ─────────────────────── */

export async function invalidatePriorOtps(employeeId: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE vault_otps
     SET used_at = NOW()
     WHERE employee_id = $1 AND used_at IS NULL`,
    [employeeId],
  );
}

/* ── OTP verify + session create (atomic transaction) ───────────────────── */

export async function verifyOtpAndCreateSession(
  params: VerifyOtpAndCreateSessionParams,
): Promise<VaultOtpVerifyResult> {
  return withTransientRetry(async () => {
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await applyTransactionGuards(client);

      const otpResult = await client.query<{
        id: string;
        code_hash: string;
        attempt_count: number;
        visible_folder_ids: string[];
      }>(
        `SELECT id, code_hash, attempt_count, visible_folder_ids
         FROM vault_otps
         WHERE employee_id = $1
           AND used_at IS NULL
           AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1
         FOR UPDATE`,
        [params.employeeId],
      );

      if (otpResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "no_active_otp" };
      }

      const otp = otpResult.rows[0];
      const newAttemptCount = otp.attempt_count + 1;

      await client.query(`UPDATE vault_otps SET attempt_count = $1 WHERE id = $2`, [
        newAttemptCount,
        otp.id,
      ]);

      const isValid = await verifyPassword(params.code, otp.code_hash);

      if (!isValid) {
        if (newAttemptCount >= MAX_OTP_ATTEMPTS) {
          await client.query(`UPDATE vault_otps SET used_at = NOW() WHERE id = $1`, [otp.id]);
          await client.query("COMMIT");
          return { ok: false, reason: "otp_locked" };
        }
        await client.query("COMMIT");
        return { ok: false, reason: "invalid_code" };
      }

      await client.query(`UPDATE vault_otps SET used_at = NOW() WHERE id = $1`, [otp.id]);

      const sessionResult = await client.query<VaultSessionRow>(
        `INSERT INTO vault_sessions
           (employee_id, employer_id, employer_name, employer_wm_id, visible_folder_ids, expires_at)
         VALUES ($1, $2, $3, $4, $5, NOW() + $6::interval)
         RETURNING *`,
        [
          params.employeeId,
          params.employerId,
          params.employerName,
          params.employerWmId,
          otp.visible_folder_ids,
          VAULT_SESSION_INTERVAL,
        ],
      );

      const session = sessionResult.rows[0];

      await client.query(
        `INSERT INTO vault_access_log (session_id, employee_id, employer_id, event_type)
         VALUES ($1, $2, $3, 'session_created')`,
        [session.id, params.employeeId, params.employerId],
      );

      await client.query("COMMIT");
      return { ok: true, session: mapSessionRow(session) };
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        /* TIER: ADVISORY — rollback failure, connection may be dead */
      }
      if (isTransientDbError(error)) throw error;
      return { ok: false, reason: "db_error", error };
    } finally {
      client.release();
    }
  }, "vault-verify-otp");
}

/* ── Session: fetch single by ID ─────────────────────────────────────────── */

export async function getSessionById(sessionId: string): Promise<VaultSessionView | null> {
  const pool = getPool();
  const result = await pool.query<VaultSessionRow>(`SELECT * FROM vault_sessions WHERE id = $1`, [
    sessionId,
  ]);
  if (result.rows.length === 0) return null;
  return mapSessionRow(result.rows[0]);
}

/* ── Session: list for employee (access log view) ─────────────────────────── */

export async function listSessionsByEmployee(employeeId: string): Promise<VaultSessionListResult> {
  const pool = getPool();
  try {
    const result = await pool.query<VaultSessionRow>(
      `SELECT * FROM vault_sessions
       WHERE employee_id = $1
       ORDER BY started_at DESC
       LIMIT 100`,
      [employeeId],
    );
    return { ok: true, sessions: result.rows.map(mapSessionRow) };
  } catch (error) {
    // TIER: CRITICAL — employee cannot view their own access log.
    return { ok: false, reason: "db_error", error };
  }
}

/* ── Session: revoke (employee-initiated) ───────────────────────────────── */

export async function revokeSession(
  sessionId: string,
  requestingEmployeeId: string,
): Promise<VaultRevokeResult> {
  return withTransientRetry(async () => {
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await applyTransactionGuards(client);

      const existing = await client.query<{ id: string; employee_id: string; status: string }>(
        `SELECT id, employee_id, status FROM vault_sessions WHERE id = $1 FOR UPDATE`,
        [sessionId],
      );

      if (existing.rows.length === 0) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "not_found" };
      }

      const row = existing.rows[0];

      if (row.employee_id !== requestingEmployeeId) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "forbidden" };
      }

      if (row.status !== "active") {
        await client.query("ROLLBACK");
        return { ok: false, reason: "already_closed" };
      }

      await client.query(
        `UPDATE vault_sessions SET status = 'revoked', revoked_at = NOW() WHERE id = $1`,
        [sessionId],
      );

      await client.query(
        `INSERT INTO vault_access_log (session_id, employee_id, employer_id, event_type)
         SELECT $1, employee_id, employer_id, 'session_revoked'
         FROM vault_sessions WHERE id = $1`,
        [sessionId],
      );

      await client.query("COMMIT");
      return { ok: true };
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        /* TIER: ADVISORY */
      }
      if (isTransientDbError(error)) throw error;
      return { ok: false, reason: "db_error", error };
    } finally {
      client.release();
    }
  }, "vault-revoke-session");
}
