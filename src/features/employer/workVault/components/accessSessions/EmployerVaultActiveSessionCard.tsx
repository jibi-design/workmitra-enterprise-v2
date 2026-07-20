// App name: Job Mitra
// File name: EmployerVaultActiveSessionCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\accessSessions\EmployerVaultActiveSessionCard.tsx

import type { VaultSession } from "../../../../employee/workVault/types/vaultTypes";

type EmployerVaultActiveSessionCardProps = {
  session: VaultSession | null;
  remainingText: string;
  onEndSession: () => void;
};

const VAULT_PURPLE = "#7c3aed";

export function EmployerVaultActiveSessionCard({
  session,
  remainingText,
  onEndSession,
}: EmployerVaultActiveSessionCardProps) {
  if (!session) {
    return (
      <article
        style={{
          padding: 14,
          borderRadius: 20,
          border: "1px solid rgba(226,232,240,0.9)",
          background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
          boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
          No active worker access session
        </div>

        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
          Unlock a worker profile from Verify Worker when the employee shares an access code.
        </div>
      </article>
    );
  }

  return (
    <article
      style={{
        padding: 15,
        borderRadius: 22,
        border: "1px solid rgba(124,58,237,0.17)",
        borderLeft: `5px solid ${VAULT_PURPLE}`,
        background:
          "linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98) 54%, rgba(245,243,255,0.68))",
        boxShadow: "0 16px 36px rgba(15,23,42,0.075)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{ fontSize: 15, fontWeight: 950, color: "var(--wm-er-text)", lineHeight: 1.25 }}
          >
            Active worker profile access
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 12,
              color: "var(--wm-er-muted)",
              lineHeight: 1.45,
              fontWeight: 750,
            }}
          >
            Access opened by {session.employerName || "Employer"}
          </div>

          <div
            style={{
              marginTop: 7,
              display: "inline-flex",
              maxWidth: "100%",
              padding: "5px 8px",
              borderRadius: 999,
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.14)",
              color: VAULT_PURPLE,
              fontSize: 10.5,
              fontWeight: 900,
              fontFamily: "monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Session: {session.id}
          </div>
        </div>

        <span
          style={{
            padding: "6px 9px",
            borderRadius: 999,
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.16)",
            color: VAULT_PURPLE,
            fontSize: 10,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          Active
        </span>
      </div>

      <div
        style={{
          marginTop: 11,
          padding: "9px 10px",
          borderRadius: 15,
          background: "rgba(255,255,255,0.82)",
          border: "1px solid rgba(226,232,240,0.9)",
          fontSize: 12,
          fontWeight: 850,
          color: "var(--wm-er-muted)",
          lineHeight: 1.45,
        }}
      >
        Remaining access time:{" "}
        <span style={{ color: VAULT_PURPLE, fontWeight: 950 }}>{remainingText}</span>
      </div>

      <button
        type="button"
        onClick={onEndSession}
        style={{
          width: "100%",
          marginTop: 12,
          minHeight: 38,
          borderRadius: 14,
          border: "1px solid rgba(220,38,38,0.22)",
          background: "rgba(220,38,38,0.07)",
          color: "#dc2626",
          fontSize: 12,
          fontWeight: 950,
          cursor: "pointer",
        }}
      >
        End Access Session
      </button>
    </article>
  );
}
