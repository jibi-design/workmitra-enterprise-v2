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
  const [copied, setCopied] = useState(false);

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
  const digits = code.replace(/\s+/g, "").split("");

  async function handleCopy() {
    if (remainingMs <= 0) return;
    try {
      await navigator.clipboard.writeText(code.replace(/\s+/g, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be blocked — keep UI quiet */
    }
  }

  return (
    <div className="wm-vault-otp-display">
      <div className="wm-vault-otp-stage" aria-label={`Access code ${digits.join(" ")}`}>
        <div className="wm-vault-otp-digits">
          {digits.map((digit, index) => (
            <span key={`${digit}-${index}`} className="wm-vault-otp-digit">
              {digit}
            </span>
          ))}
        </div>
      </div>

      <span className={`wm-vault-otp-expiry${isUrgent ? " wm-vault-otp-expiry--urgent" : ""}`}>
        {remainingMs <= 0 ? "Expired" : `Expires in ${timeStr}`}
      </span>

      <button
        type="button"
        className="wm-vault-otp-btn wm-vault-otp-btn--ghost"
        onClick={() => void handleCopy()}
        disabled={remainingMs <= 0}
      >
        {copied ? "Copied" : "Copy Code"}
      </button>
    </div>
  );
}
