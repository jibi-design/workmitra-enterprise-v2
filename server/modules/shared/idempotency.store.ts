/**
 * Wave-5: Idempotency-Key store for mutating APIs (confirm, etc.)
 * Memory always; DB when available.
 */

import { getPool } from "../../db/pool.js";
import { isDbAuthEnabled } from "../auth/env.js";

type IdemRecord = {
  httpStatus: number;
  body: unknown;
  createdAt: number;
};

const memory = new Map<string, IdemRecord>();
const TTL_MS = 24 * 60 * 60 * 1000;

function memKey(actorId: string, idemKey: string): string {
  return `${actorId.trim()}::${idemKey.trim()}`;
}

function isFresh(rec: IdemRecord, now = Date.now()): boolean {
  return now - rec.createdAt < TTL_MS;
}

export const idempotencyStore = {
  async get(actorId: string, idemKey: string): Promise<IdemRecord | null> {
    const key = memKey(actorId, idemKey);
    const mem = memory.get(key);
    if (mem && isFresh(mem)) return mem;
    if (mem) memory.delete(key);

    if (!isDbAuthEnabled()) return null;
    try {
      const result = await getPool().query<{
        http_status: number;
        response_json: unknown;
        created_at: Date;
      }>(
        `SELECT http_status, response_json, created_at
         FROM api_idempotency_keys
         WHERE actor_id = $1 AND idem_key = $2`,
        [actorId.trim(), idemKey.trim()],
      );
      const row = result.rows[0];
      if (!row) return null;
      const rec: IdemRecord = {
        httpStatus: row.http_status,
        body: row.response_json,
        createdAt: new Date(row.created_at).getTime(),
      };
      if (!isFresh(rec)) return null;
      memory.set(key, rec);
      return rec;
    } catch {
      return null;
    }
  },

  async put(actorId: string, idemKey: string, httpStatus: number, body: unknown): Promise<void> {
    const key = memKey(actorId, idemKey);
    const rec: IdemRecord = { httpStatus, body, createdAt: Date.now() };
    memory.set(key, rec);

    if (!isDbAuthEnabled()) return;
    try {
      await getPool().query(
        `INSERT INTO api_idempotency_keys (actor_id, idem_key, http_status, response_json)
         VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT (actor_id, idem_key) DO NOTHING`,
        [actorId.trim(), idemKey.trim(), httpStatus, JSON.stringify(body)],
      );
    } catch (err) {
      console.warn("[idempotency] DB put skipped:", err instanceof Error ? err.message : "unknown");
    }
  },
};

export function readIdempotencyKey(headers: IncomingHttpHeadersLike): string | null {
  const raw = headers["idempotency-key"];
  if (typeof raw === "string" && raw.trim()) return raw.trim().slice(0, 256);
  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0].trim()) {
    return raw[0].trim().slice(0, 256);
  }
  return null;
}

type IncomingHttpHeadersLike = Record<string, string | string[] | undefined>;
