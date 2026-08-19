/**
 * Play Store reviewer seed — dual-workspace auth user + sample career data.
 *
 * Auth SoT: public.auth_users (Argon2id). No email-verification gate in Job Mitra login.
 * Usage: npm run db:seed:play-reviewer
 * Env: DATABASE_URL (from .env), optional SEED_PLAY_REVIEWER_EMAIL / SEED_PLAY_REVIEWER_PASSWORD
 */
import { randomBytes } from "node:crypto";
import { getPool, closePool } from "./pool.js";
import { hashPassword, verifyPassword } from "../modules/auth/password.js";
import { PRODUCT_SCOPE_JOBMITRA } from "../modules/auth/constants.js";

const REVIEWER_EMAIL = (
  process.env.SEED_PLAY_REVIEWER_EMAIL ?? "google.reviewer@workmitra.com"
)
  .trim()
  .toLowerCase();
const PEER_EMAIL = (
  process.env.SEED_PLAY_PEER_EMAIL ?? "play.employee@workmitra.com"
)
  .trim()
  .toLowerCase();
const REVIEWER_NAME = process.env.SEED_PLAY_REVIEWER_NAME ?? "Google Play Reviewer";
const POST_TITLE = "Play Store Review — Sample Career Role";

function resolvePassword(): { password: string; generated: boolean } {
  const fromEnv = process.env.SEED_PLAY_REVIEWER_PASSWORD?.trim();
  if (fromEnv && fromEnv.length >= 12) {
    return { password: fromEnv, generated: false };
  }
  // Play Console–friendly: letters + digits, no ambiguous punctuation
  const raw = randomBytes(18).toString("base64url");
  const password = `WmReview!${raw.slice(0, 14)}`;
  return { password, generated: true };
}

async function ensureUser(
  client: import("pg").PoolClient,
  email: string,
  passwordHash: string,
  fullName: string,
): Promise<string> {
  const result = await client.query<{ id: string }>(
    `INSERT INTO auth_users (email, password_hash, full_name, status, failed_login_count, locked_until)
     VALUES ($1, $2, $3, 'active', 0, NULL)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           full_name = EXCLUDED.full_name,
           status = 'active',
           failed_login_count = 0,
           failed_login_window_start = NULL,
           locked_until = NULL,
           updated_at = now()
     RETURNING id`,
    [email, passwordHash, fullName],
  );
  return result.rows[0].id;
}

async function ensureRole(
  client: import("pg").PoolClient,
  userId: string,
  role: "employee" | "employer",
  isPrimary: boolean,
): Promise<void> {
  await client.query(
    `INSERT INTO auth_user_roles (user_id, role, product_scope, is_primary)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, role, product_scope) DO UPDATE
       SET is_primary = EXCLUDED.is_primary`,
    [userId, role, PRODUCT_SCOPE_JOBMITRA, isPrimary],
  );
}

async function clearMaintenanceFlags(client: import("pg").PoolClient): Promise<string> {
  try {
    await client.query(`
      INSERT INTO platform_ops.runtime_flags (id, maintenance_mode, lockdown)
      VALUES ('global', false, false)
      ON CONFLICT (id) DO UPDATE
        SET maintenance_mode = false,
            lockdown = false,
            updated_at = now(),
            updated_by = 'play-store-reviewer-seed'
    `);
    const { rows } = await client.query<{
      maintenance_mode: boolean;
      lockdown: boolean;
    }>(`SELECT maintenance_mode, lockdown FROM platform_ops.runtime_flags WHERE id = 'global'`);
    const row = rows[0];
    return `maintenance=${row?.maintenance_mode === true}, lockdown=${row?.lockdown === true}`;
  } catch (err) {
    return `platform_ops unavailable (${err instanceof Error ? err.message : "unknown"}) — defaults are off in-memory`;
  }
}

