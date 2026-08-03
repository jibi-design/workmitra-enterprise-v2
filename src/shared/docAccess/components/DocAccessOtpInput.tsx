// App: Job Mitra / WorkMitra_Enterprise_v2
// File: DocAccessOtpInput.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\components\DocAccessOtpInput.tsx
// Step 2: Unified onto wm-vault-otp-verify recipe (presentation only).

import { useRef, useState } from "react";
import { DOC_ACCESS_OTP_CODE_LENGTH } from "../docAccessConstants";

type DocAccessOtpInputProps = {
  onSubmit: (code: string) => void;
  error: string;
};

export function DocAccessOtpInput({ onSubmit, error }: DocAccessOtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(DOC_ACCESS_OTP_CODE_LENGTH).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const isFilled = digits.every((digit) => digit !== "");
  const hasError = Boolean(error);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < DOC_ACCESS_OTP_CODE_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent) {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, DOC_ACCESS_OTP_CODE_LENGTH);

    if (!pasted) return;

    const next = [...digits];

    for (let index = 0; index < pasted.length; index += 1) {
      next[index] = pasted[index];
    }

    setDigits(next);
    refs.current[Math.min(pasted.length, DOC_ACCESS_OTP_CODE_LENGTH - 1)]?.focus();
  }

  function handleSubmit() {
    if (isFilled) {
      onSubmit(digits.join(""));
    }
  }

  return (
    <div className="wm-vault-otp-verify" data-testid="doc-access-otp-input">
      <div className="wm-vault-otp-verify__badge">
        <span aria-hidden="true">▣</span> Doc Access · Argon2 / HMAC
      </div>
      <div className="wm-vault-otp-verify__title">Enter access code</div>
      <div className="wm-vault-otp-verify__sub">
        6-digit one-time code from the employee Work Vault.
      </div>

      <div className="wm-vault-otp-verify__digits">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            aria-label={`OTP digit ${index + 1}`}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event.key)}
            onPaste={index === 0 ? handlePaste : undefined}
            autoFocus={index === 0}
            className={`wm-vault-otp-verify__digit${digit ? " wm-vault-otp-verify__digit--filled" : ""}${
              hasError ? " wm-vault-otp-verify__digit--error" : ""
            }`}
          />
        ))}
      </div>

      <div className="wm-vault-otp-verify__error" role={hasError ? "alert" : undefined}>
        {error || "\u00A0"}
      </div>

      <div className="wm-vault-otp-verify__actions">
        <button
          type="button"
          className="wm-vault-cta wm-vault-otp-verify__submit"
          onClick={handleSubmit}
          disabled={!isFilled}
        >
          Verify &amp; View Documents
        </button>
      </div>
    </div>
  );
}
