/**
 * Event Day Postgres access. Isolated from Shift / Career / Planner.
 */

import { getPool } from "../../../db/pool.js";
import { pgBool } from "./eventDay.pgBool.js";

export type EventDayPassRow = {
  readonly passId: string;
  readonly issuerId: string;
  readonly guestName: string;
  readonly candidateRef: string | null;
  readonly eventName: string | null;
  readonly venueName: string;
  readonly venueAddress: string | null;
  readonly purpose: string;
  readonly validFrom: string;
  readonly validUntil: string;
  readonly status: string;
  readonly entered: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type EventDayCheckInRow = {
  readonly eventId: string;
  readonly passId: string;
  readonly issuerId: string;
  readonly staffName: string;
  readonly action: string;
  readonly verifiedAt: string;
  readonly deviceId: string | null;
};

export type EventDayGatePinMeta = {
  readonly pinSet: boolean;
  readonly updatedAt: string | null;
};

function iso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value ?? "");
}

function mapPass(row: Record<string, unknown>): EventDayPassRow {
  return {
    passId: String(row.pass_id),
    issuerId: String(row.issuer_id),
    guestName: String(row.guest_name),
    candidateRef: row.candidate_ref == null ? null : String(row.candidate_ref),
    eventName: row.event_name == null ? null : String(row.event_name),
    venueName: String(row.venue_name),
    venueAddress: row.venue_address == null ? null : String(row.venue_address),
    purpose: String(row.purpose),
    validFrom: iso(row.valid_from),
    validUntil: iso(row.valid_until),
    status: String(row.status),
    entered: pgBool(row.entered),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function mapCheckIn(row: Record<string, unknown>): EventDayCheckInRow {
  return {
    eventId: String(row.event_id),
    passId: String(row.pass_id),
    issuerId: String(row.issuer_id),
    staffName: String(row.staff_name),
    action: String(row.action),
    verifiedAt: iso(row.verified_at),
    deviceId: row.device_id == null ? null : String(row.device_id),
  };
}

const ENTERED_SQL = `EXISTS (
    SELECT 1 FROM event_day_check_ins c
    WHERE c.pass_id = event_day_passes.pass_id AND c.action = 'check_in'
  ) AS entered`;

const PASS_COLS = `pass_id, issuer_id, guest_name, candidate_ref, event_name, venue_name,
  venue_address, purpose, valid_from, valid_until, status, created_at, updated_at, ${ENTERED_SQL}`;

export const eventDayRepository = {
  async listPasses(issuerId: string): Promise<EventDayPassRow[]> {
    const result = await getPool().query(
      `SELECT ${PASS_COLS} FROM event_day_passes
       WHERE issuer_id = $1
       ORDER BY updated_at DESC`,
      [issuerId],
    );
    return result.rows.map((row) => mapPass(row as Record<string, unknown>));
  },

  async getPass(issuerId: string, passId: string): Promise<EventDayPassRow | null> {
    const result = await getPool().query(
      `SELECT ${PASS_COLS} FROM event_day_passes
       WHERE issuer_id = $1 AND pass_id = $2`,
      [issuerId, passId],
    );
    const row = result.rows[0] as Record<string, unknown> | undefined;
    return row ? mapPass(row) : null;
  },

  async insertPass(params: {
    issuerId: string;
    tokenHash: string;
    guestName: string;
    candidateRef?: string;
    eventName?: string;
    venueName: string;
    venueAddress?: string;
    purpose: string;
    validFrom: string;
    validUntil: string;
  }): Promise<EventDayPassRow> {
    const result = await getPool().query(
      `INSERT INTO event_day_passes (
         issuer_id, token_hash, guest_name, candidate_ref, event_name,
         venue_name, venue_address, purpose, valid_from, valid_until, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz, $10::timestamptz, 'active')
       RETURNING ${PASS_COLS}`,
      [
        params.issuerId,
        params.tokenHash,
        params.guestName,
        params.candidateRef ?? null,
        params.eventName ?? null,
        params.venueName,
        params.venueAddress ?? null,
        params.purpose,
        params.validFrom,
        params.validUntil,
      ],
    );
    return mapPass(result.rows[0] as Record<string, unknown>);
  },

  async revokePass(issuerId: string, passId: string): Promise<EventDayPassRow | null> {
    const result = await getPool().query(
      `UPDATE event_day_passes
       SET status = 'revoked', updated_at = now()
       WHERE issuer_id = $1 AND pass_id = $2
       RETURNING ${PASS_COLS}`,
      [issuerId, passId],
    );
    const row = result.rows[0] as Record<string, unknown> | undefined;
    return row ? mapPass(row) : null;
  },

  async deletePasses(issuerId: string, passIds: readonly string[]): Promise<number> {
    if (passIds.length === 0) return 0;
    const result = await getPool().query(
      `DELETE FROM event_day_passes
       WHERE issuer_id = $1 AND pass_id = ANY($2::uuid[])`,
      [issuerId, passIds],
    );
    return result.rowCount ?? 0;
  },

  async getGatePinMeta(issuerId: string): Promise<EventDayGatePinMeta> {
    const result = await getPool().query(
      `SELECT updated_at FROM event_day_gate_pins WHERE issuer_id = $1`,
      [issuerId],
    );
    const row = result.rows[0] as { updated_at?: unknown } | undefined;
    if (!row) return { pinSet: false, updatedAt: null };
    return { pinSet: true, updatedAt: iso(row.updated_at) };
  },

  async getPassByTokenHash(tokenHash: string): Promise<EventDayPassRow | null> {
    const result = await getPool().query(
      `SELECT ${PASS_COLS} FROM event_day_passes WHERE token_hash = $1`,
      [tokenHash],
    );
    const row = result.rows[0] as Record<string, unknown> | undefined;
    return row ? mapPass(row) : null;
  },

  async getGatePinHash(issuerId: string): Promise<string | null> {
    const result = await getPool().query(
      `SELECT pin_hash FROM event_day_gate_pins WHERE issuer_id = $1`,
      [issuerId],
    );
    const hash = result.rows[0]?.pin_hash;
    return typeof hash === "string" ? hash : null;
  },

  async upsertGatePinHash(issuerId: string, pinHash: string): Promise<EventDayGatePinMeta> {
    const result = await getPool().query(
      `INSERT INTO event_day_gate_pins (issuer_id, pin_hash, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (issuer_id) DO UPDATE SET pin_hash = EXCLUDED.pin_hash, updated_at = now()
       RETURNING updated_at`,
      [issuerId, pinHash],
    );
    return { pinSet: true, updatedAt: iso(result.rows[0]?.updated_at) };
  },

  async getEventGatePinMeta(issuerId: string, folderId: string): Promise<EventDayGatePinMeta> {
    const result = await getPool().query(
      `SELECT updated_at FROM event_day_event_gate_pins
       WHERE issuer_id = $1 AND folder_id = $2`,
      [issuerId, folderId],
    );
    const row = result.rows[0] as { updated_at?: unknown } | undefined;
    if (!row) return { pinSet: false, updatedAt: null };
    return { pinSet: true, updatedAt: iso(row.updated_at) };
  },

  async getEventGatePinHash(issuerId: string, folderId: string): Promise<string | null> {
    const result = await getPool().query(
      `SELECT pin_hash FROM event_day_event_gate_pins
       WHERE issuer_id = $1 AND folder_id = $2`,
      [issuerId, folderId],
    );
    const hash = result.rows[0]?.pin_hash;
    return typeof hash === "string" ? hash : null;
  },

  async upsertEventGatePinHash(
    issuerId: string,
    folderId: string,
    pinHash: string,
  ): Promise<EventDayGatePinMeta> {
    const result = await getPool().query(
      `INSERT INTO event_day_event_gate_pins (issuer_id, folder_id, pin_hash, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (issuer_id, folder_id)
       DO UPDATE SET pin_hash = EXCLUDED.pin_hash, updated_at = now()
       RETURNING updated_at`,
      [issuerId, folderId, pinHash],
    );
    return { pinSet: true, updatedAt: iso(result.rows[0]?.updated_at) };
  },

  async listCheckIns(issuerId: string): Promise<EventDayCheckInRow[]> {
    const result = await getPool().query(
      `SELECT event_id, pass_id, issuer_id, staff_name, action, verified_at, device_id
       FROM event_day_check_ins
       WHERE issuer_id = $1
       ORDER BY verified_at DESC`,
      [issuerId],
    );
    return result.rows.map((row) => mapCheckIn(row as Record<string, unknown>));
  },

  async insertScanVerify(params: {
    issuerId: string;
    passId: string;
    staffName: string;
    deviceId?: string;
  }): Promise<EventDayCheckInRow> {
    const result = await getPool().query(
      `INSERT INTO event_day_check_ins (pass_id, issuer_id, staff_name, action, device_id)
       VALUES ($1, $2, $3, 'scan_verify', $4)
       RETURNING event_id, pass_id, issuer_id, staff_name, action, verified_at, device_id`,
      [params.passId, params.issuerId, params.staffName, params.deviceId ?? null],
    );
    return mapCheckIn(result.rows[0] as Record<string, unknown>);
  },

  async insertPinCheckIn(params: {
    issuerId: string;
    passId: string;
    staffName: string;
  }): Promise<EventDayCheckInRow> {
    const result = await getPool().query(
      `INSERT INTO event_day_check_ins (pass_id, issuer_id, staff_name, action, device_id)
       VALUES ($1, $2, $3, 'check_in', NULL)
       RETURNING event_id, pass_id, issuer_id, staff_name, action, verified_at, device_id`,
      [params.passId, params.issuerId, params.staffName],
    );
    return mapCheckIn(result.rows[0] as Record<string, unknown>);
  },

  async markPassSpent(passId: string): Promise<void> {
    await getPool().query(
      `UPDATE event_day_passes
       SET spent_at = now(), updated_at = now()
       WHERE pass_id = $1 AND spent_at IS NULL`,
      [passId],
    );
  },
};
