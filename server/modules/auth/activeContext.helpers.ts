/** Dual-context helpers — enrich AuthUser from session activeMode/org. */

import type { ActiveMode, AuthUser, UserRole, WorkspaceEntitlement } from "./types.js";

export function isActiveMode(value: unknown): value is ActiveMode {
  return value === "employee" || value === "employer";
}

/** Demo / Phase 2: non-admin accounts may use both workspaces when verified. */
export function defaultEntitlementsForRole(role: UserRole): WorkspaceEntitlement[] {
  if (role === "admin") return [];
  return [
    { mode: "employee", status: "verified" },
    { mode: "employer", status: "verified" },
  ];
}

export function initialActiveMode(role: UserRole): ActiveMode | null {
  if (role === "employee" || role === "employer") return role;
  return null;
}

export function applySessionContext(
  base: Omit<AuthUser, "activeMode" | "activeOrgId" | "entitlements"> & {
    entitlements?: readonly WorkspaceEntitlement[];
  },
  context: { activeMode: ActiveMode | null; activeOrgId: string | null },
): AuthUser {
  const entitlements = base.entitlements ?? defaultEntitlementsForRole(base.role);
  let activeMode = context.activeMode;
  if (!activeMode) {
    activeMode = initialActiveMode(base.role);
  }
  // Admin stays admin; activeMode stays null.
  if (base.role === "admin") {
    return {
      ...base,
      role: "admin",
      activeMode: null,
      activeOrgId: null,
      entitlements: [],
    };
  }
  const role: UserRole = activeMode ?? base.role;
  return {
    id: base.id,
    fullName: base.fullName,
    email: base.email,
    role,
    activeMode,
    activeOrgId: activeMode === "employer" ? context.activeOrgId : null,
    entitlements: [...entitlements],
  };
}

export function hasVerifiedEntitlement(
  user: Pick<AuthUser, "entitlements">,
  mode: ActiveMode,
): boolean {
  return user.entitlements.some((e) => e.mode === mode && e.status === "verified");
}
