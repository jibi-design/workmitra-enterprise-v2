// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminSettingsSharedUi.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\adminSettings\AdminSettingsSharedUi.tsx

import type { ReactNode } from "react";
type ClearRowProps = {
  label: string;
  description: string;
  color: string;
  disabled?: boolean;
  onClear: () => void;
};

export function AdminSettingsSectionHeader({ label }: { label: string }) {
  return (
    <div className="wm-ad-secHead">
      <span className="wm-ad-secLabel">{label}</span>
      <div className="wm-ad-secLine" />
    </div>
  );
}

export function AdminSettingsClearRow({
  label,
  description,
  color,
  disabled,
  onClear,
}: ClearRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-ad-navy)" }}>{label}</div>

        <div style={{ fontSize: 11, color: "var(--wm-ad-navy-400)", marginTop: 2 }}>
          {description}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onClear}
        style={{
          fontSize: 11,
          fontWeight: 800,
          padding: "6px 14px",
          borderRadius: 8,
          background: `${color}12`,
          border: `1px solid ${color}22`,
          color,
          cursor: disabled ? "default" : "pointer",
          transition: "all 0.15s",
          flexShrink: 0,
        }}
      >
        Clear
      </button>
    </div>
  );
}

export function AdminSettingsAboutRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid var(--wm-ad-divider)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-ad-navy-500)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-ad-navy)" }}>{value}</span>
    </div>
  );
}
