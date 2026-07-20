import type { ServerResponse } from "node:http";
import type { UserRole } from "../modules/auth/types.js";
import type { AuthenticatedRequest, RouteHandler } from "./types.js";

function sendForbidden(res: ServerResponse, requestId: string, requiredRole: UserRole): void {
  res.statusCode = 403;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: {
        code: "FORBIDDEN",
        message: `This action requires the '${requiredRole}' role`,
        requestId,
      },
    }),
  );
}

/**
 * requireRole — role-based access control gate.
 *
 * Must be called AFTER requireAuth has attached authenticatedUser to the request.
 * Compares the session-derived role against the required role for the endpoint.
 *
 * The role is NEVER read from client input — it comes only from the authenticated
 * session resolved by requireAuth.
 *
 * Employee and Employer endpoints must use separate requireRole('employee') and
 * requireRole('employer') guards respectively. They must never share a handler
 * without explicit role separation.
 *
 * Usage:
 *   await requireRole('employer', req, res, requestId, async (authedReq) => {
 *     // only employers reach here
 *   }, url);
 */
export async function requireRole(
  role: UserRole,
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  if (req.authenticatedUser.role !== role) {
    sendForbidden(res, requestId, role);
    return;
  }
  await next(req, res, url);
}

/**
 * requireEmployeeRole — convenience wrapper for employee-only endpoints.
 */
export async function requireEmployeeRole(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  return requireRole("employee", req, res, requestId, next, url);
}

/**
 * requireEmployerRole — convenience wrapper for employer-only endpoints.
 */
export async function requireEmployerRole(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  return requireRole("employer", req, res, requestId, next, url);
}

/**
 * requireAdminRole — convenience wrapper for admin-only endpoints.
 * Admin routes must never be accessible through employee or employer flows.
 */
export async function requireAdminRole(
  req: AuthenticatedRequest,
  res: ServerResponse,
  requestId: string,
  next: RouteHandler,
  url: URL,
): Promise<void> {
  return requireRole("admin", req, res, requestId, next, url);
}
