/**
 * WAVE-5.1 Layer 2 — shared RBAC role helpers (client).
 * Canonical roles match authStore / server: employee | employer | admin.
 * "candidate" is an alias for employee only (never a separate domain slice).
 */

import type { UserRole } from "../store/authStore";

export type RbacRoleAlias = UserRole | "candidate" | "Candidate" | "Employer" | "Admin";

export function normalizeClientRbacRole(raw: string): UserRole | null {
  const key = raw.trim().toLowerCase();
  if (key === "candidate" || key === "employee") return "employee";
  if (key === "employer") return "employer";
  if (key === "admin") return "admin";
  return null;
}

export function resolveClientAllowedRoles(input: readonly RbacRoleAlias[]): UserRole[] {
  const out: UserRole[] = [];
  for (const item of input) {
    const role = normalizeClientRbacRole(String(item));
    if (role && !out.includes(role)) out.push(role);
  }
  return out;
}

export function roleMatchesGate(
  sessionRole: UserRole | null | undefined,
  allowed: readonly UserRole[],
): boolean {
  if (!sessionRole || allowed.length === 0) return false;
  return allowed.includes(sessionRole);
}
