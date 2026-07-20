/**
 * Staging seed script — creates test users with argon2id hashed passwords.
 * NEVER commit real passwords. Load from env or prompt at runtime.
 *
 * Usage: npm run db:seed
 * Requires: DATABASE_URL and AUTH_USER_SOURCE=db
 */
import { getPool, closePool } from "./pool.js";
import { hashPassword } from "../modules/auth/password.js";
import { PRODUCT_SCOPE_JOBMITRA } from "../modules/auth/constants.js";

const SEED_EMPLOYEE_EMAIL = process.env.SEED_EMPLOYEE_EMAIL ?? "employee@staging.jobmitra.app";
const SEED_EMPLOYER_EMAIL = process.env.SEED_EMPLOYER_EMAIL ?? "employer@staging.jobmitra.app";
const SEED_EMPLOYEE_PASSWORD = process.env.SEED_EMPLOYEE_PASSWORD;
const SEED_EMPLOYER_PASSWORD = process.env.SEED_EMPLOYER_PASSWORD;

if (!SEED_EMPLOYEE_PASSWORD || !SEED_EMPLOYER_PASSWORD) {
  console.error("[Seed] SEED_EMPLOYEE_PASSWORD and SEED_EMPLOYER_PASSWORD are required env vars.");
  process.exit(1);
}

async function seedUsers(): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const employeeHash = await hashPassword(SEED_EMPLOYEE_PASSWORD!);
    const employerHash = await hashPassword(SEED_EMPLOYER_PASSWORD!);

    const upsertUser = `
      INSERT INTO auth_users (email, password_hash, full_name, status)
      VALUES ($1, $2, $3, 'active')
      ON CONFLICT (email) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            full_name = EXCLUDED.full_name,
            updated_at = now()
      RETURNING id
    `;

    const empResult = await client.query<{ id: string }>(upsertUser, [
      SEED_EMPLOYEE_EMAIL,
      employeeHash,
      "Staging Employee",
    ]);
    const emplResult = await client.query<{ id: string }>(upsertUser, [
      SEED_EMPLOYER_EMAIL,
      employerHash,
      "Staging Employer",
    ]);

    const empId = empResult.rows[0].id;
    const emplId = emplResult.rows[0].id;

    const upsertRole = `
      INSERT INTO auth_user_roles (user_id, role, product_scope, is_primary)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (user_id, role, product_scope) DO NOTHING
    `;

    await client.query(upsertRole, [empId, "employee", PRODUCT_SCOPE_JOBMITRA]);
    await client.query(upsertRole, [emplId, "employer", PRODUCT_SCOPE_JOBMITRA]);

    await client.query("COMMIT");

    console.log(`[Seed] Created/updated: ${SEED_EMPLOYEE_EMAIL} (employee)`);
    console.log(`[Seed] Created/updated: ${SEED_EMPLOYER_EMAIL} (employer)`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

seedUsers()
  .then(() => closePool())
  .catch((err) => {
    console.error("[Seed] Failed:", err);
    process.exit(1);
  });
