/**
 * One-shot: apply Shift Ops Phase 0+1 SQL from supabase/migrations via DATABASE_URL.
 * Usage: node scripts/apply-shift-ops-migrations.mjs
 * Never prints connection secrets or pepper values.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnv(resolve(root, ".env"));

// Prefer explicit Shift Ops / Supabase DB URL so local auth localhost is not used by mistake.
const url =
  process.env.SHIFT_OPS_DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.DATABASE_URL;
if (!url) {
  console.error(
    "FAIL: Set SHIFT_OPS_DATABASE_URL or SUPABASE_DB_URL (preferred) or DATABASE_URL",
  );
  process.exit(1);
}

const source =
  process.env.SHIFT_OPS_DATABASE_URL
    ? "SHIFT_OPS_DATABASE_URL"
    : process.env.SUPABASE_DB_URL
      ? "SUPABASE_DB_URL"
      : "DATABASE_URL";
console.log(`url_source=${source}`);

const hostHint =
  url
    .replace(/:[^:@/]+@/, "@")
    .replace(/^[^:]+:\/\//, "")
    .split("/")[0]
    .split("@")
    .pop() || "none";
const portHint = (url.match(/:(\d+)(?:\/|\?)/) || [])[1] || "n/a";
console.log(`host_hint=${hostHint}`);
console.log(`port_hint=${portHint}`);

const ssl = String(process.env.DATABASE_SSL || "true").toLowerCase() !== "false";
const client = new pg.Client({
  connectionString: url,
  ssl: ssl ? { rejectUnauthorized: false } : false,
});

const files = [
  "supabase/migrations/202607240001_shift_ops_phase0_identity.sql",
  "supabase/migrations/202607240002_shift_ops_phase1_onboarding_approval.sql",
];

try {
  await client.connect();
  console.log("connected=true");

  for (const f of files) {
    const sql = readFileSync(resolve(root, f), "utf8");
    console.log(`applying=${f}`);
    await client.query(sql);
    console.log(`applied_ok=${f}`);
  }

  const checks = await client.query(`
    select
      exists(select 1 from pg_namespace where nspname = 'shift_ops') as schema_ok,
      (select count(*)::int from information_schema.tables where table_schema = 'shift_ops') as table_count,
      exists(
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'shift_ops' and p.proname = 'is_channel_pepper_ready'
      ) as pepper_fn_ok,
      exists(
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'shift_ops' and p.proname = 'otp_dispatch_decrypt_bundle'
      ) as otp_decrypt_fn_ok,
      exists(
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'shift_ops' and p.proname = 'request_channel_otp'
      ) as request_otp_ok,
      shift_ops.is_channel_pepper_ready() as pepper_ready
  `);
  console.log(`verify=${JSON.stringify(checks.rows[0])}`);
  console.log("DONE");
} catch (err) {
  const e = /** @type {{ code?: string; message?: string }} */ (err);
  console.error(`applied_fail=true`);
  console.error(`error_code=${e.code || "n/a"}`);
  console.error(`error_message=${String(e.message || err).slice(0, 800)}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
