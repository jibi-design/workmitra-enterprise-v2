/**
 * Emergency kill-switch — drop public/user-facing Job Mitra APIs into 503
 * while Super-Admin ops + health remain reachable.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { getRuntimeFlags } from "../modules/ops/runtimeFlags.service.js";

const ALLOWLIST_PREFIXES = [
  "/v1/jobmitra/health",
  "/v1/jobmitra/ops/",
] as const;

/** Paths that must stay up for stuck-session recovery during maintenance. */
const ALLOWLIST_EXACT = new Set([
  "/v1/jobmitra/auth/logout",
  "/v1/jobmitra/auth/csrf",
  "/v1/jobmitra/auth/me",
]);

export function isOpsMaintenanceAllowlisted(pathname: string): boolean {
  if (ALLOWLIST_EXACT.has(pathname)) return true;
  for (const p of ALLOWLIST_PREFIXES) {
    if (pathname === p || pathname.startsWith(p)) return true;
  }
  return false;
}

/**
 * When maintenanceMode or lockdown is ON, block product APIs with 503.
 * Returns true if the response was written (caller must stop).
 */
export async function enforceOpsMaintenanceGate(
  _req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<boolean> {
  if (isOpsMaintenanceAllowlisted(pathname)) return false;

  const flags = await getRuntimeFlags();
  if (!flags.maintenanceMode && !flags.lockdown) return false;

  const code = flags.lockdown ? "PLATFORM_LOCKDOWN" : "PLATFORM_MAINTENANCE";
  const message = flags.lockdown
    ? "Platform is in lockdown. Public APIs are unavailable. Super-Admin ops remain active."
    : "Platform is in emergency maintenance. Public APIs return 503. Super-Admin ops remain active.";

  res.statusCode = 503;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Retry-After", "120");
  res.setHeader("Cache-Control", "no-store");
  res.end(
    JSON.stringify({
      ok: false,
      error: {
        code,
        message,
        maintenanceMode: flags.maintenanceMode,
        lockdown: flags.lockdown,
      },
    }),
  );
  return true;
}
