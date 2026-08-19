// src/features/employer/workVault/components/EmployerVaultOtpInput.tsx

import { useRef, useState } from "react";
import { JobMitraAppLabel } from "../../../../shared/components/brand/JobMitraAppLabel";
import { OTP_CODE_LENGTH, validateOtpFormat } from "../../../shared/workVault/vaultPublic";

type EmployerVaultOtpInputProps = {
  employeeName: string;
  onSubmit: (code: string) => void | Promise<void>;
  onCancel: () => void;
  error: string;
};

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
  const hasError = Boolean(error);

  return (
    <div className="wm-vault-otp-verify" data-testid="employer-vault-otp-input">
      <div className="wm-vault-otp-verify__badge">
        <span aria-hidden="true">▣</span> Enterprise OTP · Argon2 path ready
      </div>
      <div className="wm-vault-otp-verify__title">Enter Access Code</div>
      <div className="wm-vault-otp-verify__sub">
        Ask <strong>{employeeName}</strong> to share their 6-digit access code from the{" "}
        <JobMitraAppLabel />.
      </div>

      <div className="wm-vault-otp-verify__digits">
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
            aria-label={`OTP digit ${i + 1}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e.key)}
            onPaste={i === 0 ? handlePaste : undefined}
            autoFocus={i === 0}
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
        <button className="wm-outlineBtn" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="wm-vault-cta wm-vault-otp-verify__submit"
          onClick={handleSubmit}
          disabled={!isFilled}
        >
          Verify
        </button>
      </div>
    </div>
  );
}
