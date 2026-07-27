/**
 * Job Mitra — GAP-001 + GAP-002 retention jobs CLI
 *
 * Default: DRY_RUN=true (count-only, no DELETE).
 * Live DELETE requires BOTH:
 *   DRY_RUN=false
 *   GAP_DELETE_APPROVED=1
 *
 * Usage:
 *   DRY_RUN_TARGET_ENV=dev AUTH_USER_SOURCE=db npx tsx scripts/run-gap-retention-jobs.ts
 *   node scripts/with-auth-db-source.mjs scripts/run-gap-retention-jobs.ts
 *
 * Logs: counts/dates only — no tokens, emails, hashes, DATABASE_URL.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { closePool, getPool } from "../server/db/pool.ts";
import { runGap001SessionCleanup } from "../server/jobs/gap001SessionCleanup.job.ts";
import { runGap002AuditRetention } from "../server/jobs/gap002AuditRetention.job.ts";
import { redactError, resolveGapJobMode } from "../server/jobs/gapRetention.shared.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(path: string) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.trimStart().startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 1) continue;
      const k = line.slice(0, i).trim();
      let v = line.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (process.env[k] === undefined) process.env[k] = v;
    }
  } catch {
    // optional
  }
}

loadEnvFile(resolve(root, ".env"));
loadEnvFile(resolve(root, ".env.local"));

if (!process.env.AUTH_USER_SOURCE) {
  process.env.AUTH_USER_SOURCE = "db";
}

try {
  const mode = resolveGapJobMode();
  const pool = getPool();

  const gap001 = await runGap001SessionCleanup(pool, mode);
  console.log(JSON.stringify(gap001, null, 2));

  const gap002 = await runGap002AuditRetention(pool, {
    ...mode,
    jobRunId: mode.jobRunId,
  });
  console.log(JSON.stringify(gap002, null, 2));

  console.log(
    JSON.stringify({
      ok: true,
      summary: "gap_retention_jobs_complete",
      dry_run: mode.dryRun,
      destructive_action: !mode.dryRun,
      target_env: mode.targetEnv,
      job_run_id: mode.jobRunId,
    }),
  );
} catch (err) {
  console.log(
    JSON.stringify({
      ok: false,
      dry_run: process.env.DRY_RUN !== "false",
      destructive_action: false,
      error: redactError(err),
    }),
  );
  process.exitCode = 1;
} finally {
  await closePool().catch(() => undefined);
}
