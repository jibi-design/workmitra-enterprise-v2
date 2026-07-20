// App name: Job Mitra
// File name: EmployerVaultAccessLogCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\accessSessions\EmployerVaultAccessLogCard.tsx

import type { VaultAccessEntry } from "../../../../employee/workVault/types/vaultTypes";

type EmployerVaultAccessLogCardProps = {
  entry: VaultAccessEntry;
};

const VAULT_PURPLE = "#7c3aed";

export function EmployerVaultAccessLogCard({ entry }: EmployerVaultAccessLogCardProps) {
  return (
    <article
      style={{
        padding: 13,
        borderRadius: 18,
        border: "1px solid rgba(226,232,240,0.9)",
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{ fontSize: 13, fontWeight: 950, color: "var(--wm-er-text)", lineHeight: 1.3 }}
          >
            {entry.employerName || "Employer access"}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 10.5,
              color: "var(--wm-er-muted)",
              fontWeight: 850,
              fontFamily: "monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {entry.employerIdentifier || "Local employer"}
          </div>
        </div>

        <span
          style={{
            padding: "5px 8px",
            borderRadius: 999,
            background: getStatusBg(entry.status),
            border: "1px solid rgba(226,232,240,0.9)",
            color: getStatusColor(entry.status),
            fontSize: 10,
            fontWeight: 950,
            whiteSpace: "nowrap",
            textTransform: "capitalize",
          }}
        >
          {entry.status}
        </span>
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          color: "var(--wm-er-muted)",
          fontWeight: 800,
          lineHeight: 1.45,
        }}
      >
        Opened: {formatDateTime(entry.accessedAt)}
      </div>

      <div
        style={{
          marginTop: 3,
          fontSize: 11,
          color: "var(--wm-er-muted)",
          fontWeight: 800,
          lineHeight: 1.45,
        }}
      >
        Expires: {formatDateTime(entry.expiredAt)}
      </div>

      <div style={{ marginTop: 8, fontSize: 11, color: VAULT_PURPLE, fontWeight: 900 }}>
        Visible folders: {entry.visibleFolderIds.length}
      </div>
    </article>
  );
}

function getStatusColor(status: VaultAccessEntry["status"]): string {
  if (status === "active") return VAULT_PURPLE;
  if (status === "revoked") return "#dc2626";
  return "var(--wm-er-muted)";
}

function getStatusBg(status: VaultAccessEntry["status"]): string {
  if (status === "active") return "rgba(124,58,237,0.08)";
  if (status === "revoked") return "rgba(220,38,38,0.07)";
  return "rgba(148,163,184,0.12)";
}

function formatDateTime(value: number): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Date not available";
  }
}
