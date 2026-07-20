// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerVaultSessionTimer.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\vaultView\EmployerVaultSessionTimer.tsx

import { useEffect, useState } from "react";
import { VAULT_ACCENT } from "../../../../employee/workVault/constants/vaultConstants";
import { getSessionRemainingMs } from "../../../../employee/workVault/services/vaultAccessService";
import type { VaultSession } from "../../../../employee/workVault/types/vaultTypes";

type Props = {
  session: VaultSession;
};

export function EmployerVaultSessionTimer({ session }: Props) {
  const [remainingMs, setRemainingMs] = useState(() => getSessionRemainingMs(session.id));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(getSessionRemainingMs(session.id));
    }, 1000);

    return () => clearInterval(interval);
  }, [session.id]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isLow = totalSeconds <= 120;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 999,
        background: isLow ? "rgba(220, 38, 38, 0.08)" : `${VAULT_ACCENT}08`,
        border: isLow ? "1px solid rgba(220, 38, 38, 0.20)" : `1px solid ${VAULT_ACCENT}18`,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill={isLow ? "#dc2626" : VAULT_ACCENT}
          d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z"
        />
      </svg>

      <span style={{ fontSize: 13, fontWeight: 700, color: isLow ? "#dc2626" : VAULT_ACCENT }}>
        {remainingMs <= 0
          ? "Session expired"
          : `${minutes}:${String(seconds).padStart(2, "0")} remaining`}
      </span>
    </div>
  );
}
