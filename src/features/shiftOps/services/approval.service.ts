/** Job Mitra | shiftOps/services/approval.service.ts | Phase 1 manager gate */

import { getShiftOpsSupabase } from "../lib/supabaseClient";
import type { SiteMembershipRow, SoMembershipStatus } from "../types";
import { ensureShiftOpsAuthSession } from "./authBridge.service";
import { upsertSiteMembershipTruth } from "../storage/siteMembershipTruth.storage";

async function authedClient() {
  await ensureShiftOpsAuthSession();
  return getShiftOpsSupabase();
}

export async function listPendingMembershipsForManager(): Promise<SiteMembershipRow[]> {
  const sb = await authedClient();
  const { data, error } = await sb
    .from("site_memberships")
    .select("*")
    .eq("status", "pending_manager_approval")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SiteMembershipRow[];
}

export async function listMyMemberships(): Promise<SiteMembershipRow[]> {
  const sb = await authedClient();
  const { data, error } = await sb
    .from("site_memberships")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SiteMembershipRow[];
}

/** Worker poll helper — returns membership status or null if not found. */
export async function checkMembershipStatus(
  membershipId: string,
): Promise<SoMembershipStatus | null> {
  const id = membershipId.trim();
  if (!id) return null;
  const rows = await listMyMemberships();
  const row = rows.find((r) => r.id === id);
  return row?.status ?? null;
}

export async function managerDecideMembership(
  membershipId: string,
  approve: boolean,
  rejectReason?: string,
): Promise<SoMembershipStatus> {
  const id = membershipId.trim();
  const pending = await listPendingMembershipsForManager();
  const prior = pending.find((row) => row.id === id);

  const sb = await authedClient();
  const { data, error } = await sb.rpc("manager_decide_membership", {
    p_membership_id: id,
    p_approve: approve,
    p_reject_reason: rejectReason ?? null,
  });
  if (error) throw error;

  const status = data as SoMembershipStatus;
  const workerMl = prior?.jobmitra_ml_id?.trim();
  if (prior?.site_id && workerMl) {
    upsertSiteMembershipTruth({
      siteId: prior.site_id,
      workerMlId: workerMl,
      membershipId: id,
      status,
    });
  }
  return status;
}
