/**
 * Wave-5.1: server-authoritative direct-invite registry.
 * Invite consume is atomic (DB CAS inside txn; ephemeral store CAS for lab).
 * Accept always requires invite_token (R2).
 * Ephemeral layer is pluggable (memory | Upstash) for multi-node readiness.
 */

import { randomBytes, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import {
  getDirectInviteEphemeralStore,
  type EphemeralInviteRecord,
} from "../../../adapters/directInviteEphemeralStore.js";
import { getPool } from "../../../db/pool.js";
import { isDbAuthEnabled } from "../../auth/env.js";

export type ShiftDirectInviteStatus = "pending" | "accepted" | "declined" | "expired" | "consumed";

export type ShiftDirectInviteRecord = {
  id: string;
  postId: string;
  employerId: string;
  workerWmId: string;
  token: string;
  status: ShiftDirectInviteStatus;
  expiresAt: number;
  createdAt: number;
  consumedAt?: number;
};

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function makeToken(): string {
  return `sdi_${randomBytes(24).toString("hex")}`;
}

function normalizeWm(id: string): string {
  return id.trim().toUpperCase();
}

function mapDbRow(row: {
  id: string;
  post_id: string;
  employer_id: string;
  worker_wm_id: string;
  token: string;
  status: string;
  expires_at: Date;
  created_at: Date;
  consumed_at: Date | null;
}): ShiftDirectInviteRecord {
  return {
    id: row.id,
    postId: row.post_id,
    employerId: row.employer_id,
    workerWmId: row.worker_wm_id,
    token: row.token,
    status: row.status as ShiftDirectInviteStatus,
    expiresAt: new Date(row.expires_at).getTime(),
    createdAt: new Date(row.created_at).getTime(),
    consumedAt: row.consumed_at ? new Date(row.consumed_at).getTime() : undefined,
  };
}

function toEphemeral(invite: ShiftDirectInviteRecord): EphemeralInviteRecord {
  return { ...invite };
}

function fromEphemeral(rec: EphemeralInviteRecord): ShiftDirectInviteRecord {
  return {
    id: rec.id,
    postId: rec.postId,
    employerId: rec.employerId,
    workerWmId: rec.workerWmId,
    token: rec.token,
    status: rec.status as ShiftDirectInviteStatus,
    expiresAt: rec.expiresAt,
    createdAt: rec.createdAt,
    consumedAt: rec.consumedAt,
  };
}

async function tryDbCreate(invite: ShiftDirectInviteRecord): Promise<void> {
  if (!isDbAuthEnabled()) return;
  try {
    await getPool().query(
      `INSERT INTO shift_direct_invites
         (id, post_id, employer_id, worker_wm_id, token, status, expires_at, created_at)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, to_timestamp($7 / 1000.0), to_timestamp($8 / 1000.0))
       ON CONFLICT DO NOTHING`,
      [
        invite.id,
        invite.postId,
        invite.employerId,
        invite.workerWmId,
        invite.token,
        invite.status,
        invite.expiresAt,
        invite.createdAt,
      ],
    );
  } catch (err) {
    console.warn(
      "[shift.directInvite] DB insert skipped:",
      err instanceof Error ? err.message : "unknown",
    );
  }
}

export const shiftDirectInviteStore = {
  async create(params: {
    postId: string;
    employerId: string;
    workerWmId: string;
  }): Promise<ShiftDirectInviteRecord> {
    const now = Date.now();
    const workerWmId = normalizeWm(params.workerWmId);
    const ephemeral = getDirectInviteEphemeralStore();
    await ephemeral.expirePendingForWorker(params.postId, workerWmId);

    const invite: ShiftDirectInviteRecord = {
      id: randomUUID(),
      postId: params.postId,
      employerId: params.employerId,
      workerWmId,
      token: makeToken(),
      status: "pending",
      expiresAt: now + INVITE_TTL_MS,
      createdAt: now,
    };
    await ephemeral.put(toEphemeral(invite));
    await tryDbCreate(invite);
    return invite;
  },

  validateAcceptProof(params: {
    postId: string;
    workerWmId: string;
    inviteId?: string;
    token?: string;
  }):
    | { ok: true; token: string; inviteId?: string }
    | { ok: false; code: string; message: string; httpStatus: number } {
    const token = params.token?.trim();
    if (!token) {
      return {
        ok: false,
        code: "INVITE_TOKEN_REQUIRED",
        message: "invite_token is required to accept a direct invite",
        httpStatus: 400,
      };
    }
    const inviteId = params.inviteId?.trim() || undefined;
    return { ok: true, token, inviteId };
  },

  async consumePendingTx(
    client: PoolClient | null,
    params: {
      postId: string;
      workerWmId: string;
      token: string;
      inviteId?: string;
    },
  ): Promise<
    | { ok: true; invite: ShiftDirectInviteRecord }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    const workerWmId = normalizeWm(params.workerWmId);
    const token = params.token.trim();
    const inviteId = params.inviteId?.trim() || null;
    const ephemeral = getDirectInviteEphemeralStore();

    if (isDbAuthEnabled() && client) {
      try {
        const result = await client.query<{
          id: string;
          post_id: string;
          employer_id: string;
          worker_wm_id: string;
          token: string;
          status: string;
          expires_at: Date;
          created_at: Date;
          consumed_at: Date | null;
        }>(
          `UPDATE shift_direct_invites
           SET status = 'consumed', consumed_at = NOW()
           WHERE status = 'pending'
             AND expires_at > NOW()
             AND post_id = $1::uuid
             AND upper(worker_wm_id) = upper($2)
             AND token = $3
             AND ($4::uuid IS NULL OR id = $4::uuid)
           RETURNING id, post_id, employer_id, worker_wm_id, token, status,
                     expires_at, created_at, consumed_at`,
          [params.postId, workerWmId, token, inviteId],
        );
        const row = result.rows[0];
        if (row) {
          const invite = mapDbRow(row);
          await ephemeral.put(toEphemeral(invite));
          return { ok: true, invite };
        }
      } catch (err) {
        console.warn(
          "[shift.directInvite] TX consume failed:",
          err instanceof Error ? err.message : "unknown",
        );
        return {
          ok: false,
          code: "INVITE_CONSUME_FAILED",
          message: "Unable to consume invite under transaction",
          httpStatus: 503,
        };
      }
    }

    const consumed = await ephemeral.casConsume({
      postId: params.postId,
      workerWmId,
      token,
      inviteId,
    });
    if (!consumed) {
      return {
        ok: false,
        code: "INVITE_NOT_PENDING",
        message: "No valid pending invite for this token (expired, used, or not found)",
        httpStatus: 409,
      };
    }
    return { ok: true, invite: fromEphemeral(consumed) };
  },
};
