/** Job Mitra | shiftOps/services/authBridge.service.ts | GJ-3 FE: JM session → Supabase setSession */

import { AUTH_API_PREFIX, AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { apiService } from "../../../shared/services/apiService";
import { getCurrentActorId, identityBridge } from "../../../app/identity/identity.adapter";
import { useAuthStore } from "../../../shared/store/authStore";
import { getShiftOpsSupabase, isShiftOpsSupabaseConfigured } from "../lib/supabaseClient";

type BridgeSessionPayload = {
  access_token: string;
  refresh_token: string;
  expires_in: number | null;
  expires_at: number | null;
  supabase_user_id: string;
};

interface ApiEnvelope<T> {
  data: T;
}

let bridgeInFlight: Promise<void> | null = null;

async function applySession(session: BridgeSessionPayload): Promise<void> {
  const sb = getShiftOpsSupabase();
  const { error } = await sb.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (error) throw error;
}

async function bridgeViaJobMitraApi(): Promise<void> {
  const user = useAuthStore.getState().user;
  const role = user?.role;
  if (role === "employer" || role === "employee") {
    const actor = getCurrentActorId(role);
    if (actor.legacyId && actor.authUserId) {
      identityBridge.upsert(role, actor.legacyId, actor.authUserId);
    }
  }

  const mitraLabId =
    role === "employer" || role === "employee" ? getCurrentActorId(role).legacyId : undefined;

  const res = await apiService.post<ApiEnvelope<{ session: BridgeSessionPayload }>>(
    `${AUTH_API_PREFIX}/supabase-bridge`,
    mitraLabId ? { mitraLabId } : {},
  );
  await applySession(res.data.session);
}

/**
 * Local/dev fallback when cookie auth backend is off.
 * Prefer anonymous Supabase auth when enabled on the project; else optional env password user.
 */
async function bridgeDevFallback(): Promise<void> {
  const sb = getShiftOpsSupabase();

  const { data: anonData, error: anonErr } = await sb.auth.signInAnonymously();
  if (!anonErr && anonData.session) return;

  const email = import.meta.env.VITE_SHIFT_OPS_DEV_EMAIL as string | undefined;
  const password = import.meta.env.VITE_SHIFT_OPS_DEV_PASSWORD as string | undefined;
  if (email && password) {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return;
  }

  throw new Error(
    anonErr?.message ??
      "Shift Ops auth bridge unavailable. Enable VITE_AUTH_BACKEND_ENABLED + API supabase-bridge, or set VITE_SHIFT_OPS_DEV_EMAIL/PASSWORD, or enable Anonymous sign-ins.",
  );
}

/** Ensure Supabase Auth session exists so shift_ops RPCs see auth.uid(). */
export async function ensureShiftOpsAuthSession(): Promise<void> {
  if (!isShiftOpsSupabaseConfigured()) {
    throw new Error(
      "Shift Ops Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  const sb = getShiftOpsSupabase();
  const { data } = await sb.auth.getSession();
  if (data.session?.access_token) return;

  if (bridgeInFlight) {
    await bridgeInFlight;
    return;
  }

  bridgeInFlight = (async () => {
    if (AUTH_BACKEND_ENABLED) {
      await bridgeViaJobMitraApi();
    } else {
      await bridgeDevFallback();
    }
  })();

  try {
    await bridgeInFlight;
  } finally {
    bridgeInFlight = null;
  }
}

export async function clearShiftOpsAuthSession(): Promise<void> {
  if (!isShiftOpsSupabaseConfigured()) return;
  try {
    const sb = getShiftOpsSupabase();
    await sb.auth.signOut();
  } catch {
    /* demo-safe */
  }
}
