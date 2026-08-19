/**
 * Provision load-test user + inspect live login Set-Cookie (no password print).
 */
import { randomBytes } from "node:crypto";
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
process.env.DATABASE_SSL_REJECT_UNAUTHORIZED ??= "false";

const EMAIL = "loadtest.store@workmitra.com";
const PASSWORD = `WmLoad!${randomBytes(12).toString("base64url")}`;
const BASE = process.env.WM_API_BASE?.trim() || "https://mitraaccesshub.com";

const pool = getPool();
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const hash = await hashPassword(PASSWORD);
  const r = await client.query<{ id: string }>(
    `INSERT INTO auth_users (email, password_hash, full_name, status, failed_login_count, locked_until)
     VALUES ($1,$2,'Store Load Test User','active',0,NULL)
     ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, status='active',
       failed_login_count=0, locked_until=NULL, updated_at=now()
     RETURNING id`,
    [EMAIL, hash],
  );
  const id = r.rows[0].id;
  await client.query(
    `INSERT INTO auth_user_roles (user_id, product_scope, role, is_primary)
     VALUES ($1,$2,'employee',true) ON CONFLICT DO NOTHING`,
    [id, PRODUCT_SCOPE_JOBMITRA],
  );
  await client.query("COMMIT");
  console.log("provisioned", id);
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  client.release();
  await closePool();
}

function describeCookies(label: string, res: Response) {
  const raw =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : res.headers.get("set-cookie")
        ? [res.headers.get("set-cookie")!]
        : [];
  console.log(label, "status", res.status, "setCookieCount", raw.length);
  for (const s of raw) {
    console.log(
      " ",
      s.split("=")[0],
      "attrs",
      s
        .split(";")
        .slice(1)
        .map((x) => x.trim().split("=")[0])
        .join(","),
    );
  }
}

const csrf = await fetch(`${BASE}/v1/jobmitra/auth/csrf`);
describeCookies("csrf", csrf);

const login = await fetch(`${BASE}/v1/jobmitra/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
describeCookies("login", login);
const keys: string[] = [];
login.headers.forEach((_, k) => keys.push(k));
console.log(
  "interesting headers",
  keys.filter((k) => /cookie|csrf|session|token/i.test(k)).join(",") || "(none)",
);
const body = (await login.json()) as {
  data?: { user?: unknown; csrfToken?: string };
};
console.log("body.user?", Boolean(body?.data?.user), "csrfToken?", Boolean(body?.data?.csrfToken));
console.log("x-csrf-token?", Boolean(login.headers.get("x-csrf-token")));

// Persist password only into process for follow-up if needed via env file is forbidden.
// Write a short-lived machine-local temp credential for the next stress run in OS temp — avoid.
process.env.WM_LOAD_TEST_EMAIL = EMAIL;
process.env.WM_LOAD_TEST_PASSWORD = PASSWORD;
console.log("env credentials armed for child (password not printed)");
