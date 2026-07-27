/** Job Mitra | server/jobs/gapRetention.shared.ts | GAP-001/002 shared guards + predicates */

import { randomUUID } from "node:crypto";

export const GAP001_ELIGIBLE_WHERE = `
  (expires_at < now() - interval '30 days')
  OR (idle_expires_at < now() - interval '30 days')
  OR (revoked_at IS NOT NULL AND revoked_at < now() - interval '30 days')
`;

export type GapJobMode = {
  dryRun: boolean;
  targetEnv: "staging" | "dev";
  jobRunId: string;
};

export function redactError(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const nested = (err as { errors?: unknown[] }).errors;
    if (Array.isArray(nested) && nested.length > 0) {
      return (
        nested
          .map((e) => redactError(e))
          .join(" | ")
          .slice(0, 500) || "aggregate_error"
      );
    }
  }
  const message = err instanceof Error ? err.message : String(err ?? "unknown_error");
  const cleaned = message
    .replace(/postgres(ql)?:\/\/\S+/gi, "[redacted]")
    .replace(/password=\S+/gi, "password=[redacted]")
    .trim();
  return cleaned || (err instanceof Error ? err.name : "unknown_error");
}

export function toDateOnly(value: unknown): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * Resolve run mode. DRY_RUN defaults to true.
 * DELETE requires DRY_RUN=false AND GAP_DELETE_APPROVED=1.
 */
export function resolveGapJobMode(): GapJobMode {
  const targetRaw = (process.env.DRY_RUN_TARGET_ENV ?? "dev").toLowerCase();
  if (targetRaw !== "staging" && targetRaw !== "dev") {
    throw new Error("DRY_RUN_TARGET_ENV must be staging or dev — production not allowed");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NODE_ENV=production is not allowed for GAP retention jobs");
  }
  if (process.env.RENDER_SERVICE_NAME) {
    throw new Error("Render service environment detected — GAP retention jobs blocked");
  }
  if (process.env.CF_PAGES === "1") {
    throw new Error("Cloudflare Pages runtime detected — GAP retention jobs blocked");
  }
  if (process.env.AUTH_USER_SOURCE !== "db") {
    throw new Error("AUTH_USER_SOURCE must be db for GAP retention jobs");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const dryRunEnv = process.env.DRY_RUN;
  // Default true when unset or any value other than explicit "false"
  const wantsLive = dryRunEnv === "false";
  const deleteApproved = process.env.GAP_DELETE_APPROVED === "1";

  if (wantsLive && !deleteApproved) {
    throw new Error(
      "Refusing live DELETE: set GAP_DELETE_APPROVED=1 only after dry-run review + explicit operator approve",
    );
  }

  return {
    dryRun: !wantsLive,
    targetEnv: targetRaw,
    jobRunId: randomUUID(),
  };
}
