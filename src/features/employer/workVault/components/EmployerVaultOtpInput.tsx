// WARNING DEC-012 / MIG-008: Client-side OTP path (plaintext)
// Server OTP path (Argon2 hashed) exists at server/modules/vault/
// This client path MUST BE REMOVED before production cutover
// See architecture-audits/Phase-DB-Migration-Readiness-Audit-001.md
// src/features/employer/workVault/components/EmployerVaultOtpInput.tsx

import { useRef, useState } from "react";
import {
  OTP_CODE_LENGTH,
  validateOtpFormat,
  VAULT_ACCENT,
  vaultAccentMix,
} from "../../../shared/workVault/vaultPublic";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type EmployerVaultOtpInputProps = {
  employeeName: string;
  onSubmit: (code: string) => void | Promise<void>;
  onCancel: () => void;
  error: string;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerVaultOtpInput({
  employeeName,
  onSubmit,
  onCancel,
  error,
}: EmployerVaultOtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < OTP_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_CODE_LENGTH);
    if (!pasted) return;

    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);

    const focusIdx = Math.min(pasted.length, OTP_CODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  function handleSubmit() {
    const code = digits.join("");
    const check = validateOtpFormat(code);
    if (!check.valid) return;
    void Promise.resolve(onSubmit(code));
  }

  const isFilled = digits.every((d) => d !== "");

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}>
        Enter Access Code
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 20, lineHeight: 1.5 }}>
        Ask <strong>{employeeName}</strong> to share their 6-digit access code from the Job Mitra
        app.
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e.key)}
            onPaste={i === 0 ? handlePaste : undefined}
            autoFocus={i === 0}
            style={{
              width: 44,
              height: 52,
              borderRadius: "var(--wm-radius-button)",
              border: digit
                ? `2px solid ${VAULT_ACCENT}`
                : "2px solid var(--wm-er-divider, rgba(15, 23, 42, 0.12))",
              background: digit ? `${vaultAccentMix(3)}` : "#fff",
              fontSize: 24,
              fontWeight: 900,
              textAlign: "center",
              color: VAULT_ACCENT,
              outline: "none",
            }}
          />
        ))}
      </div>

      {error && (
        <div style={{ fontSize: 12, color: "var(--wm-error)", fontWeight: 600, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }}>
        <button className="wm-outlineBtn" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="wm-vault-cta"
          onClick={handleSubmit}
          disabled={!isFilled}
          style={{
            minHeight: 52,
            opacity: isFilled ? 1 : 0.5,
            cursor: isFilled ? "pointer" : "not-allowed",
            background: isFilled ? undefined : "var(--wm-er-muted)",
          }}
        >
          Verify
        </button>
      </div>
    </div>
  );
}
