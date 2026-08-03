// App name: Job Mitra
// File name: EmployerVaultActiveSessionCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\accessSessions\EmployerVaultActiveSessionCard.tsx

import type { VaultSession } from "../../../../shared/workVault/vaultPublic";

type EmployerVaultActiveSessionCardProps = {
  session: VaultSession | null;
  remainingText: string;
  onEndSession: () => void;
};

export function EmployerVaultActiveSessionCard({
  session,
  remainingText,
  onEndSession,
}: EmployerVaultActiveSessionCardProps) {
  if (!session) {
    return (
      <article className="wm-vault-session-card">
        <div className="wm-vault-session-card__title">No active worker access session</div>
        <div className="wm-vault-session-card__sub">
          Unlock a worker profile from Verify Worker when the employee shares an access code.
        </div>
      </article>
    );
  }

  return (
    <article className="wm-vault-session-card wm-vault-session-card--live">
      <div className="wm-vault-session-card__head">
        <div style={{ minWidth: 0 }}>
          <div className="wm-vault-session-card__title">Active worker profile access</div>
          <div className="wm-vault-session-card__sub">
            Access opened by {session.employerName || "Employer"}
          </div>
          <div className="wm-vault-session-card__id">Session: {session.id}</div>
        </div>
        <span className="wm-vault-doc-status wm-vault-doc-status--valid">Active</span>
      </div>

      <div className="wm-vault-session-card__meta">
        Remaining access time: <strong>{remainingText}</strong>
      </div>

      <button type="button" className="wm-vault-session-card__revoke" onClick={onEndSession}>
        End Access Session
      </button>
    </article>
  );
}
