/**
 * Job Mitra — GAP retention cron entry (T3-3 stub)
 *
 * ALWAYS forces DRY_RUN=true and clears GAP_DELETE_APPROVED.
 * Safe to wire as Render/external cron later — will never DELETE via this entry.
 *
 * Usage:
 *   npm run job:gap-retention:cron
 *   DRY_RUN_TARGET_ENV=dev npm run job:gap-retention:cron
 */

process.env.DRY_RUN = "true";
delete process.env.GAP_DELETE_APPROVED;

await import("./run-gap-retention-jobs.ts");
