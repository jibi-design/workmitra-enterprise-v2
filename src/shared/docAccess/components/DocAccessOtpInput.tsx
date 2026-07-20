// App: Job Mitra / WorkMitra_Enterprise_v2
// File: DocAccessOtpInput.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\components\DocAccessOtpInput.tsx

import { useRef, useState } from "react";
import { DOC_ACCESS_ACCENT, DOC_ACCESS_OTP_CODE_LENGTH } from "../docAccessConstants";

type DocAccessOtpInputProps = {
  onSubmit: (code: string) => void;
  error: string;
};

export function DocAccessOtpInput({ onSubmit, error }: DocAccessOtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(DOC_ACCESS_OTP_CODE_LENGTH).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const isFilled = digits.every((digit) => digit !== "");

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
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
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
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event.key)}
            onPaste={index === 0 ? handlePaste : undefined}
            autoFocus={index === 0}
            style={{
              width: 44,
              height: 52,
              borderRadius: 12,
              border: digit ? `2px solid ${DOC_ACCESS_ACCENT}` : "2px solid var(--wm-er-border)",
              background: digit ? `${DOC_ACCESS_ACCENT}06` : "#fff",
              fontSize: 22,
              fontWeight: 700,
              textAlign: "center",
              color: DOC_ACCESS_ACCENT,
              outline: "none",
            }}
          />
        ))}
      </div>

      {error && (
        <div
          style={{
            fontSize: 12,
            color: "#dc2626",
            fontWeight: 600,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isFilled}
        style={{
          width: "100%",
          padding: "12px 0",
          borderRadius: 10,
          border: "none",
          background: isFilled ? DOC_ACCESS_ACCENT : "#e5e7eb",
          color: isFilled ? "#fff" : "#9ca3af",
          fontWeight: 600,
          fontSize: 13,
          cursor: isFilled ? "pointer" : "not-allowed",
        }}
      >
        Verify &amp; View Documents
      </button>
    </div>
  );
}
