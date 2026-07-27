/** Job Mitra | shiftOps/types.ts | Phase 0–1 types (Shift Ops greenfield) */

export type SoRole = "worker" | "manager" | "admin";

export type SoChannelKind = "work_mobile" | "work_email";

export type SoChannelStatus = "pending" | "verified" | "revoked" | "recycled";

export type SoMembershipStatus =
  "pending_manager_approval" | "ready_for_assignment" | "rejected" | "revoked";

export type SoPostApprovalRoute = "accept_decline" | "ready_state";

export type SoAssignmentStatus =
  "pending_accept" | "accepted" | "declined" | "expired" | "cancelled";

export type ChannelsSafeRow = {
  id: string;
  user_id: string;
  kind: SoChannelKind;
  status: SoChannelStatus;
  is_primary: boolean;
  mask_hint: string;
  shared_device: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteMembershipRow = {
  id: string;
  site_id: string;
  worker_user_id: string;
  invite_id: string | null;
  status: SoMembershipStatus;
  decided_by: string | null;
  decided_at: string | null;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
  /** Operational zone within/across groups (migration 202607260004). */
  assignment_zone?: string;
  /** Operational crew role e.g. Staff / Team Supervisor. */
  crew_role?: string;
  /** Optional Mitra Lab id for privacy-safe CallButton routing. */
  jobmitra_ml_id?: string | null;
  last_reassign_note?: string | null;
  last_reassigned_at?: string | null;
};

/** Manager active roster row (list_active_group_roster RPC / overlay). */
export type ActiveGroupRosterRow = {
  membership_id: string;
  site_id: string;
  site_name: string;
  worker_user_id: string;
  display_name: string;
  status: SoMembershipStatus;
  assignment_zone: string;
  crew_role: string;
  jobmitra_ml_id: string | null;
  last_reassign_note: string | null;
  last_reassigned_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReassignWorkerResult = {
  ok: true;
  membership_id: string;
  site_id: string;
  site_name: string;
  worker_user_id: string;
  status: SoMembershipStatus;
  assignment_zone: string;
  crew_role: string;
  jobmitra_ml_id: string | null;
  last_reassign_note: string | null;
  last_reassigned_at: string | null;
};

export type PendingShiftAssignmentRow = {
  id: string;
  site_id: string;
  worker_user_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: SoAssignmentStatus;
  created_at: string;
  updated_at: string;
};

export type PostApprovalRouteResult = {
  route: SoPostApprovalRoute;
  pending_assignment_id: string | null;
  membership_status: SoMembershipStatus;
};

export type SiteRow = {
  id: string;
  name: string;
  manager_user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Group ID = site id (operational group/site). */
export type GroupId = string;

export type StaticLinkEnsureResult = {
  link_id: string;
  group_id: GroupId;
  raw_token: string | null;
  created_new: boolean;
};

export type DailyOtpRotateResult = {
  group_id: GroupId;
  otp_day: string;
  daily_otp: string;
};

export type DailyOtpStatusResult = {
  group_id: GroupId;
  otp_day: string;
  has_active_otp: boolean;
};

export type GroupPeekResult = {
  group_id: GroupId;
  group_name: string;
  is_active: boolean;
};
