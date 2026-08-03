/**
 * Sprint 3 — Job Mitra runtime ops flags (maintenance / lockdown / kills).
 * Source of truth: platform_ops.runtime_flags when DB available; else memory.
 */

import { randomUUID } from "node:crypto";
import { getPool } from "../../db/pool.js";
import { isDbAuthEnabled } from "../auth/env.js";

export type RuntimeFlags = {
  maintenanceMode: boolean;
  lockdown: boolean;
  killShift: boolean;
  killCareer: boolean;
  killPlanner: boolean;
  updatedAtIso: string;
  updatedBy: string | null;
  source: "db" | "memory";
};

let memoryFlags: RuntimeFlags = {
  maintenanceMode: false,
  lockdown: false,
  killShift: false,
  killCareer: false,
  killPlanner: false,
  updatedAtIso: new Date().toISOString(),
  updatedBy: null,
  source: "memory",
};

function rowToFlags(row: Record<string, unknown>): RuntimeFlags {
  return {
    maintenanceMode: Boolean(row.maintenance_mode),
    lockdown: Boolean(row.lockdown),
    killShift: Boolean(row.kill_shift),
    killCareer: Boolean(row.kill_career),
    killPlanner: Boolean(row.kill_planner),
    updatedAtIso: new Date(String(row.updated_at ?? Date.now())).toISOString(),
    updatedBy: row.updated_by ? String(row.updated_by) : null,
    source: "db",
  };
}

export async function getRuntimeFlags(): Promise<RuntimeFlags> {
  if (!isDbAuthEnabled() || !process.env.DATABASE_URL) {
    return { ...memoryFlags, source: "memory" };
  }
  try {
    const { rows } = await getPool().query(
      `SELECT maintenance_mode, lockdown, kill_shift, kill_career, kill_planner, updated_at, updated_by
       FROM platform_ops.runtime_flags WHERE id = 'global' LIMIT 1`,
    );
    if (!rows[0]) return { ...memoryFlags, source: "memory" };
    memoryFlags = rowToFlags(rows[0] as Record<string, unknown>);
    return memoryFlags;
  } catch {
    return { ...memoryFlags, source: "memory" };
  }
}

export async function patchRuntimeFlags(
  patch: Partial<{
    maintenanceMode: boolean;
    lockdown: boolean;
    killShift: boolean;
    killCareer: boolean;
    killPlanner: boolean;
  }>,
  updatedBy: string,
): Promise<RuntimeFlags> {
  const current = await getRuntimeFlags();
  const next: RuntimeFlags = {
    maintenanceMode: patch.maintenanceMode ?? current.maintenanceMode,
    lockdown: patch.lockdown ?? current.lockdown,
    killShift: patch.killShift ?? current.killShift,
    killCareer: patch.killCareer ?? current.killCareer,
    killPlanner: patch.killPlanner ?? current.killPlanner,
    updatedAtIso: new Date().toISOString(),
    updatedBy,
    source: current.source,
  };

  if (!isDbAuthEnabled() || !process.env.DATABASE_URL) {
    memoryFlags = { ...next, source: "memory" };
    return memoryFlags;
  }

  try {
    const { rows } = await getPool().query(
      `INSERT INTO platform_ops.runtime_flags (
         id, maintenance_mode, lockdown, kill_shift, kill_career, kill_planner, updated_at, updated_by
       ) VALUES (
         'global', $1, $2, $3, $4, $5, now(), $6
       )
       ON CONFLICT (id) DO UPDATE SET
         maintenance_mode = EXCLUDED.maintenance_mode,
         lockdown = EXCLUDED.lockdown,
         kill_shift = EXCLUDED.kill_shift,
         kill_career = EXCLUDED.kill_career,
         kill_planner = EXCLUDED.kill_planner,
         updated_at = now(),
         updated_by = EXCLUDED.updated_by
       RETURNING maintenance_mode, lockdown, kill_shift, kill_career, kill_planner, updated_at, updated_by`,
      [
        next.maintenanceMode,
        next.lockdown,
        next.killShift,
        next.killCareer,
        next.killPlanner,
        updatedBy,
      ],
    );
    memoryFlags = rowToFlags(rows[0] as Record<string, unknown>);
    return memoryFlags;
  } catch {
    memoryFlags = { ...next, source: "memory" };
    return memoryFlags;
  }
}

/** Append plain-English audit row when platform_ops.admin_audit exists. */
export async function writePlatformAudit(input: {
  who: string;
  what: string;
  tone: "green" | "yellow" | "red";
  action: string;
  clientIp?: string;
  meta?: Record<string, unknown>;
}): Promise<{ ok: boolean; id?: string }> {
  if (!isDbAuthEnabled() || !process.env.DATABASE_URL) {
    return { ok: false };
  }
  const id = randomUUID();
  try {
    await getPool().query(
      `INSERT INTO platform_ops.admin_audit (id, at_iso, who, what, tone, action, client_ip, meta)
       VALUES ($1, now(), $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        id,
        input.who,
        input.what,
        input.tone,
        input.action,
        input.clientIp ?? null,
        JSON.stringify(input.meta ?? {}),
      ],
    );
    return { ok: true, id };
  } catch {
    return { ok: false };
  }
}
