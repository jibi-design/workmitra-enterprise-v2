export type UserRole = "employee" | "employer" | "admin";

/** Active product surface — never admin (admin uses role only). */
export type ActiveMode = "employee" | "employer";

export type WorkspaceEntitlementStatus = "pending" | "verified" | "suspended" | "deactivated";

export type WorkspaceEntitlement = {
  readonly mode: ActiveMode;
  readonly status: WorkspaceEntitlementStatus;
};

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  /**
   * Transition contract: for employee/employer, equals activeMode.
   * Admin keeps role "admin" with activeMode null.
   */
  role: UserRole;
  activeMode: ActiveMode | null;
  activeOrgId: string | null;
  entitlements: readonly WorkspaceEntitlement[];
}

export interface SessionRecord {
  userId: string;
  createdAt: number;
  expiresAt: number;
  /** Dual-context — defaults to primary role on login. */
  activeMode: ActiveMode | null;
  activeOrgId: string | null;
}
