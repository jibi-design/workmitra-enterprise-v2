// src/features/employee/workVault/components/VaultSectionLock.tsx

import { VAULT_ACCENT } from "../constants/vaultConstants";

type Props = {
  title: string;
};

export function VaultSectionLock({ title }: Props) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: "rgba(124, 58, 237, 0.04)",
        border: "1px solid rgba(124, 58, 237, 0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        opacity: 0.7,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill={VAULT_ACCENT}
            d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2Z"
          />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>
          {title}
        </span>
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 900,
          padding: "3px 10px",
          borderRadius: 999,
          background: "rgba(124, 58, 237, 0.08)",
          color: VAULT_ACCENT,
          whiteSpace: "nowrap",
        }}
      >
        Coming Soon
      </span>
    </div>
  );
}