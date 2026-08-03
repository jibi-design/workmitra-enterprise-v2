/**
 * Apply CRIT-2/CRIT-3 security migration to live DB (DATABASE_URL).
 * Never prints secrets. Usage: node scripts/apply-security-crit-role-otp.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name) {
  const path = resolve(root, name);
  if (!existsSync(path)) return;
  let text = readFileSync(path, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
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
loadEnvFile(".env.production");

const url =
  process.env.SHIFT_OPS_DATABASE_URL?.trim() ||
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.DATABASE_URL?.trim();

if (!url) {
  console.error("APPLY_BLOCKED=no_database_url");
  console.error(
    "Set DATABASE_URL (or SUPABASE_DB_URL / SHIFT_OPS_DATABASE_URL) then re-run.",
  );
  process.exit(2);
}

let hostHint = "unknown";
try {
  const u = new URL(url.replace(/^postgresql:/i, "http:"));
  hostHint = u.hostname;
} catch {
  hostHint = "unparseable";
}

console.log(`TARGET_HOST=${hostHint}`);
if (hostHint === "localhost" || hostHint === "127.0.0.1") {
  console.warn(
    "WARN=localhost_target — this may not be the live Supabase project.",
  );
}

const sqlPath = resolve(
  root,
  "supabase/migrations/202607280001_security_crit_role_otp.sql",
);
if (!existsSync(sqlPath)) {
  console.error("APPLY_BLOCKED=migration_file_missing");
  process.exit(2);
}
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  connectionString: url,
  ssl:
    process.env.DATABASE_SSL === "true"
      ? {
          rejectUnauthorized:
            process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
        }
      : hostHint.includes("supabase")
        ? { rejectUnauthorized: false }
        : undefined,
});

await client.connect();
console.log("CONNECTED=ok");

try {
  const schema = await client.query(
    "select exists(select 1 from information_schema.schemata where schema_name='shift_ops') as ok",
  );
  if (!schema.rows[0].ok) {
    console.error("APPLY_BLOCKED=shift_ops_schema_missing");
    process.exit(3);
  }
  console.log("PRECHECK=shift_ops_schema_present");

  console.log("APPLY_START=202607280001_security_crit_role_otp");
  await client.query(sql);
  console.log("APPLY_OK=migration_executed");

  // Verify CRIT-2: function body contains role_escalation_forbidden
  const fn = await client.query(
    `select pg_get_functiondef(p.oid) as def
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'shift_ops' and p.proname = 'ensure_so_user'
     limit 1`,
  );
  const def = fn.rows[0]?.def ?? "";
  const hasLock = def.includes("role_escalation_forbidden");
  console.log(`VERIFY_CRIT2_ROLE_LOCK=${hasLock ? "PASS" : "FAIL"}`);

  // Verify CRIT-3: authenticated has no SELECT on base table
  const priv = await client.query(
    `select has_table_privilege('authenticated', 'shift_ops.channel_otp_challenges', 'SELECT') as can_select`,
  );
  const canSelect = Boolean(priv.rows[0]?.can_select);
  console.log(
    `VERIFY_CRIT3_BASE_TABLE_SELECT_REVOKED=${canSelect ? "FAIL" : "PASS"}`,
  );

  const viewPriv = await client.query(
    `select has_table_privilege('authenticated', 'shift_ops.otp_challenges_safe', 'SELECT') as can_select`,
  );
  const viewOk = Boolean(viewPriv.rows[0]?.can_select);
  console.log(`VERIFY_CRIT3_SAFE_VIEW_SELECT=${viewOk ? "PASS" : "FAIL"}`);

  if (!hasLock || canSelect || !viewOk) {
    process.exit(4);
  }
  console.log("VERIFY_ALL=PASS");
} catch (err) {
  console.error(
    "APPLY_FAILED=",
    err instanceof Error ? err.message : "unknown",
  );
  process.exit(1);
} finally {
  await client.end();
}
