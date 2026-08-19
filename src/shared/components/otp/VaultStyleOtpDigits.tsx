/** Job Mitra | VaultStyleOtpDigits.tsx | Shared 6-digit OTP strip (wm-vault-otp-verify recipe) */

import { useEffect, useRef, useState } from "react";

type Props = {
  length?: number;
  value?: string;
  onChange: (code: string) => void;
  error?: boolean;
  disabled?: boolean;
  labelPrefix?: string;
  testId?: string;
  autoFocus?: boolean;
};

export function VaultStyleOtpDigits({
  length = 6,
  value,
  onChange,
  error = false,
  disabled = false,
  labelPrefix = "OTP digit",
  testId,
  autoFocus = false,
}: Props) {
  const controlled = typeof value === "string";
  const [internal, setInternal] = useState<string[]>(() => Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = controlled ? Array.from({ length }, (_, i) => value[i] ?? "") : internal;

  useEffect(() => {
    if (!autoFocus || disabled) return;
    refs.current[0]?.focus();
  }, [autoFocus, disabled]);

  function commit(next: string[]) {
    if (!controlled) setInternal(next);
    onChange(next.join(""));
  }

  function handleChange(index: number, raw: string) {
    if (disabled) return;
    if (!/^\d?$/.test(raw)) return;
    const next = [...digits];
    next[index] = raw;
    commit(next);
    if (raw && index < length - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    if (disabled) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    commit(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div className="wm-vault-otp-verify__digits" data-testid={testId}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`${labelPrefix} ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e.key)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={`wm-vault-otp-verify__digit${digit ? " wm-vault-otp-verify__digit--filled" : ""}${
            error ? " wm-vault-otp-verify__digit--error" : ""
          }`}
        />
      ))}
    </div>
  );
}
