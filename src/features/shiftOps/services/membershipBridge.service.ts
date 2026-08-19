/**
 * Job Mitra | P0 group-truth membership bridge
 * Path: src/features/shiftOps/services/membershipBridge.service.ts
 *
 * Confirm paths MUST await provisionSiteMembership before local confirm.
 * Best-effort helper remains only for retry-queue drain (never primary confirm).
 */

import { identityBridge } from "../../../app/identity/identity.adapter";
import { enqueueShiftRetry } from "../../../shared/shift/shiftRetryQueue";
import { isShiftOpsSupabaseConfigured } from "../lib/supabaseClient";
import { ensureShiftOpsAuthSession } from "./authBridge.service";
import { getShiftOpsSupabase } from "../lib/supabaseClient";
import { upsertSiteMembershipTruth } from "../storage/siteMembershipTruth.storage";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type MembershipProvisionInput = {
  siteId: string;
  workerMlId: string;
  /** Optional Job Mitra auth UUID when known */
  workerAuthUserId?: string;
  /** Optional Job Mitra auth user id (metadata jobmitra_user_id) */
  jobmitraUserId?: string;
  planId?: string;
  context?: string;
};

export type MembershipProvisionResult =
  { ok: true; membershipId: string } | { ok: false; code: string; message: string };

export function isSoSiteUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/** Local membership truth when Shift Ops cloud RPC / auth bridge is unavailable. */
export function provisionLocalSiteMembership(
  siteId: string,
  workerMlId: string,
): MembershipProvisionResult {
  const site = siteId.trim();
  const ml = workerMlId.trim().toUpperCase();
  if (!site || !isSoSiteUuid(site) || !ml) {
    return { ok: false, code: "SITE_ID_INVALID", message: "siteId or workerMlId missing." };
  }
  const membershipId = `e2e-local-${ml.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  upsertSiteMembershipTruth({
    siteId: site,
    workerMlId: ml,
    membershipId,
    status: "pending_manager_approval",
  });
  return { ok: true, membershipId };
}

function resolveJobmitraUserId(workerMlId: string, explicit?: string): string | undefined {
  const direct = explicit?.trim();
  if (direct) return direct;
  const mapped = identityBridge.load().employee[workerMlId.trim()]?.trim();
  return mapped || undefined;
}

/**
 * Call Shift Ops RPC. Requires employer SO session as site manager.
 */
export async function provisionSiteMembership(
  input: MembershipProvisionInput,
): Promise<MembershipProvisionResult> {
  const siteId = input.siteId.trim();
  const workerMlId = input.workerMlId.trim().toUpperCase();

  if (!siteId || !isSoSiteUuid(siteId)) {
    return { ok: false, code: "SITE_ID_INVALID", message: "siteId must be a Shift Ops site UUID." };
  }
  if (!workerMlId) {
    return { ok: false, code: "WORKER_ML_REQUIRED", message: "workerMlId required." };
  }
  if (!isShiftOpsSupabaseConfigured()) {
    return provisionLocalSiteMembership(siteId, workerMlId);
  }

  try {
    await ensureShiftOpsAuthSession();
  } catch (err) {
    return {
      ok: false,
      code: "AUTH_BRIDGE_FAILED",
      message: err instanceof Error ? err.message : "Shift Ops auth bridge failed",
    };
  }

  // identityBridge maps ML → Job Mitra auth user id (metadata), not auth.users.id
  const jobmitraUserId = resolveJobmitraUserId(workerMlId, input.jobmitraUserId);
  const workerAuthUserId = input.workerAuthUserId?.trim();
  const workerAuth =
    workerAuthUserId && UUID_RE.test(workerAuthUserId) ? workerAuthUserId : undefined;

  const sb = getShiftOpsSupabase();
  const { data, error } = await sb.rpc("auto_provision_site_membership", {
    p_site_id: siteId,
    p_worker_auth_user_id: workerAuth ?? null,
    p_jobmitra_user_id: jobmitraUserId ?? null,
    p_jobmitra_ml_id: workerMlId,
  });

  if (error) {
    return {
      ok: false,
      code: error.code || "RPC_FAILED",
      message: error.message || "auto_provision_site_membership failed",
    };
  }

  const membershipId = typeof data === "string" ? data.trim() : String(data ?? "").trim();
  if (!membershipId || !UUID_RE.test(membershipId)) {
    return { ok: false, code: "INVALID_RPC_RESULT", message: "RPC did not return membership id." };
  }

  upsertSiteMembershipTruth({
    siteId,
    workerMlId,
    membershipId,
    status: "pending_manager_approval",
  });

  return { ok: true, membershipId };
}

/**
 * Retry-queue / drain only — NOT for primary confirm (P0: no orphan workspaces).
 */
export function provisionSiteMembershipBestEffort(input: MembershipProvisionInput): void {
  void (async () => {
    const result = await provisionSiteMembership(input);
    if (result.ok) return;

    enqueueShiftRetry(
      "site_membership_provision",
      {
        siteId: input.siteId.trim(),
        workerMlId: input.workerMlId.trim().toUpperCase(),
        workerAuthUserId: input.workerAuthUserId?.trim() ?? "",
        jobmitraUserId: input.jobmitraUserId?.trim() ?? "",
        planId: input.planId?.trim() ?? "",
        context: input.context ?? "retry_best_effort",
        code: result.code,
      },
      result.message,
    );
  })();
}

/** Audit / Board alias for provisionSiteMembership */
export async function autoProvisionShiftOpsMembership(
  input: MembershipProvisionInput,
): Promise<MembershipProvisionResult> {
  return provisionSiteMembership(input);
}

/** Audit / Board alias for provisionSiteMembershipBestEffort */
export function autoProvisionShiftOpsMembershipBestEffort(input: MembershipProvisionInput): void {
  provisionSiteMembershipBestEffort(input);
}

/** Retry-queue drain helper for site_membership_provision ops. */
export async function drainSiteMembershipProvisionItem(
  context: Record<string, string>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const siteId = context.siteId?.trim() ?? "";
  const workerMlId = context.workerMlId?.trim() ?? "";
  if (!siteId || !workerMlId) {
    return { ok: false, error: "missing_site_or_worker" };
  }

  const result = await provisionSiteMembership({
    siteId,
    workerMlId,
    workerAuthUserId: context.workerAuthUserId || undefined,
    jobmitraUserId: context.jobmitraUserId || undefined,
    planId: context.planId || undefined,
    context: "retry_drain",
  });

  if (result.ok) return { ok: true };
  return { ok: false, error: `${result.code}:${result.message}` };
}
