/** Job Mitra | shiftOps/services/identity.service.ts | Phase 0 identity RPCs */

import { getShiftOpsSupabase } from "../lib/supabaseClient";
import type { ChannelsSafeRow, SoChannelKind, SoRole } from "../types";
import { isShiftContactRevealed } from "../privacy";
import { ensureShiftOpsAuthSession } from "./authBridge.service";

export async function ensureShiftOpsUser(role: SoRole = "worker"): Promise<string> {
  await ensureShiftOpsAuthSession();
  const sb = getShiftOpsSupabase();
  const { data, error } = await sb.rpc("ensure_so_user", { p_role: role });
  if (error) throw error;
  return data as string;
}

export async function fetchPlatformLockRevealed(): Promise<boolean> {
  await ensureShiftOpsAuthSession();
  const sb = getShiftOpsSupabase();
  const { error } = await sb.rpc("is_shift_contact_revealed", { p_user_id: null });
  if (error) throw error;
  // Phase 0–1 product invariant — peer contact is never revealed in UI
  return isShiftContactRevealed();
}

export async function upsertWorkChannel(
  kind: SoChannelKind,
  rawValue: string,
  makePrimary = true,
): Promise<string> {
  if (isShiftContactRevealed()) {
    throw new Error("platform_lock_violation");
  }
  await ensureShiftOpsAuthSession();
  const sb = getShiftOpsSupabase();
  const { data, error } = await sb.rpc("upsert_work_channel", {
    p_kind: kind,
    p_value: rawValue,
    p_make_primary: makePrimary,
  });
  if (error) throw error;
  return data as string;
}

export async function listMyChannelsSafe(): Promise<ChannelsSafeRow[]> {
  await ensureShiftOpsAuthSession();
  const sb = getShiftOpsSupabase();
  const { data, error } = await sb.from("channels_safe").select("*").order("created_at", {
    ascending: true,
  });
  if (error) throw error;
  return (data ?? []) as ChannelsSafeRow[];
}
