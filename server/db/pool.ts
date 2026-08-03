/**
 * Defense Layer 5 — PostgreSQL connection pool with health timeouts + strict SSL.
 */

import { readFileSync } from "node:fs";
import pg from "pg";
import { isProduction } from "../modules/auth/env.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function poolMax(): number {
  const n = Number(process.env.DATABASE_POOL_MAX ?? 10);
  return Number.isFinite(n) && n >= 1 ? Math.min(Math.floor(n), 50) : 10;
}

/**
 * SSL config:
 * - DATABASE_SSL!=true → no TLS
 * - DATABASE_SSL=true + production → rejectUnauthorized true by default (CA verify)
 * - DATABASE_SSL_REJECT_UNAUTHORIZED=false → explicit opt-out (staging / self-signed)
 * - DATABASE_SSL_CA → PEM path or inline PEM for custom CA
 */
function buildSslConfig(): undefined | { rejectUnauthorized: boolean; ca?: string } {
  if (process.env.DATABASE_SSL !== "true") return undefined;

  const rejectEnv = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase();
  const rejectUnauthorized =
    rejectEnv === "false" || rejectEnv === "0"
      ? false
      : rejectEnv === "true" || rejectEnv === "1"
        ? true
        : isProduction(); // prod default: verify; non-prod default: verify unless opted out

  const caPath = process.env.DATABASE_SSL_CA?.trim();
  if (caPath) {
    try {
      const ca = caPath.includes("BEGIN CERTIFICATE") ? caPath : readFileSync(caPath, "utf8");
      return { rejectUnauthorized, ca };
    } catch (err) {
      console.error(
        "[Job Mitra DB] Failed to load DATABASE_SSL_CA:",
        err instanceof Error ? err.message : "unknown",
      );
      throw new Error("DATABASE_SSL_CA could not be loaded");
    }
  }

  if (!rejectUnauthorized) {
    console.warn(
      "[Job Mitra DB] SSL enabled with rejectUnauthorized=false — MITM risk; set DATABASE_SSL_CA or enable verification.",
    );
  }

  return { rejectUnauthorized };
}

export function getPool(): pg.Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required when AUTH_USER_SOURCE=db");
  }
  if (!pool) {
    const statementMs = Number(process.env.DATABASE_STATEMENT_TIMEOUT_MS ?? 15_000);
    const lockMs = Number(process.env.DATABASE_LOCK_TIMEOUT_MS ?? 5_000);

    pool = new Pool({
      connectionString: url,
      ssl: buildSslConfig(),
      max: poolMax(),
      connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS ?? 10_000),
      idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS ?? 30_000),
      allowExitOnIdle: true,
      options: `-c statement_timeout=${Math.max(1_000, statementMs)} -c lock_timeout=${Math.max(500, lockMs)}`,
    });

    pool.on("error", (err) => {
      console.error("[Job Mitra DB] idle client error:", err.message);
    });
  }
  return pool;
}

export async function verifyDbConnection(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("SELECT 1 AS ok");
  } finally {
    client.release();
  }
}

export async function pingDb(): Promise<{ ok: true; latencyMs: number }> {
  const start = Date.now();
  await verifyDbConnection();
  return { ok: true, latencyMs: Date.now() - start };
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
