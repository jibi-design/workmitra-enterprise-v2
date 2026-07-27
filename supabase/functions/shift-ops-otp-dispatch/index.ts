/** Job Mitra | shift-ops-otp-dispatch | Phase 1 OTP delivery Edge stub
 *
 * Role: drain shift_ops.otp_delivery_outbox (service_role only).
 * Verify stays in Postgres RPC shift_ops.verify_channel_otp — NOT this function.
 *
 * Auth: Authorization Bearer <SERVICE_ROLE_KEY> OR header x-shift-ops-cron-secret.
 * Never call from browser with service_role. Cron / operator / internal only.
 *
 * Env (Supabase secrets — never commit):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SHIFT_OPS_CRON_SECRET (optional shared secret for cron callers)
 *   SHIFT_OPS_OTP_STUB=1 (default — no Twilio/Resend; marks sent)
 *
 * Deploy (later, after SQL apply): supabase functions deploy shift-ops-otp-dispatch
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type OutboxRow = {
  id: string;
  challenge_id: string;
  channel_id: string;
  kind: string;
  delivery_ciphertext: string | null;
};

type DecryptBundle = {
  otp?: string;
  destination?: string;
  kind?: string;
  destination_mask?: string;
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-shift-ops-cron-secret",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function authorized(req: Request): boolean {
  const cronSecret = Deno.env.get("SHIFT_OPS_CRON_SECRET");
  const headerSecret = req.headers.get("x-shift-ops-cron-secret");
  if (cronSecret && headerSecret && headerSecret === cronSecret) return true;

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const auth = req.headers.get("Authorization") ?? "";
  if (serviceKey && auth === `Bearer ${serviceKey}`) return true;

  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  if (!authorized(req)) {
    return json(401, { ok: false, error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json(500, { ok: false, error: "missing_supabase_env" });
  }

  const stubMode = (Deno.env.get("SHIFT_OPS_OTP_STUB") ?? "1") !== "0";
  const limitRaw = Number(new URL(req.url).searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "shift_ops" },
  });

  const { data: queued, error: qErr } = await sb
    .from("otp_delivery_outbox")
    .select("id, challenge_id, channel_id, kind, delivery_ciphertext")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (qErr) {
    return json(500, { ok: false, error: "outbox_query_failed", detail: qErr.message });
  }

  const rows = (queued ?? []) as OutboxRow[];
  let sent = 0;
  let failed = 0;
  const results: Array<{ id: string; status: string; note?: string }> = [];

  for (const row of rows) {
    const { error: claimErr } = await sb
      .from("otp_delivery_outbox")
      .update({ status: "sending" })
      .eq("id", row.id)
      .eq("status", "queued");

    if (claimErr) {
      failed += 1;
      results.push({ id: row.id, status: "failed", note: claimErr.message });
      continue;
    }

    try {
      if (!row.delivery_ciphertext) {
        throw new Error("missing_delivery_ciphertext");
      }

      const { data: decrypted, error: decErr } = await sb.rpc("otp_dispatch_decrypt_bundle", {
        p_outbox_id: row.id,
      });

      if (decErr) {
        if (!stubMode) throw new Error(decErr.message);
        // Pre-SQL / local dry-run: allow stub to clear queue without providers.
        console.info(
          JSON.stringify({
            event: "shift_ops_otp_stub_skip_decrypt",
            outbox_id: row.id,
            kind: row.kind,
            channel_id: row.channel_id,
            note: "SQL not applied or RPC missing; stub marks sent without provider",
          }),
        );
      } else {
        const payload = decrypted as DecryptBundle;
        // Never log otp or raw destination.
        console.info(
          JSON.stringify({
            event: stubMode ? "shift_ops_otp_stub_send" : "shift_ops_otp_provider_pending",
            outbox_id: row.id,
            kind: row.kind,
            destination_mask: payload?.destination_mask ?? "n/a",
            note: stubMode
              ? "Provider not wired — OTP not transmitted"
              : "Wire Twilio/Resend before SHIFT_OPS_OTP_STUB=0",
          }),
        );

        if (!stubMode) {
          // Future: send payload.otp to payload.destination via provider.
          throw new Error("provider_not_configured");
        }
      }

      const { error: doneErr } = await sb
        .from("otp_delivery_outbox")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          delivery_ciphertext: null,
          last_error: null,
        })
        .eq("id", row.id);

      if (doneErr) throw new Error(doneErr.message);

      sent += 1;
      results.push({ id: row.id, status: "sent", note: stubMode ? "stub" : "provider" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "dispatch_failed";
      await sb
        .from("otp_delivery_outbox")
        .update({ status: "failed", last_error: message.slice(0, 500) })
        .eq("id", row.id);
      failed += 1;
      results.push({ id: row.id, status: "failed", note: message });
    }
  }

  return json(200, {
    ok: true,
    stub: stubMode,
    claimed: rows.length,
    sent,
    failed,
    results,
  });
});
