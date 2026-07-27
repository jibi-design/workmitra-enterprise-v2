/**
 * Apply Phase 3 call_sessions + P1-FIX-4 membership bridge SQL.
 * Prefers a connection that already has shift_ops (not local auth-only DB).
 * Usage: node scripts/apply-p3-fix4-migrations.mjs
 * Never prints connection secrets.
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

function hostHint(url) {
  return (
    url
      .replace(/:[^:@/]+@/, "@")
      .replace(/^[^:]+:\/\//, "")
      .split("/")[0]
      .split("@")
      .pop() || "none"
  );
}

const candidates = [
  ["SHIFT_OPS_DATABASE_URL", process.env.SHIFT_OPS_DATABASE_URL?.trim()],
  ["SUPABASE_DB_URL", process.env.SUPABASE_DB_URL?.trim()],
  ["DATABASE_URL", process.env.DATABASE_URL?.trim()],
].filter(([, v]) => Boolean(v));

if (candidates.length === 0) {
  console.error("APPLY_BLOCKED=no_database_url");
  process.exit(2);
}

const ssl = String(process.env.DATABASE_SSL || "true").toLowerCase() !== "false";

async function probeShiftOps(url) {
  const client = new pg.Client({
    connectionString: url,
    ssl: ssl ? { rejectUnauthorized: false } : false,
  });
  try {
    await client.connect();
    const schema = await client.query(
      "select exists(select 1 from information_schema.schemata where schema_name='shift_ops') as ok",
    );
    return { ok: Boolean(schema.rows[0]?.ok), client };
  } catch (err) {
    await client.end().catch(() => undefined);
    return {
      ok: false,
      client: null,
      error: err instanceof Error ? err.message.slice(0, 200) : "connect_failed",
    };
  }
}

let chosenSource = "";
let client = null;

for (const [source, url] of candidates) {
  console.log(`probe_source=${source} host_hint=${hostHint(url)}`);
  const probed = await probeShiftOps(url);
  if (probed.ok && probed.client) {
    chosenSource = source;
    client = probed.client;
    console.log(`selected_source=${source}`);
    break;
  }
  if (probed.client) {
    await probed.client.end().catch(() => undefined);
  }
  console.log(
    `probe_skip=${source} reason=${probed.error || "shift_ops_schema_missing"}`,
  );
}

if (!client) {
  console.error("APPLY_BLOCKED=no_shift_ops_database");
  console.error(
    "Set SHIFT_OPS_DATABASE_URL or SUPABASE_DB_URL to the Supabase Postgres URI where Phase 0+1 / GJ-1 live.",
  );
  process.exit(3);
}

const files = [
  "supabase/migrations/202607260002_call_sessions.sql",
  "supabase/migrations/202607260003_auto_provision_site_membership.sql",
];

try {
  console.log(`url_source=${chosenSource}`);
  console.log("connected=true");

  for (const f of files) {
    const sql = readFileSync(resolve(root, f), "utf8");
    console.log(`APPLY_START=${f}`);
    await client.query(sql);
    console.log(`APPLY_OK=${f}`);
  }

  const callTable = await client.query(
    `select exists(
       select 1 from information_schema.tables
       where table_schema='public' and table_name='call_sessions'
     ) as ok`,
  );
  console.log(`VERIFY_CALL_SESSIONS=${callTable.rows[0].ok}`);

  const fns = await client.query(
    `select p.proname
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'shift_ops'
       and p.proname in (
         'ensure_so_user_for_auth',
         'auto_provision_site_membership'
       )
     order by p.proname`,
  );
  console.log("VERIFY_FNS=" + fns.rows.map((r) => r.proname).join(","));
  console.log("VERIFY_FN_COUNT=" + fns.rows.length);
  console.log("DONE");
} catch (err) {
  const e = /** @type {{ code?: string; message?: string }} */ (err);
  console.error("APPLY_FAIL=true");
  console.error(`error_code=${e.code || "n/a"}`);
  console.error(`error_message=${String(e.message || err).slice(0, 800)}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
