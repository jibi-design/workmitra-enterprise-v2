/**
 * Defense Layer 5 — resilient DB helpers (retry, timeouts, deadlock handling).
 * Prevents pool exhaustion from stuck locks / transient disconnects.
 */

import type { PoolClient, QueryResult, QueryResultRow } from "pg";
import { getPool } from "./pool.js";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 40;

/** PostgreSQL / driver codes that are safe to retry (transient). */
const RETRYABLE_CODES = new Set([
  "40001", // serialization_failure
  "40P01", // deadlock_detected
  "57P01", // admin_shutdown
  "57P02", // crash_shutdown
  "57P03", // cannot_connect_now
  "08000", // connection_exception
  "08003", // connection_does_not_exist
  "08006", // connection_failure
  "08001", // sqlclient_unable_to_establish_sqlconnection
  "53300", // too_many_connections
]);

const RETRYABLE_MESSAGE_RE =
  /ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|Connection terminated|server closed the connection|Client has encountered a connection error|timeout exceeded when trying to connect/i;

export function isTransientDbError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  if (e.code && RETRYABLE_CODES.has(e.code)) return true;
  if (typeof e.message === "string" && RETRYABLE_MESSAGE_RE.test(e.message)) return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Exported for vault / single-client flows that manage BEGIN themselves. */
export async function withTransientRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  return withRetry(fn, label);
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransientDbError(err) || attempt === MAX_RETRIES) {
        throw err;
      }
      const delay = BASE_DELAY_MS * 2 ** (attempt - 1) + Math.floor(Math.random() * 30);
      console.warn(
        `[Job Mitra DB] transient error on ${label} (attempt ${attempt}/${MAX_RETRIES}) — retry in ${delay}ms`,
      );
      await sleep(delay);
    }
  }
  throw lastErr;
}

/**
 * Apply per-transaction lock / statement budgets so CAS locks cannot exhaust the pool.
 */
export async function applyTransactionGuards(client: PoolClient): Promise<void> {
  const statementMs = Number(process.env.DATABASE_STATEMENT_TIMEOUT_MS ?? 15_000);
  const lockMs = Number(process.env.DATABASE_LOCK_TIMEOUT_MS ?? 5_000);
  const idleTxMs = Number(process.env.DATABASE_IDLE_TX_TIMEOUT_MS ?? 30_000);
  await client.query(`SET LOCAL statement_timeout = ${Math.max(1_000, statementMs)}`);
  await client.query(`SET LOCAL lock_timeout = ${Math.max(500, lockMs)}`);
  await client.query(
    `SET LOCAL idle_in_transaction_session_timeout = ${Math.max(5_000, idleTxMs)}`,
  );
}

/**
 * Pool query with transient reconnect retry (does not hold a client across retries).
 */
export async function queryWithRetry<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return withRetry(
    () => getPool().query<T>(text, params),
    `query:${text.slice(0, 48).replace(/\s+/g, " ")}`,
  );
}

export type TransactionOptions = {
  /** Retry whole transaction on deadlock / serialization failure */
  retryOnDeadlock?: boolean;
};

/**
 * BEGIN/COMMIT wrapper with SET LOCAL timeouts + deadlock retry.
 * Always releases the client (prevents pool exhaustion).
 */
export async function withResilientTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
  options: TransactionOptions = {},
): Promise<T> {
  const retryOnDeadlock = options.retryOnDeadlock !== false;

  const runOnce = async (): Promise<T> => {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await applyTransactionGuards(client);
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // connection may already be dead — release still runs
      }
      throw err;
    } finally {
      client.release();
    }
  };

  if (!retryOnDeadlock) {
    return runOnce();
  }

  return withRetry(runOnce, "transaction");
}
