/**
 * Job Mitra | Phase 3 Calling — call_sessions CRUD
 * Path: server/modules/calling/callSession.service.ts
 *
 * Uses DATABASE_URL / public.call_sessions when available.
 * Falls back to in-memory store so API scaffolding works before migration apply.
 */

import { randomUUID } from "node:crypto";
import { getPool } from "../../db/pool.js";
import { isCallingDatabaseConfigured } from "./calling.env.js";
import type { CallSession, CallSessionStatus, CreateCallSessionInput } from "./calling.types.js";

type CallSessionRow = {
  id: string;
  workspace_id: string;
  channel_id: string;
  initiator_ml: string;
  receiver_ml: string;
  status: CallSessionStatus;
  started_at: Date | string;
  answered_at: Date | string | null;
  ended_at: Date | string | null;
};

const memoryStore = new Map<string, CallSession>();

function toIso(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function mapRow(row: CallSessionRow): CallSession {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    channelId: row.channel_id,
    initiatorMl: row.initiator_ml,
    receiverMl: row.receiver_ml,
    status: row.status,
    startedAt: toIso(row.started_at) ?? new Date().toISOString(),
    answeredAt: toIso(row.answered_at),
    endedAt: toIso(row.ended_at),
  };
}

function normalizeMl(value: string): string {
  return value.trim().toUpperCase();
}

function assertCreateInput(input: CreateCallSessionInput): CreateCallSessionInput {
  const workspaceId = input.workspaceId.trim();
  const channelId = input.channelId.trim();
  const initiatorMl = normalizeMl(input.initiatorMl);
  const receiverMl = normalizeMl(input.receiverMl);
  if (!workspaceId || !channelId || !initiatorMl || !receiverMl) {
    throw new Error("CALL_SESSION_INVALID_INPUT");
  }
  return { workspaceId, channelId, initiatorMl, receiverMl };
}

async function createInDb(input: CreateCallSessionInput): Promise<CallSession> {
  const result = await getPool().query<CallSessionRow>(
    `INSERT INTO public.call_sessions
       (workspace_id, channel_id, initiator_ml, receiver_ml, status)
     VALUES ($1, $2, $3, $4, 'ringing')
     RETURNING id, workspace_id, channel_id, initiator_ml, receiver_ml,
               status, started_at, answered_at, ended_at`,
    [input.workspaceId, input.channelId, input.initiatorMl, input.receiverMl],
  );
  return mapRow(result.rows[0]);
}

function createInMemory(input: CreateCallSessionInput): CallSession {
  const session: CallSession = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    channelId: input.channelId,
    initiatorMl: input.initiatorMl,
    receiverMl: input.receiverMl,
    status: "ringing",
    startedAt: new Date().toISOString(),
    answeredAt: null,
    endedAt: null,
  };
  memoryStore.set(session.id, session);
  return session;
}

export async function createCallSession(input: CreateCallSessionInput): Promise<CallSession> {
  const normalized = assertCreateInput(input);
  if (isCallingDatabaseConfigured()) {
    try {
      return await createInDb(normalized);
    } catch (err) {
      console.warn(
        "[calling] call_sessions insert failed — using memory store:",
        err instanceof Error ? err.message : "unknown",
      );
    }
  }
  return createInMemory(normalized);
}

export async function getCallSession(id: string): Promise<CallSession | null> {
  const sessionId = id.trim();
  if (!sessionId) return null;

  if (isCallingDatabaseConfigured()) {
    try {
      const result = await getPool().query<CallSessionRow>(
        `SELECT id, workspace_id, channel_id, initiator_ml, receiver_ml,
                status, started_at, answered_at, ended_at
           FROM public.call_sessions
          WHERE id = $1`,
        [sessionId],
      );
      if (result.rows[0]) return mapRow(result.rows[0]);
    } catch (err) {
      console.warn(
        "[calling] call_sessions select failed:",
        err instanceof Error ? err.message : "unknown",
      );
    }
  }
  return memoryStore.get(sessionId) ?? null;
}

export async function updateCallSessionStatus(
  id: string,
  status: CallSessionStatus,
): Promise<CallSession | null> {
  const sessionId = id.trim();
  if (!sessionId) return null;

  const nowIso = new Date().toISOString();
  const answeredAt = status === "answered" ? nowIso : undefined;
  const endedAt =
    status === "ended" || status === "declined" || status === "failed" || status === "fallback"
      ? nowIso
      : undefined;

  if (isCallingDatabaseConfigured()) {
    try {
      const result = await getPool().query<CallSessionRow>(
        `UPDATE public.call_sessions
            SET status = $2::text,
                answered_at = CASE
                  WHEN $2::text = 'answered' THEN COALESCE(answered_at, now())
                  ELSE answered_at
                END,
                ended_at = CASE
                  WHEN $2::text IN ('ended', 'declined', 'failed', 'fallback')
                    THEN COALESCE(ended_at, now())
                  ELSE ended_at
                END
          WHERE id = $1
          RETURNING id, workspace_id, channel_id, initiator_ml, receiver_ml,
                    status, started_at, answered_at, ended_at`,
        [sessionId, status],
      );
      if (result.rows[0]) return mapRow(result.rows[0]);
    } catch (err) {
      console.warn(
        "[calling] call_sessions update failed:",
        err instanceof Error ? err.message : "unknown",
      );
    }
  }

  const existing = memoryStore.get(sessionId);
  if (!existing) return null;
  const next: CallSession = {
    ...existing,
    status,
    answeredAt: answeredAt ?? existing.answeredAt,
    endedAt: endedAt ?? existing.endedAt,
  };
  memoryStore.set(sessionId, next);
  return next;
}

export async function listRingingOlderThan(olderThanMs: number): Promise<CallSession[]> {
  const cutoff = new Date(Date.now() - olderThanMs);

  if (isCallingDatabaseConfigured()) {
    try {
      const result = await getPool().query<CallSessionRow>(
        `SELECT id, workspace_id, channel_id, initiator_ml, receiver_ml,
                status, started_at, answered_at, ended_at
           FROM public.call_sessions
          WHERE status = 'ringing'
            AND started_at < $1
          ORDER BY started_at ASC
          LIMIT 100`,
        [cutoff.toISOString()],
      );
      return result.rows.map(mapRow);
    } catch (err) {
      console.warn(
        "[calling] listRingingOlderThan failed:",
        err instanceof Error ? err.message : "unknown",
      );
    }
  }

  return [...memoryStore.values()].filter(
    (s) => s.status === "ringing" && new Date(s.startedAt).getTime() < cutoff.getTime(),
  );
}

/** Test helper — clear memory store only. */
export function __resetCallSessionMemoryForTests(): void {
  memoryStore.clear();
}
