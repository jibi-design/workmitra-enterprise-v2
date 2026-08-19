/** Job Mitra | server/modules/auth/supabaseBridge.service.ts | GJ-3 mint Supabase session for JM user */

import { createClient } from "@supabase/supabase-js";
import type { AuthUser } from "./types.js";

/**
 * Browser-safe bridge payload — CRIT-01: never include Supabase refresh_token.
 * Access JWT only; re-mint via Job Mitra cookie session when expired.
 */
export type SupabaseBridgeSession = {
  access_token: string;
  expires_in: number | null;
  expires_at: number | null;
  supabase_user_id: string;
};

/** Map GoTrue session → public bridge DTO (strips refresh_token). */
export function toPublicBridgeSession(session: {
  access_token: string;
  expires_in?: number | null;
  expires_at?: number | null;
  user: { id: string };
}): SupabaseBridgeSession {
  return {
    access_token: session.access_token,
    expires_in: session.expires_in ?? null,
    expires_at: session.expires_at ?? null,
    supabase_user_id: session.user.id,
  };
}

function bridgeConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
    process.env.SUPABASE_ANON_KEY?.trim(),
  );
}

function bridgeEmailForUser(user: AuthUser): string {
  const email = user.email.trim().toLowerCase();
  if (email.includes("@")) return email;
  return `jm-${user.id.replace(/[^a-zA-Z0-9]/g, "")}@users.jobmitra.bridge`;
}

/**
 * Mint a Supabase Auth session for the authenticated Job Mitra user.
 * Uses service_role on the API server only — never expose to the browser.
 */
export async function mintSupabaseSessionForJobMitraUser(
  user: AuthUser,
  options?: { mitraLabId?: string },
): Promise<
  { ok: true; session: SupabaseBridgeSession } | { ok: false; code: string; message: string }
> {
  if (!bridgeConfigured()) {
    return {
      ok: false,
      code: "BRIDGE_NOT_CONFIGURED",
      message:
        "Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY on the API server.",
    };
  }

  const url = process.env.SUPABASE_URL!.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY!.trim();
  const email = bridgeEmailForUser(user);
  const metadata: Record<string, string> = {
    jobmitra_user_id: user.id,
    jobmitra_role: user.role,
    jobmitra_full_name: user.fullName,
  };
  const ml = options?.mitraLabId?.trim().toUpperCase();
  if (ml) {
    metadata.jobmitra_ml_id = ml;
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (createErr && !/already|registered|exists/i.test(createErr.message)) {
    return { ok: false, code: "BRIDGE_CREATE_USER_FAILED", message: createErr.message };
  }

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { data: metadata },
  });
  if (linkErr || !linkData.properties?.hashed_token) {
    return {
      ok: false,
      code: "BRIDGE_LINK_FAILED",
      message: linkErr?.message ?? "Missing hashed_token from generateLink",
    };
  }

  const supabaseUserId = linkData.user?.id;
  if (supabaseUserId) {
    await admin.auth.admin.updateUserById(supabaseUserId, { user_metadata: metadata });
  }

  const anon = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: otpData, error: otpErr } = await anon.auth.verifyOtp({
    type: "email",
    token_hash: linkData.properties.hashed_token,
  });
  if (otpErr || !otpData.session) {
    return {
      ok: false,
      code: "BRIDGE_SESSION_FAILED",
      message: otpErr?.message ?? "verifyOtp did not return a session",
    };
  }

  const session = otpData.session;
  return {
    ok: true,
    // CRIT-01 — refresh_token stays on API process only; never serialized to browser JSON.
    session: toPublicBridgeSession(session),
  };
}

/**
 * CRIT-1 — Invalidate bridged Supabase Auth sessions on Job Mitra logout.
 * Uses service_role only. Non-blocking callers should `.catch(() => {})`.
 */
export async function revokeSupabaseSessionForUser(user: AuthUser): Promise<void> {
  if (!bridgeConfigured()) return;

  const url = process.env.SUPABASE_URL!.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  const email = bridgeEmailForUser(user);

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let supabaseUserId: string | null = null;
  const perPage = 200;
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;

    const match = data.users.find((u) => {
      const meta = u.user_metadata as Record<string, unknown> | undefined;
      const metaJmId = typeof meta?.jobmitra_user_id === "string" ? meta.jobmitra_user_id : "";
      return u.email?.toLowerCase() === email || metaJmId === user.id;
    });
    if (match) {
      supabaseUserId = match.id;
      break;
    }
    if (data.users.length < perPage) break;
  }

  if (!supabaseUserId) return;

  // Global sign-out invalidates refresh tokens for this Auth user.
  const { error: signOutError } = await admin.auth.admin.signOut(supabaseUserId, "global");
  if (signOutError) {
    throw new Error(signOutError.message);
  }
}
