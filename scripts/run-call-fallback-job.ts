/**
 * Job Mitra — Phase 3 call no-answer fallback CLI
 *
 * Default: live mutations when DB/Twilio available.
 * Dry-run: CALL_FALLBACK_DRY_RUN=true
 *
 * Usage:
 *   node scripts/with-auth-db-source.mjs scripts/run-call-fallback-job.ts
 *   npm run job:call-fallback
 *
 * Logs: counts only — never E.164, tokens, or DATABASE_URL.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { closePool } from "../server/db/pool.ts";
import { runCallNoAnswerFallback } from "../server/jobs/callNoAnswerFallback.job.ts";

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
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {
    /* optional */
  }
}

loadEnvFile(resolve(root, ".env"));
loadEnvFile(resolve(root, ".env.local"));

async function main() {
  const result = await runCallNoAnswerFallback();
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        job_name: result.job_name,
        run_at: result.run_at,
        older_than_ms: result.older_than_ms,
        scanned: result.scanned,
        twilio_attempted: result.twilio_attempted,
        twilio_ok: result.twilio_ok,
        marked_failed: result.marked_failed,
        skipped: result.skipped,
        dry_run: result.dry_run,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error("[call-fallback]", err instanceof Error ? err.message : "unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await closePool();
    } catch {
      /* ignore */
    }
  });
