/** Job Mitra | AccountMenuSheet.types.ts */

export type AccountMenuRole = "employee" | "employer";

export type AccountMenuSheetProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly currentRole: AccountMenuRole;
  readonly userName: string;
  readonly uniqueId?: string;
  /** Base64 or URL photo for the avatar. Falls back to initials if absent. */
  readonly userPhoto?: string;
  /** Navigates to /employee/profile or /employer/profile */
  readonly onOpenProfile: () => void;
  /** Navigates to /employee/settings or /employer/settings */
  readonly onOpenSettings: () => void;
  /** Gig Projects / Agency planner entry */
  readonly onOpenGigProjects?: () => void;
  /** Phase 2 — Workforce Ops (dev only) */
  readonly onOpenWorkforce?: () => void;
  /** Phase 2 — HR Management (employer, dev only) */
  readonly onOpenHrManagement?: () => void;
  /** Phase 2 — Manager Console (employer, dev only) */
  readonly onOpenManagerConsole?: () => void;
  readonly onSwitchRole?: () => void;
  readonly onLogout: () => void;
};

export type AccountMenuSheetInnerProps = Omit<AccountMenuSheetProps, "open">;
