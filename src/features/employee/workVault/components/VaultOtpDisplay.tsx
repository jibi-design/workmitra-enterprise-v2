// WARNING DEC-012 / MIG-008: Client-side OTP path (plaintext)
// Server OTP path (Argon2 hashed) exists at server/modules/vault/
// This client path MUST BE REMOVED before production cutover
// See architecture-audits/Phase-DB-Migration-Readiness-Audit-001.md
// src/features/employee/workVault/components/VaultOtpDisplay.tsx

import { useEffect, useState } from "react";

type VaultOtpDisplayProps = {
  code: string;
  expiresAt: number;
  onExpired: () => void;
};

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
  const isUrgent = totalSeconds <= 60;

  return (
    <div style={{ textAlign: "center" }}>
      <div className="wm-vault-otp-digits" style={{ marginBottom: 16 }}>
        {code}
      </div>

      <div
        style={{ fontSize: 13, color: "var(--wm-emp-muted)", marginBottom: 12, fontWeight: 500 }}
      >
        Share this code
      </div>

      <span className={`wm-vault-otp-expiry${isUrgent ? " wm-vault-otp-expiry--urgent" : ""}`}>
        {remainingMs <= 0 ? "Expired" : `Expires in ${timeStr}`}
      </span>

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          className="wm-vault-tap"
          onClick={() => void navigator.clipboard.writeText(code)}
          disabled={remainingMs <= 0}
          style={{
            padding: "0 20px",
            borderRadius: 12,
            border: "1.5px solid var(--wm-vault-accent)",
            background: "transparent",
            color: "var(--wm-vault-accent)",
            fontWeight: 800,
            fontSize: 13,
            cursor: remainingMs <= 0 ? "not-allowed" : "pointer",
            opacity: remainingMs <= 0 ? 0.4 : 1,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Copy Code
        </button>
      </div>
    </div>
  );
}
