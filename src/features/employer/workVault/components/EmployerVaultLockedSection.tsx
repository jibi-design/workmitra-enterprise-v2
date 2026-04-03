// src/features/employer/workVault/components/EmployerVaultLockedSection.tsx

import { VAULT_ACCENT } from "../../../employee/workVault/constants/vaultConstants";

type Props = {
  title: string;
  sectionNumber: number;
};

export function EmployerVaultLockedSection({ title, sectionNumber }: Props) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: `${VAULT_ACCENT}04`,
        border: `1px solid ${VAULT_ACCENT}10`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${VAULT_ACCENT}08`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill={VAULT_ACCENT}
              d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2Z"
            />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "var(--wm-er-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 1 }}>
            Section {sectionNumber} · OTP required
          </div>
        </div>
      </div>

      <span
        style={{
          fontSize: 9,
          fontWeight: 900,
          padding: "3px 10px",
          borderRadius: 999,
          background: `${VAULT_ACCENT}08`,
          border: `1px solid ${VAULT_ACCENT}18`,
          color: VAULT_ACCENT,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Locked
      </span>
    </div>
  );
}