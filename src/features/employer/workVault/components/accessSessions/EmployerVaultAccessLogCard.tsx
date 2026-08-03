// App name: Job Mitra
// File name: EmployerVaultAccessLogCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\accessSessions\EmployerVaultAccessLogCard.tsx

import type { VaultAccessEntry } from "../../../../shared/workVault/vaultPublic";

type EmployerVaultAccessLogCardProps = {
  entry: VaultAccessEntry;
};

export function EmployerVaultAccessLogCard({ entry }: EmployerVaultAccessLogCardProps) {
  const statusClass =
    entry.status === "active"
      ? "wm-vault-doc-status--valid"
      : entry.status === "revoked"
        ? "wm-vault-doc-status--expired"
        : "wm-vault-doc-status--locked";

  return (
    <article className="wm-vault-session-card">
      <div className="wm-vault-session-card__head">
        <div style={{ minWidth: 0 }}>
          <div className="wm-vault-session-card__title">
            {entry.employerName || "Employer access"}
          </div>
          <div className="wm-vault-session-card__id">
            {entry.employerIdentifier || "Local employer"}
          </div>
        </div>
        <span
          className={`wm-vault-doc-status ${statusClass}`}
          style={{ textTransform: "capitalize" }}
        >
          {entry.status}
        </span>
      </div>

      <div className="wm-vault-session-card__meta">
        Opened: {formatDateTime(entry.accessedAt)}
        <br />
        Expires: {formatDateTime(entry.expiredAt)}
        <br />
        Visible folders: <strong>{entry.visibleFolderIds.length}</strong>
      </div>
    </article>
  );
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
