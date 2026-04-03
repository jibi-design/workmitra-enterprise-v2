// src/features/employee/workVault/components/VaultIdentityCard.tsx

import { VAULT_ACCENT } from "../constants/vaultConstants";

type Props = {
  fullName: string;
  city: string;
  uniqueId: string;
  photoDataUrl: string;
  phoneVerified: boolean;
  emailVerified: boolean;
};

function VerifyBadge({ label, verified }: { label: string; verified: boolean }) {
  const bg = verified ? "rgba(22, 163, 74, 0.08)" : "rgba(245, 158, 11, 0.08)";
  const border = verified ? "rgba(22, 163, 74, 0.22)" : "rgba(245, 158, 11, 0.22)";
  const color = verified ? "#15803d" : "#92400e";
  const text = verified ? "Verified" : "Not verified";

  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 900,
        padding: "2px 8px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${border}`,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {label}: {text}
    </span>
  );
}

export function VaultIdentityCard({
  fullName,
  city,
  uniqueId,
  photoDataUrl,
  phoneVerified,
  emailVerified,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 14,
        background: `${VAULT_ACCENT}06`,
        border: `1px solid ${VAULT_ACCENT}18`,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `${VAULT_ACCENT}10`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {photoDataUrl ? (
          <img
            src={photoDataUrl}
            alt="Profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill={VAULT_ACCENT}
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"
            />
          </svg>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "var(--wm-emp-text)" }}>
          {fullName || "Name not set"}
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 1 }}>
          {city || "City not set"}
        </div>
        {uniqueId && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: VAULT_ACCENT,
              letterSpacing: 0.5,
              marginTop: 2,
              fontFamily: "monospace",
            }}
          >
            {uniqueId}
          </div>
        )}
      </div>

      {/* Badges */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <VerifyBadge label="Phone" verified={phoneVerified} />
        <VerifyBadge label="Email" verified={emailVerified} />
      </div>
    </div>
  );
}