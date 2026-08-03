/**
 * P1 Trust Foundation — Board platform role names ↔ Job Mitra cookie-session roles.
 *
 * DB CHECK and requireRole() keep using: employee | employer | admin
 * Do NOT rename auth_user_roles. Super Admin app uses master_admin (separate plane).
 *
 * Board triad (conceptual) → Job Mitra:
 *   User            → employee | employer (product workspace)
 *   TenantAdmin-like → admin (tenant-scoped product admin inside JM)
 *   SuperAdmin      → Super Admin BFF master_admin (NOT this cookie plane)
 */

import type { UserRole } from "./types.js";

/** Board-facing labels — documentation / tests only. */
export type BoardPlatformRole = "SuperAdmin" | "TenantAdmin" | "User";

/**
 * Map a Job Mitra session role to the closest Board platform label.
 * SuperAdmin is never returned from JM roles — that lives in Super Admin BFF.
 */
export function boardRoleForJobMitraRole(role: UserRole): Exclude<BoardPlatformRole, "SuperAdmin"> {
  if (role === "admin") return "TenantAdmin";
  return "User";
}

/**
 * Job Mitra roles that satisfy a Board "User" product actor.
 */
export function jobMitraRolesForBoardUser(): ReadonlyArray<
  Extract<UserRole, "employee" | "employer">
> {
  return ["employee", "employer"];
}

/**
 * True when the JM role is the tenant-scoped product admin (Board TenantAdmin-like).
 */
export function isJobMitraTenantAdminLike(role: UserRole): boolean {
  return role === "admin";
}

/**
 * Human-readable map for ops / Red Team packets.
 */
export const PLATFORM_ROLE_MAP_PLAIN = {
  User: "Job Mitra roles employee | employer (cookie wm_session)",
  TenantAdmin: "Job Mitra role admin — tenant-scoped product admin; not Super Admin break-glass",
  SuperAdmin:
    "Super Admin app role master_admin — Owner HITL / platform ops; out of JM cookie plane",
} as const;
