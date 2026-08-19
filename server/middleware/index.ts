export { requireAuth, getRequestId } from "./requireAuth.js";
export {
  requireRole,
  requireEmployeeRole,
  requireEmployerRole,
  requireAdminRole,
} from "./requireRole.js";
export {
  roleGate,
  roleGateEmployee,
  roleGateEmployer,
  roleGateAdmin,
  normalizeRoleGateAlias,
  resolveAllowedRoles,
} from "./roleGate.js";
export type { RoleGateAlias, RoleGateOptions } from "./roleGate.js";
export { requireVaultSession } from "./requireVaultSession.js";
export { applySecurityHeaders } from "./securityHeaders.js";
export {
  applyRateLimiter,
  applyApiRateLimit,
  classifyRateLimitPath,
  isAuthSensitiveRoute,
  AUTH_IP_MAX_PER_MINUTE,
  AUTH_SESSION_MAX_PER_MINUTE,
} from "./rateLimiter.js";
export type { RateLimitClass, RateLimitResult } from "./rateLimiter.js";
export { applyChaosInjection } from "./rateLimitChaos.js";
export { validateRequest, sendSchemaValidationError } from "./validateRequest.js";
export type {
  ValidateRequestInput,
  ValidateResult,
  ValidationIssue,
} from "./validateRequest.js";
export {
  handleRequestError,
  handleUnhandledDispatchError,
  AppHttpError,
} from "./errorHandler.js";
export type { ErrorHandlerContext } from "./errorHandler.js";
export { resolveClientIp, sanitizeForwardedFor, isTrustProxyEnabled } from "./clientIp.js";
export type { AuthenticatedRequest, RouteHandler } from "./types.js";