async function seedSampleCareerData(
  client: import("pg").PoolClient,
  employerId: string,
  employeeId: string,
): Promise<{ postId: string; applicationId: string }> {
  const existingPost = await client.query<{ id: string }>(
    `SELECT id FROM career_posts
     WHERE employer_user_id = $1 AND title = $2 AND status != 'deleted'
     LIMIT 1`,
    [employerId, POST_TITLE],
  );

  let postId: string;
  if (existingPost.rowCount && existingPost.rowCount > 0) {
    postId = existingPost.rows[0].id;
    await client.query(
      `UPDATE career_posts
       SET status = 'published', description = $2, location = $3, updated_at = now()
       WHERE id = $1`,
      [
        postId,
        "Sample published role for Google Play review — safe demo content only.",
        "Remote",
      ],
    );
  } else {
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO career_posts (employer_user_id, title, description, location, status)
       VALUES ($1, $2, $3, $4, 'published')
       RETURNING id`,
      [
        employerId,
        POST_TITLE,
        "Sample published role for Google Play review — safe demo content only.",
        "Remote",
      ],
    );
    postId = inserted.rows[0].id;
  }

  const existingApp = await client.query<{ id: string }>(
    `SELECT id FROM career_applications
     WHERE post_id = $1 AND applicant_user_id = $2`,
    [postId, employeeId],
  );

  let applicationId: string;
  if (existingApp.rowCount && existingApp.rowCount > 0) {
    applicationId = existingApp.rows[0].id;
    await client.query(
      `UPDATE career_applications
       SET status = 'pending', cover_note = $2, updated_at = now()
       WHERE id = $1`,
      [applicationId, "Play Store reviewer sample application."],
    );
  } else {
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO career_applications (post_id, applicant_user_id, status, cover_note)
       VALUES ($1, $2, 'pending', $3)
       RETURNING id`,
      [postId, employeeId, "Play Store reviewer sample application."],
    );
    applicationId = inserted.rows[0].id;
  }

  return { postId, applicationId };
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is required");
  }

  const { password, generated } = resolvePassword();
  const passwordHash = await hashPassword(password);
  const peerHash = await hashPassword(password);

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reviewerId = await ensureUser(client, REVIEWER_EMAIL, passwordHash, REVIEWER_NAME);
    // Dual workspace: employer primary (hiring dashboards), employee secondary (switcher)
    await ensureRole(client, reviewerId, "employer", true);
    await ensureRole(client, reviewerId, "employee", false);

    const peerId = await ensureUser(client, PEER_EMAIL, peerHash, "Play Store Peer Employee");
    await ensureRole(client, peerId, "employee", true);

    const { postId, applicationId } = await seedSampleCareerData(client, reviewerId, peerId);
    const flagsNote = await clearMaintenanceFlags(client);

    await client.query("COMMIT");

    // Post-commit verify hash round-trip (no network login)
    const row = await pool.query<{ password_hash: string; status: string }>(
      `SELECT password_hash, status FROM auth_users WHERE email = $1`,
      [REVIEWER_EMAIL],
    );
    const ok =
      row.rows[0]?.status === "active" &&
      (await verifyPassword(password, row.rows[0].password_hash));

    const roles = await pool.query<{ role: string; is_primary: boolean }>(
      `SELECT role, is_primary FROM auth_user_roles WHERE user_id = $1 ORDER BY role`,
      [reviewerId],
    );

    console.log("[PlayReviewerSeed] OK");
    console.log(`[PlayReviewerSeed] reviewer_id=${reviewerId}`);
    console.log(`[PlayReviewerSeed] peer_id=${peerId}`);
    console.log(`[PlayReviewerSeed] post_id=${postId}`);
    console.log(`[PlayReviewerSeed] application_id=${applicationId}`);
    console.log(`[PlayReviewerSeed] roles=${JSON.stringify(roles.rows)}`);
    console.log(`[PlayReviewerSeed] password_verify=${ok}`);
    console.log(`[PlayReviewerSeed] password_source=${generated ? "generated" : "env"}`);
    console.log(`[PlayReviewerSeed] runtime_flags=${flagsNote}`);
    console.log("[PlayReviewerSeed] email_verification=not_required (Job Mitra auth_users status=active)");
    console.log("--- PLAY_CONSOLE_APP_ACCESS ---");
    console.log(`DEMO_EMAIL=${REVIEWER_EMAIL}`);
    console.log(`DEMO_PASSWORD=${password}`);
    console.log("--- END ---");
    console.log(`[PlayReviewerSeed] peer_email=${PEER_EMAIL} (same password; employee-only companion for sample applications)`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

main()
  .then(() => closePool())
  .catch((err) => {
    console.error("[PlayReviewerSeed] Failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
