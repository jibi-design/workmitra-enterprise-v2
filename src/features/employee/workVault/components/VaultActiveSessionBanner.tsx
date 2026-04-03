// src/features/employee/workVault/components/VaultActiveSessionBanner.tsx
//
// Shows when an employer has active document access.
// Employee can revoke at any time.
// Countdown timer shown to employee.

import { useCallback, useEffect, useState } from "react";
import { docAccessSessionStorage } from "../../../../shared/docAccess/docAccessSessionStorage";
import { VAULT_ACCENT } from "../constants/vaultConstants";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  employerName: string;
  onRevoke: () => void;
  /** Optional custom remaining-ms getter (for vault sessions). Defaults to docAccessSessionStorage. */
  getRemainingMs?: () => number;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ActiveSessionBanner({ employerName, onRevoke, getRemainingMs }: Props) {
  const msGetter = useCallback(
    () => getRemainingMs ? getRemainingMs() : docAccessSessionStorage.getRemainingMs(),
    [getRemainingMs],
  );
  const [ms, setMs] = useState(() => msGetter());

  useEffect(() => {
    const t = setInterval(() => setMs(msGetter()), 1000);
    return () => clearInterval(t);
  }, [msGetter]);

  const secs  = Math.ceil(ms / 1000);
  const min   = Math.floor(secs / 60);
  const sec   = secs % 60;
  const isLow = secs <= 120;

  if (ms <= 0) return null;

  return (
    <div style={{
      marginBottom: 14, padding: "12px 14px", borderRadius: 12,
      background: isLow ? "rgba(220,38,38,0.06)" : "rgba(124,58,237,0.06)",
      border: `1.5px solid ${isLow ? "rgba(220,38,38,0.25)" : `${VAULT_ACCENT}30`}`,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: isLow ? "rgba(220,38,38,0.1)" : `${VAULT_ACCENT}12`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
            <path fill={isLow ? "#dc2626" : VAULT_ACCENT}
              d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 4 5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5Z" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
            Documents being viewed
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>
            {employerName} is viewing your documents
          </div>
        </div>
      </div>

      {/* Timer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 999,
          background: isLow ? "rgba(220,38,38,0.1)" : `${VAULT_ACCENT}10`,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
            <path fill={isLow ? "#dc2626" : VAULT_ACCENT}
              d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: isLow ? "#dc2626" : VAULT_ACCENT }}>
            {min}:{String(sec).padStart(2, "0")} remaining
          </span>
        </div>

        <button
          type="button"
          onClick={onRevoke}
          style={{
            padding: "6px 14px", borderRadius: 8, border: "none",
            background: "#dc2626", color: "#fff",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}
        >
          Revoke Access
        </button>
      </div>
    </div>
  );
}