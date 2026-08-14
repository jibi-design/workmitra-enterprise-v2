/**
 * Shared lab: 10 unique employers + 100 unique employees (explicit operator approval).
 * Passwords stay in-process; emails are masked in logs.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPool } from "../../server/db/pool.js";
import { hashPassword } from "../../server/modules/auth/password.js";
import { PRODUCT_SCOPE_JOBMITRA } from "../../server/modules/auth/constants.js";
import { generateSessionToken, hashSessionToken } from "../../server/modules/auth/crypto.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const LAB_SCALE_DOMAIN = "sim.jobmitra.lab";
export const EMPLOYER_COUNT = 10;
export const EMPLOYEE_COUNT = 100;

export function loadLabEnv(): void {
  for (const f of [".env", ".env.local", ".env.development.local"]) {
    const full = resolve(root, f);
    if (!existsSync(full)) continue;
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
      process.env[key] = val;
    }
  }
  process.env.AUTH_USER_SOURCE = "db";
  if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === undefined) {
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED = "false";
  }
}

function maskEmail(email: string): string {
  return email.replace(/(^.).*(@.*)$/, "$1***$2");
}

export function employerEmail(i: number): string {
  return `er${String(i).padStart(2, "0")}@${LAB_SCALE_DOMAIN}`;
}

export function employeeEmail(i: number): string {
  return `ee${String(i).padStart(3, "0")}@${LAB_SCALE_DOMAIN}`;
}

export type LabScaleUser = {
  id: string;
  email: string;
  role: "employer" | "employee";
  rawSessionToken: string;
};

async function upsertUser(
  email: string,
  passwordHash: string,
  fullName: string,
  role: "employer" | "employee",
): Promise<string> {
  const pool = getPool();
  const userRes = await pool.query<{ id: string }>(
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
    [email, passwordHash, fullName],
  );
  const userId = userRes.rows[0].id;
  await pool.query(
    `INSERT INTO auth_user_roles (user_id, product_scope, role, is_primary)
     VALUES ($1, $2, $3, true)
     ON CONFLICT DO NOTHING`,
    [userId, PRODUCT_SCOPE_JOBMITRA, role],
  );
  return userId;
}

async function mintSession(userId: string): Promise<string> {
  const raw = generateSessionToken();
  const hash = hashSessionToken(raw);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await getPool().query(
    `INSERT INTO auth_sessions
       (user_id, session_token_hash, expires_at, idle_expires_at, ip_hash, user_agent)
     VALUES ($1, $2, $3, $3, NULL, 'lab-scale-sim')`,
    [userId, hash, expires],
  );
  return raw;
}

export async function provisionLab110(): Promise<{
  employers: LabScaleUser[];
  employees: LabScaleUser[];
}> {
  loadLabEnv();
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL missing");
  }
  const password =
    process.env.WM_LAB_SCALE_PASSWORD?.trim() ||
    `WmLab!${randomBytes(16).toString("base64url").slice(0, 18)}`;
  const passwordHash = await hashPassword(password);
  const employers: LabScaleUser[] = [];
  const employees: LabScaleUser[] = [];

  for (let i = 1; i <= EMPLOYER_COUNT; i += 1) {
    const email = employerEmail(i);
    const id = await upsertUser(email, passwordHash, `Lab Employer ${i}`, "employer");
    const rawSessionToken = await mintSession(id);
    employers.push({ id, email, role: "employer", rawSessionToken });
  }
  for (let i = 1; i <= EMPLOYEE_COUNT; i += 1) {
    const email = employeeEmail(i);
    const id = await upsertUser(email, passwordHash, `Lab Employee ${i}`, "employee");
    const rawSessionToken = await mintSession(id);
    employees.push({ id, email, role: "employee", rawSessionToken });
  }

  const count = await getPool().query<{ n: string }>(
    `SELECT count(*)::text AS n FROM auth_users WHERE email LIKE $1`,
    [`%@${LAB_SCALE_DOMAIN}`],
  );
  console.log(
    `[lab-110] provisioned employers=${employers.length} employees=${employees.length} dbRows=${count.rows[0]?.n} sample=${maskEmail(employers[0].email)}`,
  );
  return { employers, employees };
}

const isDirect = process.argv[1]?.replaceAll("\\", "/").includes("provision-lab-110");
if (isDirect) {
  const result = await provisionLab110();
  console.log(`[lab-110] uniqueUsers=${result.employers.length + result.employees.length}`);
}
