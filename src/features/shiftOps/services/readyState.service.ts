/** Job Mitra | shiftOps/services/readyState.service.ts | Phase 1 routing + ready actions */

import { getShiftOpsSupabase } from "../lib/supabaseClient";
import type { PendingShiftAssignmentRow, PostApprovalRouteResult } from "../types";
import { ensureShiftOpsAuthSession } from "./authBridge.service";

async function authedClient() {
  await ensureShiftOpsAuthSession();
  return getShiftOpsSupabase();
}

export async function getPostApprovalRoute(
  siteId?: string | null,
): Promise<PostApprovalRouteResult> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("get_post_approval_route", {
    p_site_id: siteId ?? null,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as PostApprovalRouteResult;
}

export async function fetchPendingAssignment(
  assignmentId: string,
): Promise<PendingShiftAssignmentRow | null> {
  const sb = await authedClient();
  const { data, error } = await sb
    .from("pending_shift_assignments")
    .select("*")
    .eq("id", assignmentId)
    .maybeSingle();
  if (error) throw error;
  return (data as PendingShiftAssignmentRow) ?? null;
}

export async function respondPendingAssignment(
  assignmentId: string,
  accept: boolean,
): Promise<string> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("respond_pending_assignment", {
    p_assignment_id: assignmentId,
    p_accept: accept,
  });
  if (error) throw error;
  return data as string;
}

export async function setMyAvailability(available: boolean): Promise<boolean> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("set_my_availability", {
    p_available: available,
  });
  if (error) throw error;
  return data === true;
}

export async function requestTestAlert(): Promise<string> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("request_test_alert");
  if (error) throw error;
  return data as string;
}

export async function fetchLastTestAlertAt(): Promise<string | null> {
  const sb = await authedClient();
  const { data, error } = await sb
    .from("alert_test_log")
    .select("tested_at")
    .order("tested_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.tested_at as string | undefined) ?? null;
}
