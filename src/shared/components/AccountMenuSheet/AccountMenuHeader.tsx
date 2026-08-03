/** Job Mitra | AccountMenuHeader.tsx — Premium identity row with initials / photo avatar */

import type { AccountMenuRole } from "./AccountMenuSheet.types";

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

export function AccountMenuHeader({
  currentRole,
  userName,
  uniqueId,
  userPhoto,
}: AccountMenuHeaderProps) {
  const label = currentRole === "employer" ? "Employer" : "Employee";
  const displayName = userName || label;
  const initials = getInitials(displayName);
  const showWorkerId = currentRole === "employee" && uniqueId;
  const roleMod = currentRole === "employer" ? "employer" : "employee";

  return (
    <div className="wm-accountSheet__header">
      <div
        className={[
          "wm-accountSheet__avatar",
          `wm-accountSheet__avatar--${roleMod}`,
          userPhoto ? "wm-accountSheet__avatar--photo" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {userPhoto ? <img src={userPhoto} alt={displayName} /> : initials}
      </div>

      <div className="wm-accountSheet__identity">
        <div className="wm-accountSheet__name">{displayName}</div>

        <div className="wm-accountSheet__metaRow">
          <span className={`wm-accountSheet__roleBadge wm-accountSheet__roleBadge--${roleMod}`}>
            {label}
          </span>

          {showWorkerId ? <span className="wm-accountSheet__workerId">ID: {uniqueId}</span> : null}
        </div>
      </div>

      <div
        className={`wm-accountSheet__sessionDot wm-accountSheet__sessionDot--${roleMod}`}
        aria-hidden="true"
        title="Active session"
      />
    </div>
  );
}
