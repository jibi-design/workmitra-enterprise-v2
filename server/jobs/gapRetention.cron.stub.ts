/** Job Mitra | server/jobs/gapRetention.cron.stub.ts | T3-3 schedule stub (dry-run only) */

/**
 * Documented schedule for ops (not auto-started by API server).
 * External cron (Render / OS) should invoke: `npm run job:gap-retention:cron`
 */
export const GAP_RETENTION_CRON_STUB = {
  job_name: "gap_retention_cron_stub",
  /** Daily 03:00 UTC — adjust per env; stub only */
  cron_expression: "0 3 * * *",
  entry_script: "scripts/gap-retention-cron-entry.ts",
  npm_script: "job:gap-retention:cron",
  /** Stub always dry-run — live DELETE not available through this path */
  forces_dry_run: true as const,
  live_delete_via_cron: false as const,
  notes: [
    "Do not enable GAP_DELETE_APPROVED on cron until T3-4 + backup gate.",
    "API server does not auto-start this interval (avoid surprise DB load).",
    "Wire Render Cron Job → npm run job:gap-retention:cron when deploy env ready.",
  ],
} as const;

export type GapRetentionCronStub = typeof GAP_RETENTION_CRON_STUB;
