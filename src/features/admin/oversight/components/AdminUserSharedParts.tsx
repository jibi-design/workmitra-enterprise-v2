// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminUserSharedParts.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminUserSharedParts.tsx

import type { UserStatus } from "../helpers/adminDataHelpers";

const STATUS_STYLE: Record<
  UserStatus,
  { bg: string; color: string; border: string; label: string }
> = {
  active: {
    bg: "var(--wm-ad-green-dim)",
    color: "var(--wm-ad-green)",
    border: "var(--wm-ad-green-border)",
    label: "Active",
  },
  suspended: {
    bg: "rgba(245,158,11,0.08)",
    color: "#d97706",
    border: "rgba(245,158,11,0.20)",
    label: "Suspended",
  },
  blocked: {
    bg: "var(--wm-ad-danger-dim)",
    color: "var(--wm-ad-danger)",
    border: "rgba(220,38,38,0.18)",
    label: "Blocked",
  },
};

export type UserActionHandler = (
  id: string,
  role: "employer" | "employee",
  name: string,
  currentStatus: UserStatus,
  targetStatus: UserStatus,
) => void;

export function StatusBadge({ status }: { status: UserStatus }) {
  const style = STATUS_STYLE[status];

  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 800,
        padding: "3px 10px",
        borderRadius: 999,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        letterSpacing: 0.6,
        textTransform: "uppercase",
      }}
    >
      {style.label}
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div
        style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-ad-navy)", letterSpacing: -0.5 }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "var(--wm-ad-navy-400)",
          textTransform: "uppercase",
          letterSpacing: 0.6,
          marginTop: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function ActionRow({
  id,
  role,
  name,
  status,
  onAction,
}: {
  id: string;
  role: "employer" | "employee";
  name: string;
  status: UserStatus;
  onAction: UserActionHandler;
}) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
      {status === "active" && (
        <>
          <SmallBtn
            label="Suspend"
            color="#d97706"
            bg="rgba(245,158,11,0.08)"
            onClick={() => onAction(id, role, name, status, "suspended")}
          />

          <SmallBtn
            label="Block"
            color="var(--wm-ad-danger)"
            bg="var(--wm-ad-danger-dim)"
            onClick={() => onAction(id, role, name, status, "blocked")}
          />
        </>
      )}

      {status === "suspended" && (
        <>
          <SmallBtn
            label="Reactivate"
            color="var(--wm-ad-green)"
            bg="var(--wm-ad-green-dim)"
            onClick={() => onAction(id, role, name, status, "active")}
          />

          <SmallBtn
            label="Block"
            color="var(--wm-ad-danger)"
            bg="var(--wm-ad-danger-dim)"
            onClick={() => onAction(id, role, name, status, "blocked")}
          />
        </>
      )}

      {status === "blocked" && (
        <SmallBtn
          label="Reactivate"
          color="var(--wm-ad-green)"
          bg="var(--wm-ad-green-dim)"
          onClick={() => onAction(id, role, name, status, "active")}
        />
      )}
    </div>
  );
}

function SmallBtn({
  label,
  color,
  bg,
  onClick,
}: {
  label: string;
  color: string;
  bg: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 11,
        fontWeight: 800,
        padding: "6px 14px",
        borderRadius: 8,
        background: bg,
        border: `1px solid ${color}22`,
        color,
        cursor: "pointer",
        transition: "all 0.15s",
        letterSpacing: 0.2,
      }}
    >
      {label}
    </button>
  );
}
