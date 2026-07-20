/** Job Mitra | AccountMenuHeader.tsx — Premium identity row with initials / photo avatar */

import type { AccountMenuRole } from "./AccountMenuSheet.types";
import {
  AVATAR_BASE_STYLE,
  HEADER_CARD_STYLE,
  NAME_STYLE,
  ROLE_BADGE_BASE,
  SESSION_DOT_STYLE,
} from "./AccountMenuSheet.styles";

type AccountMenuHeaderProps = {
  readonly currentRole: AccountMenuRole;
  readonly userName: string;
  readonly uniqueId?: string;
  readonly userPhoto?: string;
};

/** Derive 1-2 uppercase initials from a display name. */
function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ROLE_META: Record<
  AccountMenuRole,
  {
    label: string;
    avatarBg: string;
    avatarColor: string;
    badgeBg: string;
    badgeColor: string;
    avatarBorder: string;
    sessionDot: string;
    sessionGlow: string;
  }
> = {
  employee: {
    label: "Employee",
    avatarBg: "rgba(16,185,129,0.10)",
    avatarColor: "#059669",
    badgeBg: "#ecfdf5",
    badgeColor: "#047857",
    avatarBorder: "2px solid rgba(16,185,129,0.22)",
    sessionDot: "#10b981",
    sessionGlow: "rgba(16,185,129,0.45)",
  },
  employer: {
    label: "Employer",
    avatarBg: "rgba(124,58,237,0.10)",
    avatarColor: "#7c3aed",
    badgeBg: "#faf5ff",
    badgeColor: "#6d28d9",
    avatarBorder: "2px solid rgba(124,58,237,0.22)",
    sessionDot: "#a855f7",
    sessionGlow: "rgba(168,85,247,0.45)",
  },
};

export function AccountMenuHeader({
  currentRole,
  userName,
  uniqueId,
  userPhoto,
}: AccountMenuHeaderProps) {
  const meta = ROLE_META[currentRole];
  const displayName = userName || meta.label;
  const initials = getInitials(displayName);
  const showWorkerId = currentRole === "employee" && uniqueId;

  return (
    <div style={HEADER_CARD_STYLE}>
      <div
        style={{
          ...AVATAR_BASE_STYLE,
          background: userPhoto ? "transparent" : meta.avatarBg,
          color: meta.avatarColor,
          border: meta.avatarBorder,
          boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        }}
      >
        {userPhoto ? (
          <img
            src={userPhoto}
            alt={displayName}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
          />
        ) : (
          initials
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={NAME_STYLE}>{displayName}</div>

        <div
          style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}
        >
          <span
            style={{
              ...ROLE_BADGE_BASE,
              background: meta.badgeBg,
              color: meta.badgeColor,
            }}
          >
            {meta.label}
          </span>

          {showWorkerId ? (
            <span
              style={{
                fontSize: 10,
                color: "#94a3b8",
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
            >
              ID: {uniqueId}
            </span>
          ) : null}
        </div>
      </div>

      <div
        style={{
          ...SESSION_DOT_STYLE,
          background: meta.sessionDot,
          boxShadow: `0 0 0 3px ${meta.sessionGlow}, 0 0 12px ${meta.sessionGlow}`,
        }}
        aria-hidden="true"
        title="Active session"
      />
    </div>
  );
}
