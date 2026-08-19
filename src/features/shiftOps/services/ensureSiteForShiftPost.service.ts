/**
 * Job Mitra | ensureSiteForShiftPost.service.ts
 * Idempotent Shift Ops site for a Shift Jobs post (first confirm / invite).
 */

import { isShiftServerUuid, shiftPostIdBridge } from "../../shift/utils/shiftIdBridge";
import {
  getShiftOpsSupabase,
  isShiftOpsSupabaseConfigured,
} from "../lib/supabaseClient";
import { ensureShiftOpsAuthSession } from "./authBridge.service";
import { isSoSiteUuid } from "./membershipBridge.service";
import { resolveShiftOpsSiteIdForPost } from "../../shared/shiftOps/resolveShiftOpsSiteId";

export type EnsureSiteForShiftPostInput = {
  postId: string;
  displayName: string;
  existingSiteId?: string | null;
  planId?: string | null;
  persistSiteId?: (siteId: string) => void;
};

export type EnsureSiteForShiftPostResult =
  | { ok: true; siteId: string; source: "existing" | "remote" | "local" }
  | { ok: false; code: string; message: string };

function canonicalPostKey(postId: string): string {
  const local = postId.trim();
  const server = shiftPostIdBridge.resolveServerId(local);
  if (server && isShiftServerUuid(server)) return server;
  return local;
}

function mintLocalSiteId(): string {
  return crypto.randomUUID();
}

function isMissingRpc(error: { code?: string; message?: string } | null): boolean {
  const code = error?.code ?? "";
  const message = (error?.message ?? "").toLowerCase();
  return (
    code === "PGRST202" ||
    code === "42883" ||
    message.includes("ensure_site_for_shift_post")
  );
}

async function insertSiteFallback(displayName: string): Promise<EnsureSiteForShiftPostResult> {
  const sb = getShiftOpsSupabase();
  const { data: soUserId, error: userError } = await sb.rpc("ensure_so_user", {
    p_role: "worker",
  });
  if (userError || typeof soUserId !== "string" || !soUserId.trim()) {
    return {
      ok: false,
      code: userError?.code || "SO_USER_FAILED",
      message: userError?.message || "Unable to ensure Shift Ops user.",
    };
  }

  const { data, error } = await sb
    .from("sites")
    .insert({ name: displayName, manager_user_id: soUserId })
    .select("id")
    .single();

  const siteId = typeof data?.id === "string" ? data.id.trim() : "";
  if (error || !isSoSiteUuid(siteId)) {
    return {
      ok: false,
      code: error?.code || "SITE_INSERT_FAILED",
      message: error?.message || "Unable to create Shift Ops group.",
    };
  }
  return { ok: true, siteId, source: "remote" };
}

async function ensureRemoteSite(
  postKey: string,
  displayName: string,
): Promise<EnsureSiteForShiftPostResult> {
  try {
    await ensureShiftOpsAuthSession();
  } catch (err) {
    return {
      ok: false,
      code: "AUTH_BRIDGE_FAILED",
      message: err instanceof Error ? err.message : "Shift Ops auth bridge failed",
    };
  }

  const sb = getShiftOpsSupabase();
  const { data, error } = await sb.rpc("ensure_site_for_shift_post", {
    p_job_post_id: postKey,
    p_display_name: displayName,
  });

  if (!error) {
    const siteId = typeof data === "string" ? data.trim() : String(data ?? "").trim();
    if (isSoSiteUuid(siteId)) return { ok: true, siteId, source: "remote" };
    return { ok: false, code: "INVALID_RPC_RESULT", message: "RPC did not return a site id." };
  }

  if (!isMissingRpc(error)) {
    return {
      ok: false,
      code: error.code || "RPC_FAILED",
      message: error.message || "ensure_site_for_shift_post failed",
    };
  }

  if (import.meta.env.PROD) {
    return {
      ok: false,
      code: "RPC_MISSING",
      message: "ensure_site_for_shift_post is required in production.",
    };
  }

  return insertSiteFallback(displayName);
}

export async function ensureShiftOpsSiteForPost(
  input: EnsureSiteForShiftPostInput,
): Promise<EnsureSiteForShiftPostResult> {
  const existing = resolveShiftOpsSiteIdForPost({
    siteId: input.existingSiteId,
    planId: input.planId,
  });
  if (existing) {
    input.persistSiteId?.(existing);
    return { ok: true, siteId: existing, source: "existing" };
  }

  const displayName = input.displayName.trim() || "Shift Ops group";
  const postKey = canonicalPostKey(input.postId);

  if (import.meta.env.PROD) {
    if (!isShiftOpsSupabaseConfigured()) {
      return {
        ok: false,
        code: "SHIFT_OPS_NOT_CONFIGURED",
        message: "Shift Ops RPC is required in production.",
      };
    }
    const remote = await ensureRemoteSite(postKey, displayName);
    if (remote.ok) input.persistSiteId?.(remote.siteId);
    return remote;
  }

  if (!isShiftOpsSupabaseConfigured()) {
    const localId = mintLocalSiteId();
    input.persistSiteId?.(localId);
    return { ok: true, siteId: localId, source: "local" };
  }

  const localFallback = {
    ok: true as const,
    siteId: mintLocalSiteId(),
    source: "local" as const,
  };
  const created = await Promise.race([
    ensureRemoteSite(postKey, displayName),
    new Promise<EnsureSiteForShiftPostResult>((resolve) => {
      window.setTimeout(() => resolve(localFallback), 2_500);
    }),
  ]);

  if (created.ok) {
    input.persistSiteId?.(created.siteId);
    return created.source ? created : { ok: true, siteId: created.siteId, source: "remote" };
  }

  const localId = mintLocalSiteId();
  input.persistSiteId?.(localId);
  return { ok: true, siteId: localId, source: "local" };
}
