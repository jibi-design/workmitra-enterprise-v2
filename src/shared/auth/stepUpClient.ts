/**
 * Client helper — step-up challenge for high-risk admin actions.
 */

import { APP_CONFIG } from "../utils/appConfig";

function apiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv && fromEnv.trim()) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:3001";
  return APP_CONFIG.api.baseUrl.replace(/\/$/, "");
}

export type StepUpPurpose =
  | "ops_flags_emergency"
  | "bulk_user_delete"
  | "database_backup_export"
  | "admin_privilege_update"
  | "privileged_admin_action";

export type StepUpResult = {
  ok: boolean;
  stepUpToken?: string;
  expiresAtIso?: string;
  purpose?: string;
  error?: string;
};

export async function requestStepUpChallenge(input: {
  password: string;
  purpose: StepUpPurpose;
  csrfToken?: string | null;
}): Promise<StepUpResult> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (input.csrfToken) headers["X-CSRF-Token"] = input.csrfToken;
    const res = await fetch(`${apiBase()}/v1/jobmitra/auth/step-up`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({
        password: input.password,
        purpose: input.purpose,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      data?: { stepUpToken?: string; expiresAtIso?: string; purpose?: string };
      stepUpToken?: string;
      expiresAtIso?: string;
      purpose?: string;
      error?: { message?: string; code?: string };
    };
    if (!res.ok) {
      return {
        ok: false,
        error: body.error?.message || body.error?.code || `HTTP ${res.status}`,
      };
    }
    const token = body.data?.stepUpToken || body.stepUpToken;
    return {
      ok: Boolean(token),
      stepUpToken: token,
      expiresAtIso: body.data?.expiresAtIso || body.expiresAtIso,
      purpose: body.data?.purpose || body.purpose,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "step_up_failed",
    };
  }
}
