/**
 * Immutable Super-Admin audit ledger — append-only writes.
 * Never UPDATE/DELETE rows from application code.
 */

import { createHash, randomUUID } from "node:crypto";
import { getPool } from "../../db/pool.js";
import { isDbAuthEnabled } from "../auth/env.js";

export type AdminAuditTone = "green" | "yellow" | "red";

export type AdminAuditEntry = {
  id: string;
  atIso: string;
  who: string;
  what: string;
  tone: AdminAuditTone;
  action: string;
  clientIp: string | null;
  meta: Record<string, unknown>;
  entryHash: string | null;
  prevHash: string | null;
};

type MemoryRow = AdminAuditEntry;

const memoryLedger: MemoryRow[] = [];
const MAX_MEMORY = 500;

function hashChain(prevHash: string | null, payload: string): string {
  return createHash("sha256")
    .update(`${prevHash || "genesis"}|${payload}`)
    .digest("hex");
}

async function latestDbHash(): Promise<string | null> {
  try {
    const { rows } = await getPool().query<{ entry_hash: string | null }>(
      `SELECT entry_hash FROM platform_ops.admin_audit
       ORDER BY at_iso DESC NULLS LAST, id DESC LIMIT 1`,
    );
    return rows[0]?.entry_hash ? String(rows[0].entry_hash) : null;
  } catch {
    return memoryLedger[0]?.entryHash ?? null;
  }
}

/** Append-only Super-Admin action record. */
export async function appendAdminAudit(input: {
  who: string;
  what: string;
  tone: AdminAuditTone;
  action: string;
  clientIp?: string;
  meta?: Record<string, unknown>;
}): Promise<{ ok: boolean; id?: string; entryHash?: string; storage: "postgres" | "memory" | "unavailable" }> {
  const id = randomUUID();
  const atIso = new Date().toISOString();
  const who = String(input.who || "unknown").slice(0, 200);
  const what = String(input.what || "").slice(0, 2000);
  const action = String(input.action || "privileged_action").slice(0, 120);
  const tone = input.tone;
  const clientIp = input.clientIp ? String(input.clientIp).slice(0, 120) : null;
  const meta = input.meta ?? {};

  const prevHash =
    isDbAuthEnabled() && process.env.DATABASE_URL
      ? await latestDbHash()
      : memoryLedger[0]?.entryHash ?? null;

  const payload = JSON.stringify({
    id,
    atIso,
    who,
    what,
    tone,
    action,
    clientIp,
    meta,
  });
  const entryHash = hashChain(prevHash, payload);

  const row: AdminAuditEntry = {
    id,
    atIso,
    who,
    what,
    tone,
    action,
    clientIp,
    meta,
    entryHash,
    prevHash,
  };

  if (!isDbAuthEnabled() || !process.env.DATABASE_URL) {
    memoryLedger.unshift(row);
    while (memoryLedger.length > MAX_MEMORY) memoryLedger.pop();
    return { ok: true, id, entryHash, storage: "memory" };
  }

  try {
    await getPool().query(
      `INSERT INTO platform_ops.admin_audit (
         id, at_iso, who, what, tone, action, client_ip, meta, entry_hash, prev_hash
       ) VALUES (
         $1, $2::timestamptz, $3, $4, $5, $6, $7, $8::jsonb, $9, $10
       )`,
      [
        id,
        atIso,
        who,
        what,
        tone,
        action,
        clientIp,
        JSON.stringify(meta),
        entryHash,
        prevHash,
      ],
    );
    memoryLedger.unshift(row);
    while (memoryLedger.length > MAX_MEMORY) memoryLedger.pop();
    return { ok: true, id, entryHash, storage: "postgres" };
  } catch {
    // Fallback memory if columns missing mid-migrate
    try {
      await getPool().query(
        `INSERT INTO platform_ops.admin_audit (id, at_iso, who, what, tone, action, client_ip, meta)
         VALUES ($1, $2::timestamptz, $3, $4, $5, $6, $7, $8::jsonb)`,
        [id, atIso, who, what, tone, action, clientIp, JSON.stringify(meta)],
      );
      return { ok: true, id, storage: "postgres" };
    } catch {
      memoryLedger.unshift(row);
      while (memoryLedger.length > MAX_MEMORY) memoryLedger.pop();
      return { ok: true, id, entryHash, storage: "memory" };
    }
  }
}

/** @deprecated Prefer appendAdminAudit — kept for runtimeFlags callers. */
export async function writePlatformAudit(input: {
  who: string;
  what: string;
  tone: AdminAuditTone;
  action: string;
  clientIp?: string;
  meta?: Record<string, unknown>;
}): Promise<{ ok: boolean; id?: string }> {
  const written = await appendAdminAudit(input);
  return { ok: written.ok, id: written.id };
}

export async function listAdminAudit(limit = 50): Promise<{
  ok: boolean;
  entries: AdminAuditEntry[];
  storage: "postgres" | "memory";
}> {
  const take = Math.max(1, Math.min(200, limit));
  if (!isDbAuthEnabled() || !process.env.DATABASE_URL) {
    return { ok: true, entries: memoryLedger.slice(0, take), storage: "memory" };
  }
  try {
    const { rows } = await getPool().query(
      `SELECT id, at_iso, who, what, tone, action, client_ip, meta, entry_hash, prev_hash
       FROM platform_ops.admin_audit
       ORDER BY at_iso DESC
       LIMIT $1`,
      [take],
    );
    const entries: AdminAuditEntry[] = rows.map((r) => ({
      id: String(r.id),
      atIso: new Date(String(r.at_iso)).toISOString(),
      who: String(r.who),
      what: String(r.what),
      tone: r.tone as AdminAuditTone,
      action: String(r.action),
      clientIp: r.client_ip ? String(r.client_ip) : null,
      meta:
        r.meta && typeof r.meta === "object"
          ? (r.meta as Record<string, unknown>)
          : {},
      entryHash: r.entry_hash ? String(r.entry_hash) : null,
      prevHash: r.prev_hash ? String(r.prev_hash) : null,
    }));
    return { ok: true, entries, storage: "postgres" };
  } catch {
    return { ok: true, entries: memoryLedger.slice(0, take), storage: "memory" };
  }
}
