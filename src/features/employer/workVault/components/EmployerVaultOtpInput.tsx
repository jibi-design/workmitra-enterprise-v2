// src/features/employer/workVault/components/EmployerVaultOtpInput.tsx

import { useRef, useState } from "react";
import { VAULT_ACCENT } from "../../../employee/workVault/constants/vaultConstants";
import { OTP_CODE_LENGTH } from "../../../employee/workVault/constants/vaultConstants";
import { validateOtpFormat } from "../../../employee/workVault/helpers/vaultValidation";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type EmployerVaultOtpInputProps = {
  employeeName: string;
  onSubmit: (code: string) => void;
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
    onSubmit(code);
  }

  const isFilled = digits.every((d) => d !== "");

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}>
        Enter Access Code
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 20, lineHeight: 1.5 }}>
        Ask <strong>{employeeName}</strong> to share their 6-digit access code from the WorkMitra app.
      </div>

      {/* OTP Input Boxes */}
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
            ref={(el) => { inputRefs.current[i] = el; }}
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
              borderRadius: 12,
              border: digit
                ? `2px solid ${VAULT_ACCENT}`
                : "2px solid var(--wm-er-divider, rgba(15, 23, 42, 0.12))",
              background: digit ? `${VAULT_ACCENT}06` : "#fff",
              fontSize: 24,
              fontWeight: 900,
              textAlign: "center",
              color: VAULT_ACCENT,
              outline: "none",
            }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ fontSize: 12, color: "var(--wm-error)", fontWeight: 600, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }}>
        <button
          className="wm-outlineBtn"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFilled}
          style={{
            height: 40,
            padding: "0 24px",
            borderRadius: 10,
            border: "none",
            background: isFilled ? VAULT_ACCENT : "var(--wm-er-muted)",
            color: "#fff",
            fontWeight: 900,
            fontSize: 13,
            cursor: isFilled ? "pointer" : "not-allowed",
            opacity: isFilled ? 1 : 0.5,
          }}
        >
          Verify
        </button>
      </div>
    </div>
  );
}