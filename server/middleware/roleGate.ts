/**
 * WAVE-5.1 Layer 2 — Role Gate (RBAC).
 *
 * Raw Node HTTP middleware (this stack is not Express). Must run AFTER requireAuth.
 * Role is taken ONLY from the authenticated session — never from client body/headers.
 *
 * Canonical Job Mitra roles: employee | employer | admin
 * External aliases (prompt vocabulary only):
 *   Candidate → employee
 *   Employer  → employer
 *   Admin     → admin
 */

import type { ServerResponse } from "node:http";
import type { UserRole } from "../modules/auth/types.js";
import { logSecurityEvent } from "../observability/securityEvents.js";
import { writeAuditLog } from "../observability/auditLogger.js";
import type { AuthenticatedRequest, RouteHandler } from "./types.js";

/** Prompt / board aliases accepted by the gate; never stored as DB roles. */
export type RoleGateAlias = "Candidate" | "Employer" | "Admin" | "employee" | "employer" | "admin";

export type RoleGateOptions = {
  /** One or more allowed canonical roles (any-of). */
  readonly allowed: readonly UserRole[];
  /** Optional dual-context check: session activeMode must match when role is EE/ER. */
  readonly requireActiveMode?: "employee" | "employer";
};

function sendForbidden(
  res: ServerResponse,
  requestId: string,
  allowed: readonly UserRole[],
): void {
  res.statusCode = 403;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: {
        code: "FORBIDDEN",
        message:
          allowed.length === 1
            ? `This action requires the '${allowed[0]}' role`
            : `This action requires one of: ${allowed.join(", ")}`,
        requestId,
      },
    }),
  );
}

/**
 * Normalize prompt aliases to Job Mitra UserRole.
 * Unknown strings return null (fail closed).
 */
export function normalizeRoleGateAlias(raw: string): UserRole | null {
  const key = raw.trim().toLowerCase();
  if (key === "candidate" || key === "employee") return "employee";
  if (key === "employer") return "employer";
  if (key === "admin") return "admin";
  return null;
}

/**
 * Map a list of aliases/roles to unique canonical UserRole values.
 */
export function resolveAllowedRoles(input: readonly RoleGateAlias[]): UserRole[] {
  const out: UserRole[] = [];
  for (const item of input) {
    const role = normalizeRoleGateAlias(item);
    if (role && !out.includes(role)) out.push(role);
  }
  return out;
}

/**
 * roleGate — WAVE-5.1 RBAC gate for authenticated API handlers.
 *
 * Usage:
 *   await requireAuth(req, res, requestId, async (authed, res, url) => {
 *     await roleGate({ allowed: ["employer"] }, authed, res, requestId, handler, url);
 *   }, url);
 */
export async function roleGate(
  options: RoleGateOptions,
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  const allowed = options.allowed;
  if (allowed.length === 0) {
    sendForbidden(res, requestId, allowed);
    return;
  }

  const sessionRole = req.authenticatedUser.role;
  if (!allowed.includes(sessionRole)) {
    logSecurityEvent({
      event: "RBAC_DENIED",
      path: url.pathname,
      method: req.method,
      httpStatus: 403,
      meta: {
        required: allowed,
        actual: sessionRole,
        requestId,
      },
    });
    writeAuditLog({
      action: "rbac_denied",
      requestId,
      userId: req.authenticatedUser.id,
      path: url.pathname,
      method: req.method,
      httpStatus: 403,
      metadata: { required: allowed, actual: sessionRole },
    });
    sendForbidden(res, requestId, allowed);
    return;
  }

  if (options.requireActiveMode) {
    const active = req.authenticatedUser.activeMode;
    if (active !== options.requireActiveMode) {
      logSecurityEvent({
        event: "RBAC_DENIED",
        path: url.pathname,
        method: req.method,
        httpStatus: 403,
        meta: {
          reason: "active_mode_mismatch",
          requiredMode: options.requireActiveMode,
          actualMode: active,
          requestId,
        },
      });
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: {
            code: "FORBIDDEN",
            message: `This action requires activeMode '${options.requireActiveMode}'`,
            requestId,
          },
        }),
      );
      return;
    }
  }

  await next(req, res, url);
}

/** Convenience: Candidate / employee-only (session role). */
export async function roleGateEmployee(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  return roleGate({ allowed: ["employee"] }, req, res, requestId, next, url);
}

/** Convenience: Employer-only (session role). */
export async function roleGateEmployer(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  return roleGate({ allowed: ["employer"] }, req, res, requestId, next, url);
}

/** Convenience: Admin-only (never shares EE/ER handlers). */
export async function roleGateAdmin(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  return roleGate({ allowed: ["admin"] }, req, res, requestId, next, url);
}
