/** Job Mitra | server/jobs/callNoAnswerFallback.cron.stub.ts | Phase 3 schedule stub */

/**
 * Documented schedule for ops (not auto-started by API server).
 * External cron should invoke: `npm run job:call-fallback`
 */
export const CALL_NO_ANSWER_FALLBACK_CRON_STUB = {
  job_name: "call_no_answer_fallback_cron_stub",
  /** Every minute — pick ringing sessions older than CALL_NO_ANSWER_MS (default 30s) */
  cron_expression: "* * * * *",
  entry_script: "scripts/run-call-fallback-job.ts",
  npm_script: "job:call-fallback",
  default_no_answer_ms: 30_000,
  notes: [
    "API server does not auto-start this interval.",
    "Set CALL_FALLBACK_DEST_JSON only on the API host — never commit real E.164 values.",
    "CALL_FALLBACK_DRY_RUN=true counts only (no Twilio / status mutations).",
    "Requires call_sessions migration applied + TWILIO_* when dialing.",
  ],
} as const;

export type CallNoAnswerFallbackCronStub = typeof CALL_NO_ANSWER_FALLBACK_CRON_STUB;
