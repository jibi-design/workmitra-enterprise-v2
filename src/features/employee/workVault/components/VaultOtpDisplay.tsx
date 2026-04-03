// src/features/employee/workVault/components/VaultOtpDisplay.tsx

import { useEffect, useState } from "react";
import { VAULT_ACCENT } from "../constants/vaultConstants";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type VaultOtpDisplayProps = {
  code: string;
  expiresAt: number;
  onExpired: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function VaultOtpDisplay({ code, expiresAt, onExpired }: VaultOtpDisplayProps) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, expiresAt - Date.now());
      setRemainingMs(left);
      if (left <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const isLow = totalSeconds <= 30;

  const digits = code.split("");

  return (
    <div style={{ textAlign: "center" }}>
      {/* OTP Code — large digits */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {digits.map((digit, i) => (
          <div
            key={i}
            style={{
              width: 44,
              height: 56,
              borderRadius: 12,
              background: `${VAULT_ACCENT}08`,
              border: `2px solid ${VAULT_ACCENT}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 900,
              color: VAULT_ACCENT,
              letterSpacing: 1,
            }}
          >
            {digit}
          </div>
        ))}
      </div>

      {/* Timer */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 999,
          background: isLow ? "rgba(220, 38, 38, 0.08)" : `${VAULT_ACCENT}08`,
          border: isLow
            ? "1px solid rgba(220, 38, 38, 0.20)"
            : `1px solid ${VAULT_ACCENT}18`,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill={isLow ? "#dc2626" : VAULT_ACCENT}
            d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z"
          />
        </svg>
        <span
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: isLow ? "#dc2626" : VAULT_ACCENT,
          }}
        >
          {remainingMs <= 0 ? "Expired" : `Valid for ${timeStr}`}
        </span>
      </div>

      {/* Copy button */}
      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(code)}
          disabled={remainingMs <= 0}
          style={{
            height: 38,
            padding: "0 20px",
            borderRadius: 10,
            border: `1.5px solid ${VAULT_ACCENT}`,
            background: "transparent",
            color: VAULT_ACCENT,
            fontWeight: 800,
            fontSize: 13,
            cursor: remainingMs <= 0 ? "not-allowed" : "pointer",
            opacity: remainingMs <= 0 ? 0.4 : 1,
          }}
        >
          Copy Code
        </button>
      </div>
    </div>
  );
}