/**
 * Run GJ-4 read-only smoke SQL. Prints PASS/FAIL only — never connection strings.
 * Usage: node scripts/run-gj4-smoke.mjs
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
  console.log("SMOKE_BLOCKED=no_database_url");
  process.exit(2);
}

const client = new pg.Client({ connectionString: url });
await client.connect();

try {
  const schema = await client.query(
    "select exists(select 1 from information_schema.schemata where schema_name='shift_ops') as ok",
  );
  if (!schema.rows[0].ok) {
    console.log("SMOKE_BLOCKED=shift_ops_missing_on_this_url");
    process.exit(3);
  }

  const counts = await client.query(`
    select 'tables' as kind, count(*)::int as n
    from information_schema.tables
    where table_schema = 'shift_ops'
      and table_name in ('site_static_links', 'site_daily_otps')
    union all
    select 'fns' as kind, count(*)::int as n
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
  `);

  const byKind = Object.fromEntries(counts.rows.map((r) => [r.kind, r.n]));
  console.log(`TABLES=${byKind.tables ?? 0}`);
  console.log(`FNS=${byKind.fns ?? 0}`);

  const flags = await client.query(`
    select
      (p.prosrc ilike '%group_deleted%') as mentions_group_deleted,
      (p.prosrc ilike '%daily_otp_invalid%') as mentions_daily_otp_invalid,
      (p.prosrc ilike '%group_inactive%') as mentions_group_inactive
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'shift_ops'
      and p.proname = 'join_site_via_group_link'
  `);

  const f = flags.rows[0] ?? {};
  console.log(`MENTIONS_DELETED=${Boolean(f.mentions_group_deleted)}`);
  console.log(`MENTIONS_OTP_INVALID=${Boolean(f.mentions_daily_otp_invalid)}`);
  console.log(`MENTIONS_INACTIVE=${Boolean(f.mentions_group_inactive)}`);

  const pass =
    byKind.tables === 2 &&
    byKind.fns === 6 &&
    f.mentions_group_deleted &&
    f.mentions_daily_otp_invalid &&
    f.mentions_group_inactive;

  console.log(pass ? "SMOKE_RESULT=PASS" : "SMOKE_RESULT=FAIL");
  process.exit(pass ? 0 : 1);
} finally {
  await client.end();
}
