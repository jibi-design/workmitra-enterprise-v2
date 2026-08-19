/**
 * requireRole — thin wrappers over WAVE-5.1 roleGate.
 * Prefer importing roleGate / roleGateEmployee / roleGateEmployer / roleGateAdmin
 * for new code. These exports stay for existing route modules.
 */

import type { ServerResponse } from "node:http";
import type { UserRole } from "../modules/auth/types.js";
import type { AuthenticatedRequest, RouteHandler } from "./types.js";
import { roleGate } from "./roleGate.js";

/**
 * requireRole — single-role gate (session role only; no activeMode check).
 * Employee/employer path shells should prefer roleGateEmployee / roleGateEmployer
 * when dual-context enforcement is required.
 */
export async function requireRole(
  role: UserRole,
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  return roleGate({ allowed: [role] }, req, res, requestId, next, url);
}

export async function requireEmployeeRole(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  return roleGate({ allowed: ["employee"] }, req, res, requestId, next, url);
}

export async function requireEmployerRole(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  return roleGate({ allowed: ["employer"] }, req, res, requestId, next, url);
}

export async function requireAdminRole(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  return roleGate({ allowed: ["admin"] }, req, res, requestId, next, url);
}
