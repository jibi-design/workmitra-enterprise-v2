// App: Job Mitra / WorkMitra_Enterprise_v2
// File: DocAccessOtpStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\components\DocAccessOtpStep.tsx

import { DOC_ACCESS_ACCENT } from "../docAccessConstants";
import { DocAccessOtpInput } from "./DocAccessOtpInput";

type DocAccessOtpStepProps = {
  workerName: string;
  otpError: string;
  onSubmit: (code: string) => void;
  onClose: () => void;
};

export function DocAccessOtpStep({
  workerName,
  otpError,
  onSubmit,
  onClose,
}: DocAccessOtpStepProps) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 9px",
            borderRadius: 999,
            background: `${DOC_ACCESS_ACCENT}10`,
            color: DOC_ACCESS_ACCENT,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.35,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Work Vault Verification
        </div>

        <div style={{ fontSize: 18, fontWeight: 850, color: "var(--wm-er-text)", marginBottom: 7 }}>
          Enter Employee Access Code
        </div>

        <div style={{ fontSize: 13.2, color: "#475569", lineHeight: 1.6, fontWeight: 500 }}>
          This code is needed to view <strong>{workerName}</strong>&apos;s shared Work Vault
          documents. Ask the employee for the code before continuing.
        </div>
      </div>

      <div
        style={{
          marginBottom: 12,
          padding: "13px",
          borderRadius: 15,
          background: "rgba(248,250,252,0.98)",
          border: "1px solid rgba(148,163,184,0.22)",
        }}
      >
        <div
          style={{ fontSize: 13.2, fontWeight: 850, color: "var(--wm-er-text)", marginBottom: 10 }}
        >
          What you need to do
        </div>

        <div style={{ display: "grid", gap: 9 }}>
          <GuideRow number="1" text={`Call or contact ${workerName}.`} />
          <GuideRow number="2" text="Ask the employee to open Work Vault in their app." />
          <GuideRow number="3" text="The employee should tap Generate Access Code." />
          <GuideRow number="4" text="Ask the employee to tell you the 6-digit code." />
          <GuideRow number="5" text="Type that code below and tap Verify & View Documents." />
        </div>
      </div>

      <div
        style={{
          marginBottom: 14,
          padding: "12px 13px",
          borderRadius: 15,
          background: `${DOC_ACCESS_ACCENT}07`,
          border: `1px solid ${DOC_ACCESS_ACCENT}24`,
          fontSize: 12.2,
          color: "#4c1d95",
          lineHeight: 1.6,
          fontWeight: 600,
        }}
      >
        You can view only the folders the employee marked as visible. The code works one time only
        and expires in 5 minutes.
      </div>

      <DocAccessOtpInput onSubmit={onSubmit} error={otpError} />

      <button
        type="button"
        onClick={onClose}
        style={{
          width: "100%",
          marginTop: 10,
          padding: "10px 0",
          borderRadius: 11,
          border: "1px solid var(--wm-er-border)",
          background: "#ffffff",
          fontSize: 13,
          fontWeight: 650,
          color: "var(--wm-er-muted)",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </>
  );
}

function GuideRow({ number, text }: { number: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span
        style={{
          width: 21,
          height: 21,
          borderRadius: 999,
          flexShrink: 0,
          background: `${DOC_ACCESS_ACCENT}14`,
          color: DOC_ACCESS_ACCENT,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 850,
          marginTop: 1,
        }}
      >
        {number}
      </span>

      <span style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, fontWeight: 550 }}>
        {text}
      </span>
    </div>
  );
}
