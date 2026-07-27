/** Job Mitra | shiftOps/helpers/groupJoinErrors.ts | Map RPC codes → worker/manager copy (GJ-4) */

export type GroupJoinErrorCode =
  | "daily_otp_invalid"
  | "daily_otp_missing"
  | "group_link_invalid"
  | "invite_invalid"
  | "group_deleted"
  | "group_inactive"
  | "dual_verification_required"
  | "not_authenticated"
  | "not_site_manager"
  | "bridge_not_configured"
  | "unknown";

export type GroupJoinErrorInfo = {
  code: GroupJoinErrorCode;
  /** Short headline for empty/error panel */
  title: string;
  /** Body copy */
  message: string;
  /** Terminal = show full fallback panel (cannot continue with same inputs) */
  terminal: boolean;
};

function detectCode(raw: string): GroupJoinErrorCode {
  const message = raw.toLowerCase();
  if (message.includes("daily_otp_invalid")) return "daily_otp_invalid";
  if (message.includes("daily_otp_missing")) return "daily_otp_missing";
  if (message.includes("group_link_invalid")) return "group_link_invalid";
  if (message.includes("invite_invalid")) return "invite_invalid";
  if (message.includes("group_deleted")) return "group_deleted";
  if (message.includes("group_inactive")) return "group_inactive";
  if (message.includes("dual_verification_required")) return "dual_verification_required";
  if (message.includes("not_authenticated")) return "not_authenticated";
  if (message.includes("not_site_manager")) return "not_site_manager";
  if (
    message.includes("bridge_not_configured") ||
    message.includes("auth bridge") ||
    message.includes("supabase-bridge")
  ) {
    return "bridge_not_configured";
  }
  return "unknown";
}

const COPY: Record<GroupJoinErrorCode, Omit<GroupJoinErrorInfo, "code">> = {
  daily_otp_invalid: {
    title: "Wrong daily code",
    message: "That daily code is wrong. Ask your manager for today’s Active Daily OTP.",
    terminal: false,
  },
  daily_otp_missing: {
    title: "No code for today",
    message: "No Active Daily OTP for today yet. Ask your manager to mint today’s code.",
    terminal: false,
  },
  group_link_invalid: {
    title: "Link no longer valid",
    message: "This group link or QR is invalid or was rotated. Ask your manager for a new link.",
    terminal: true,
  },
  invite_invalid: {
    title: "Invite expired",
    message:
      "This invite token is invalid or expired. Ask for a fresh invite or static group link.",
    terminal: true,
  },
  group_deleted: {
    title: "Group deleted",
    message: "This group no longer exists. Contact your manager.",
    terminal: true,
  },
  group_inactive: {
    title: "Group inactive",
    message: "This group is inactive. Contact your manager before trying again.",
    terminal: true,
  },
  dual_verification_required: {
    title: "Verify channels first",
    message: "Complete work mobile + work email verification in your Profile, then return here.",
    terminal: false,
  },
  not_authenticated: {
    title: "Sign in required",
    message: "Sign in to continue. After login you will return to this group join screen.",
    terminal: false,
  },
  not_site_manager: {
    title: "Manager access only",
    message: "Only the site manager can mint daily OTPs or manage this group link.",
    terminal: true,
  },
  bridge_not_configured: {
    title: "Auth bridge not ready",
    message: "Shift Ops bridge is not configured on the server. Contact your site administrator.",
    terminal: true,
  },
  unknown: {
    title: "Something went wrong",
    message: "Join failed. Check your link and daily code, then try again.",
    terminal: false,
  },
};

export function classifyGroupJoinError(raw: string): GroupJoinErrorInfo {
  const code = detectCode(raw);
  const base = COPY[code];
  if (code === "unknown" && raw.trim()) {
    return { code, title: base.title, message: raw.trim(), terminal: false };
  }
  return { code, ...base };
}

export function mapGroupJoinError(raw: string): string {
  return classifyGroupJoinError(raw).message;
}

export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: string }).message);
  }
  return "Request failed";
}
