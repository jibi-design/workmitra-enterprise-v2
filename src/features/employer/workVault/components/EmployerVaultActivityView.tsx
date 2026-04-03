// src/features/employer/workVault/components/EmployerVaultActivityView.tsx

import type { VaultActivityData } from "../../../employee/workVault/types/vaultProfileTypes";

/* ------------------------------------------------------------------ */
/* Info Row                                                           */
/* ------------------------------------------------------------------ */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--wm-er-muted)", flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
type Props = {
  data: VaultActivityData;
};

export function EmployerVaultActivityView({ data }: Props) {
  const memberDate = new Date(data.memberSince).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lastActiveDate = new Date(data.lastActive).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: "var(--wm-er-bg, #fff)",
        border: "1px solid var(--wm-er-divider, rgba(15, 23, 42, 0.08))",
        display: "grid",
        gap: 8,
      }}
    >
      <InfoRow label="Member since">
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
          {memberDate}
        </span>
      </InfoRow>
      <InfoRow label="Last active">
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
          {lastActiveDate}
        </span>
      </InfoRow>
      <InfoRow label="Response rate">
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
          Available in full version
        </span>
      </InfoRow>
      <InfoRow label="Profile views">
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
          Available in full version
        </span>
      </InfoRow>
    </div>
  );
}