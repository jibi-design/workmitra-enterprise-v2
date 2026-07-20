/**
 * Career lifecycle seed — creates a test career post and application.
 * Resets offer, employment, and lifecycle events so the gate test can be re-run cleanly.
 *
 * Usage: npm run db:seed:career
 * Requires: DATABASE_URL env var and users already seeded via npm run db:seed
 *
 * Output includes APPLICATION_ID=<uuid> which is read by test-career-gate.ps1
 */
import { getPool, closePool } from "./pool.js";

const SEED_EMPLOYER_EMAIL = process.env.SEED_EMPLOYER_EMAIL ?? "employer@staging.jobmitra.app";
const SEED_EMPLOYEE_EMAIL = process.env.SEED_EMPLOYEE_EMAIL ?? "employee@staging.jobmitra.app";

const SEED_POST_TITLE = "Seed Test Career Post — Job Mitra";

interface Row {
  id: string;
  status?: string;
}

async function seedCareerLifecycle(): Promise<void> {
  const client = await getPool().connect();

  try {
    // 1. Resolve employer and employee IDs
    const empResult = await client.query<Row>(`SELECT id FROM auth_users WHERE email = $1`, [
      SEED_EMPLOYER_EMAIL,
    ]);
    if (empResult.rowCount === 0) {
      throw new Error(
        `Employer user '${SEED_EMPLOYER_EMAIL}' not found. Run npm run db:seed first.`,
      );
    }
    const employerId = empResult.rows[0].id;

    const eeResult = await client.query<Row>(`SELECT id FROM auth_users WHERE email = $1`, [
      SEED_EMPLOYEE_EMAIL,
    ]);
    if (eeResult.rowCount === 0) {
      throw new Error(
        `Employee user '${SEED_EMPLOYEE_EMAIL}' not found. Run npm run db:seed first.`,
      );
    }
    const employeeId = eeResult.rows[0].id;

    // 2. Find or create the seed career post
    const existingPost = await client.query<Row>(
      `SELECT id FROM career_posts
       WHERE employer_user_id = $1 AND title = $2 AND status != 'deleted'
       LIMIT 1`,
      [employerId, SEED_POST_TITLE],
    );

    let postId: string;
    if (existingPost.rowCount! > 0) {
      postId = existingPost.rows[0].id;
      console.log(`[Career Seed] Post exists (id=${postId})`);
    } else {
      const newPost = await client.query<Row>(
        `INSERT INTO career_posts (employer_user_id, title, description, location, status)
         VALUES ($1, $2, $3, $4, 'published')
         RETURNING id`,
        [
          employerId,
          SEED_POST_TITLE,
          "Full-stack TypeScript role for Job Mitra platform.",
          "Remote",
        ],
      );
      postId = newPost.rows[0].id;
      console.log(`[Career Seed] Post created (id=${postId})`);
    }

    // 3. Find or create the seed application
    const existingApp = await client.query<Row>(
      `SELECT id, status FROM career_applications
       WHERE post_id = $1 AND applicant_user_id = $2`,
      [postId, employeeId],
    );

    let applicationId: string;
    if (existingApp.rowCount! > 0) {
      applicationId = existingApp.rows[0].id;
      console.log(
        `[Career Seed] Application exists (id=${applicationId}, status=${existingApp.rows[0].status}) — resetting`,
      );
    } else {
      const newApp = await client.query<Row>(
        `INSERT INTO career_applications (post_id, applicant_user_id, status, cover_note)
         VALUES ($1, $2, 'pending', $3)
         RETURNING id`,
        [postId, employeeId, "Seeded application for Career gate testing."],
      );
      applicationId = newApp.rows[0].id;
      console.log(`[Career Seed] Application created (id=${applicationId})`);
    }

    // 4. Reset state — delete in FK-safe order so the gate can be re-run from scratch
    await client.query(`DELETE FROM career_lifecycle_events WHERE application_id = $1`, [
      applicationId,
    ]);
    await client.query(`DELETE FROM career_employments WHERE application_id = $1`, [applicationId]);
    await client.query(`DELETE FROM career_offers WHERE application_id = $1`, [applicationId]);
    await client.query(
      `UPDATE career_applications SET status = 'pending', updated_at = now() WHERE id = $1`,
      [applicationId],
    );

    console.log(`[Career Seed] State reset to 'pending' — ready for gate test`);
    console.log(`[Career Seed] ---`);
    console.log(`[Career Seed] APPLICATION_ID=${applicationId}`);
    console.log(`[Career Seed] EMPLOYER_EMAIL=${SEED_EMPLOYER_EMAIL}`);
    console.log(`[Career Seed] EMPLOYEE_EMAIL=${SEED_EMPLOYEE_EMAIL}`);
  } finally {
    client.release();
  }
}

seedCareerLifecycle()
  .then(() => closePool())
  .catch((err) => {
    console.error("[Career Seed] Failed:", err);
    process.exit(1);
  });
