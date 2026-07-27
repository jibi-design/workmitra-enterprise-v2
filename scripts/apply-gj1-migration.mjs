/**
 * Apply GJ-1 migration to DATABASE_URL from .env (no secrets printed).
 * Usage: node scripts/apply-gj1-migration.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name) {
  const path = resolve(root, name);
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const url =
  process.env.SHIFT_OPS_DATABASE_URL?.trim() ||
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.DATABASE_URL?.trim();

if (!url) {
  console.error("APPLY_BLOCKED=no_database_url");
  process.exit(2);
}

const sqlPath = resolve(
  root,
  "supabase/migrations/202607260001_shift_ops_static_link_daily_otp.sql",
);
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({ connectionString: url });
await client.connect();

try {
  const schema = await client.query(
    "select exists(select 1 from information_schema.schemata where schema_name='shift_ops') as ok",
  );
  if (!schema.rows[0].ok) {
    console.error("APPLY_BLOCKED=shift_ops_schema_missing");
    console.error(
      "This DATABASE_URL does not have shift_ops (Phase 0+1). Use Supabase SQL Editor on the project where Phase 0+1 was applied.",
    );
    process.exit(3);
  }

  console.log("APPLY_START=gj1_static_link_daily_otp");
  await client.query(sql);
  console.log("APPLY_OK=migration_executed");

  const tables = await client.query(
    `select table_name from information_schema.tables
     where table_schema='shift_ops'
       and table_name in ('site_static_links','site_daily_otps')
     order by table_name`,
  );
  console.log(
    "TABLES=" + tables.rows.map((r) => r.table_name).join(","),
  );

  const fns = await client.query(
    `select p.proname
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'shift_ops'
       and p.proname in (
         'ensure_site_static_link',
         'rotate_site_static_link',
         'rotate_site_daily_otp',
         'site_daily_otp_status',
         'peek_group_from_static_link',
         'join_site_via_group_link'
       )
     order by p.proname`,
  );
  console.log("FNS=" + fns.rows.map((r) => r.proname).join(","));
  console.log("FN_COUNT=" + fns.rows.length);
} finally {
  await client.end();
}
