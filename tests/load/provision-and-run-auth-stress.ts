/**
 * Provision ephemeral load-test auth user in Supabase Postgres, then run authenticated 1k stress.
 * Password stays in-process only (not printed / not written to .env).
 *
 * Usage:
 *   npx tsx tests/load/provision-and-run-auth-stress.ts
 */
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getPool, closePool } from "../../server/db/pool.js";
import { hashPassword } from "../../server/modules/auth/password.js";
import { PRODUCT_SCOPE_JOBMITRA } from "../../server/modules/auth/constants.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function loadEnvFile(name: string) {
  const full = resolve(root, name);
  if (!existsSync(full)) return;
  for (const line of readFileSync(full, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

for (const f of [".env", ".env.local", ".env.production", "server/.env"]) loadEnvFile(f);

process.env.AUTH_USER_SOURCE = "db";
if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === undefined) {
  process.env.DATABASE_SSL_REJECT_UNAUTHORIZED = "false";
}

const EMAIL = (
  process.env.WM_LOAD_TEST_EMAIL?.trim() || "loadtest.store@workmitra.com"
).toLowerCase();
const PASSWORD =
  process.env.WM_LOAD_TEST_PASSWORD?.trim() ||
  `WmLoad!${randomBytes(16).toString("base64url").slice(0, 18)}`;

if (!process.env.DATABASE_URL?.trim()) {
  console.error("[provision] DATABASE_URL missing");
  process.exit(2);
}

const pool = getPool();
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const passwordHash = await hashPassword(PASSWORD);
  const userRes = await client.query<{ id: string }>(
    `INSERT INTO auth_users (email, password_hash, full_name, status, failed_login_count, locked_until)
     VALUES ($1, $2, $3, 'active', 0, NULL)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           status = 'active',
           failed_login_count = 0,
           locked_until = NULL,
           updated_at = now()
     RETURNING id`,
    [EMAIL, passwordHash, "Store Load Test User"],
  );
  const userId = userRes.rows[0].id;

  await client.query(
    `INSERT INTO auth_user_roles (user_id, product_scope, role, is_primary)
     VALUES ($1, $2, 'employee', true)
     ON CONFLICT DO NOTHING`,
    [userId, PRODUCT_SCOPE_JOBMITRA],
  );
  await client.query(
    `UPDATE auth_user_roles SET is_primary = true
     WHERE user_id = $1 AND product_scope = $2 AND role = 'employee'`,
    [userId, PRODUCT_SCOPE_JOBMITRA],
  );

  await client.query("COMMIT");
  console.log(
    `[provision] load-test user ready id=${userId} email=${EMAIL.replace(/(^.).*(@.*)$/, "$1***$2")}`,
  );
} catch (err) {
  await client.query("ROLLBACK").catch(() => undefined);
  console.error("[provision] failed", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  client.release();
  await closePool();
}

process.env.WM_LOAD_TEST_EMAIL = EMAIL;
process.env.WM_LOAD_TEST_PASSWORD = PASSWORD;
process.env.WM_API_BASE = process.env.WM_API_BASE?.trim() || "https://mitraaccesshub.com";
process.env.K6_VUS_MAX = process.env.K6_VUS_MAX || "1000";
process.env.K6_CHAOS = "0";
process.env.WM_REQUIRE_AUTH = "1";
process.env.WM_FORCE_NODE_LOAD = "1";
process.env.WM_SESSION_POOL = process.env.WM_SESSION_POOL || "3";

console.log(`[provision] launching authenticated stress against ${process.env.WM_API_BASE}`);

const runner = resolve(root, "tests/load/run-authenticated-store-stress.mjs");
const result = spawnSync(process.execPath, [runner], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
