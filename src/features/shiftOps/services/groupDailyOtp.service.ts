/** Job Mitra | shiftOps/services/groupDailyOtp.service.ts | Static link + Daily OTP RPCs */

import { getShiftOpsSupabase } from "../lib/supabaseClient";
import type {
  DailyOtpRotateResult,
  DailyOtpStatusResult,
  GroupPeekResult,
  SiteRow,
  StaticLinkEnsureResult,
} from "../types";
import { ensureShiftOpsAuthSession } from "./authBridge.service";

function firstRow<T>(data: T | T[] | null): T | null {
  if (data == null) return null;
  return Array.isArray(data) ? (data[0] ?? null) : data;
}

async function authedClient() {
  await ensureShiftOpsAuthSession();
  return getShiftOpsSupabase();
}

export async function listManagedSites(): Promise<SiteRow[]> {
  const sb = await authedClient();
  const { data, error } = await sb.from("sites").select("*").eq("is_active", true).order("name");
  if (error) throw error;
  return (data ?? []) as SiteRow[];
}

export async function ensureSiteStaticLink(groupId: string): Promise<StaticLinkEnsureResult> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("ensure_site_static_link", { p_site_id: groupId });
  if (error) throw error;
  const row = firstRow(data as StaticLinkEnsureResult | StaticLinkEnsureResult[]);
  if (!row) throw new Error("ensure_site_static_link_empty");
  return row;
}

export async function rotateSiteStaticLink(groupId: string): Promise<StaticLinkEnsureResult> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("rotate_site_static_link", { p_site_id: groupId });
  if (error) throw error;
  const row = firstRow(data as StaticLinkEnsureResult | StaticLinkEnsureResult[]);
  if (!row) throw new Error("rotate_site_static_link_empty");
  return row;
}

export async function rotateSiteDailyOtp(groupId: string): Promise<DailyOtpRotateResult> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("rotate_site_daily_otp", { p_site_id: groupId });
  if (error) throw error;
  const row = firstRow(data as DailyOtpRotateResult | DailyOtpRotateResult[]);
  if (!row) throw new Error("rotate_site_daily_otp_empty");
  return row;
}

export async function siteDailyOtpStatus(groupId: string): Promise<DailyOtpStatusResult> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("site_daily_otp_status", { p_site_id: groupId });
  if (error) throw error;
  const row = firstRow(data as DailyOtpStatusResult | DailyOtpStatusResult[]);
  if (!row) throw new Error("site_daily_otp_status_empty");
  return row;
}

export async function peekGroupFromStaticLink(rawToken: string): Promise<GroupPeekResult> {
  // Granted to anon+authenticated — still try bridge so authenticated peek is consistent
  if (isConfiguredQuiet()) {
    try {
      await ensureShiftOpsAuthSession();
    } catch {
      /* peek may work as anon */
    }
  }
  const sb = getShiftOpsSupabase();
  const { data, error } = await sb.rpc("peek_group_from_static_link", {
    p_raw_token: rawToken.trim(),
  });
  if (error) throw error;
  const row = firstRow(data as GroupPeekResult | GroupPeekResult[]);
  if (!row) throw new Error("group_link_invalid");
  return row;
}

function isConfiguredQuiet(): boolean {
  try {
    return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  } catch {
    return false;
  }
}

export async function joinSiteViaGroupLink(rawToken: string, dailyOtp: string): Promise<string> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("join_site_via_group_link", {
    p_raw_token: rawToken.trim(),
    p_daily_otp: dailyOtp.trim(),
  });
  if (error) throw error;
  return data as string;
}

/** Build hash deep-link for static group QR (token required; group id optional display). */
export function buildGroupJoinPath(rawToken: string, groupId?: string): string {
  const params = new URLSearchParams();
  params.set("token", rawToken);
  if (groupId) params.set("group", groupId);
  return `/employee/shift-ops/invite?${params.toString()}`;
}
