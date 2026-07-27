/** Job Mitra | shiftOps/services/onboarding.service.ts | Phase 1 dual OTP + invite join */

import { getShiftOpsSupabase } from "../lib/supabaseClient";
import { ensureShiftOpsAuthSession } from "./authBridge.service";

export { joinSiteViaGroupLink } from "./groupDailyOtp.service";

type OtpPurpose = "onboard" | "channel_update" | "recover";

async function authedClient() {
  await ensureShiftOpsAuthSession();
  return getShiftOpsSupabase();
}

export async function requestChannelOtp(
  channelId: string,
  purpose: OtpPurpose = "onboard",
): Promise<string> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("request_channel_otp", {
    p_channel_id: channelId,
    p_purpose: purpose,
  });
  if (error) throw error;
  return data as string;
}

export async function verifyChannelOtp(channelId: string, otp: string): Promise<boolean> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("verify_channel_otp", {
    p_channel_id: channelId,
    p_otp: otp,
  });
  if (error) throw error;
  return data === true;
}

export async function joinSiteViaInvite(rawToken: string): Promise<string> {
  const sb = await authedClient();
  const { data, error } = await sb.rpc("join_site_via_invite", {
    p_raw_token: rawToken,
  });
  if (error) throw error;
  return data as string;
}
