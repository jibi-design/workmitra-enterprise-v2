/**
 * Phase 2.1 §8.1 — Supabase backup/PITR operator attestation (dashboard evidence only).
 *
 * Does NOT call Supabase API. Does NOT read DATABASE_URL. Does NOT modify auth.
 *
 * Set env vars after Supabase Dashboard review, then run:
 *   node scripts/phase-2-1-operator-8-1-backup.mjs
 *
 * Never commit: DATABASE_URL, project refs, passwords, service role keys, screenshots.
 */
const REQUIRED = ["SUPABASE_BACKUP_ENABLED", "OPERATOR_SIGNOFF"];

const fields = {
  recorded_at: process.env.EVIDENCE_DATE ?? new Date().toISOString().slice(0, 10),
  operator_signoff: process.env.OPERATOR_SIGNOFF ?? "",
  project_env: process.env.SUPABASE_PROJECT_ENV ?? "staging",
  production_project_exists: process.env.PRODUCTION_PROJECT_EXISTS ?? "unknown",
  plan_tier: process.env.SUPABASE_PLAN_TIER ?? "unknown",
  backup_enabled: normalizeYesNo(process.env.SUPABASE_BACKUP_ENABLED),
  backup_schedule: process.env.SUPABASE_BACKUP_SCHEDULE ?? "unknown",
  backup_retention_days: process.env.SUPABASE_BACKUP_RETENTION_DAYS ?? "unknown",
  last_successful_backup_date: process.env.SUPABASE_LAST_BACKUP_DATE ?? "unknown",
  pitr_available: normalizeYesNo(process.env.SUPABASE_PITR_AVAILABLE ?? "unknown"),
  pitr_retention_days: process.env.SUPABASE_PITR_RETENTION_DAYS ?? "n/a",
  pitr_blocker: process.env.SUPABASE_PITR_BLOCKER ?? "unknown",
  pitr_mitigation: process.env.SUPABASE_PITR_MITIGATION ?? "",
  screenshot_location: process.env.SUPABASE_EVIDENCE_LOCATION ?? "secret-manager-or-ops-drive",
};

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.log(
    JSON.stringify({
      status: "BLOCKED",
      missing_env: missing,
      hint: "Set SUPABASE_BACKUP_ENABLED=yes|no and OPERATOR_SIGNOFF after dashboard review",
    }),
  );
  process.exit(1);
}

const backupPass = fields.backup_enabled === "yes";
const pitrDocumented =
  fields.pitr_available === "yes" ||
  (fields.pitr_available === "no" &&
    ["plan_limitation", "operational_blocker", "not_configured"].includes(fields.pitr_blocker) &&
    fields.pitr_mitigation.length > 0);

const item81 = backupPass ? "PASS" : fields.backup_enabled === "no" ? "FAIL" : "BLOCKED";
const item82 = pitrDocumented ? "PASS" : fields.pitr_available === "unknown" ? "NEEDS_OPERATOR" : "NEEDS_OPERATOR";

const codeFailure = false;
const operationalNote =
  fields.pitr_available === "no" && fields.pitr_blocker === "plan_limitation"
    ? "PITR plan limitation — not a code failure"
    : fields.pitr_available === "no" && fields.pitr_blocker === "operational_blocker"
      ? "PITR operational blocker — upgrade/mitigation required before production deploy"
      : null;

const summary = {
  status: item81 === "PASS" && item82 !== "BLOCKED" ? "RECORDED" : "INCOMPLETE",
  checklist: {
    "8.1_backup_enabled": item81,
    "8.2_pitr_documented": item82,
  },
  phase_2_1_verdict: item81 === "PASS" ? "IN_PROGRESS_UNTIL_FULL_P0_SIGNOFF" : "IN_PROGRESS",
  production_deployment: "NOT_APPROVED",
  phase_2_auth: "LOCKED",
  code_failure: codeFailure,
  operational_note: operationalNote,
  attestation: fields,
};

console.log("\n=== Phase 2.1 §8.1 Operator Attestation ===\n");
console.log(JSON.stringify(summary, null, 2));

console.log("\n--- Paste into PHASE_2_1_8_1_RECORD.md ---\n");
console.log(`recorded_at: ${fields.recorded_at}`);
console.log(`operator_signoff: ${fields.operator_signoff}`);
console.log(`project_env: ${fields.project_env}`);
console.log(`backup_enabled: ${fields.backup_enabled} → §8.1 ${item81}`);
console.log(`pitr_available: ${fields.pitr_available}`);
console.log(`pitr_blocker: ${fields.pitr_blocker}`);
console.log(`pitr_mitigation: ${fields.pitr_mitigation || "(required if pitr=no)"}`);
console.log(`§8.2 PITR documented: ${item82}`);
if (operationalNote) console.log(`note: ${operationalNote}`);
console.log(`Phase 2.1: IN PROGRESS (do not mark PASS until checklist §9.1 P0 complete)`);
console.log(`Production deploy: NOT APPROVED`);

function normalizeYesNo(v) {
  if (!v) return "unknown";
  const s = String(v).toLowerCase().trim();
  if (["yes", "true", "1", "enabled", "on"].includes(s)) return "yes";
  if (["no", "false", "0", "disabled", "off"].includes(s)) return "no";
  return s;
}
