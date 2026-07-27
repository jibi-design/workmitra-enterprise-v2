// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerVaultSessionControls.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\vaultView\EmployerVaultSessionControls.tsx

import type { VaultSession } from "../../../../shared/workVault/vaultPublic";
import { EmployerVaultSessionTimer } from "./EmployerVaultSessionTimer";

type Props = {
  session: VaultSession;
  onEndSession: () => void;
};

export function EmployerVaultSessionControls({ session, onEndSession }: Props) {
  return (
    <div
      style={{
        marginTop: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <EmployerVaultSessionTimer session={session} />

      <button
        type="button"
        onClick={onEndSession}
        style={{
          height: 32,
          padding: "0 14px",
          borderRadius: "var(--wm-radius-8)",
          border: "1px solid rgba(220, 38, 38, 0.25)",
          background: "rgba(220, 38, 38, 0.08)",
          color: "#dc2626",
          fontWeight: 700,
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        End Session
      </button>
    </div>
  );
}
