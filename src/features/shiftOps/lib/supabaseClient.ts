/** Job Mitra | shiftOps/lib/supabaseClient.ts | Phase 0 — browser anon client only */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Schema is shift_ops; loosen generic so createClient typing accepts non-public schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: SupabaseClient<any, "shift_ops", any> | null = null;

export function isShiftOpsSupabaseConfigured(): boolean {
  return Boolean(url && anonKey && !url.includes("YOUR_PROJECT"));
}

/**
 * Anon/authenticated browser client. Never use service_role in the frontend.
 * Call ensureShiftOpsAuthSession() before RPCs that need auth.uid().
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getShiftOpsSupabase(): SupabaseClient<any, "shift_ops", any> {
  if (!isShiftOpsSupabaseConfigured()) {
    throw new Error(
      "Shift Ops Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "wm-shift-ops-auth",
      },
      db: {
        schema: "shift_ops",
      },
    });
  }
  return client;
}
