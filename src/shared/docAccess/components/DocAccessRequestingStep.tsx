// App: Job Mitra / WorkMitra_Enterprise_v2
// File: DocAccessRequestingStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\components\DocAccessRequestingStep.tsx

import { DOC_ACCESS_ACCENT } from "../docAccessConstants";

type DocAccessRequestingStepProps = {
  workerName: string;
};

export function DocAccessRequestingStep({ workerName }: DocAccessRequestingStepProps) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          margin: "0 auto 14px",
          background: `${DOC_ACCESS_ACCENT}10`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LockIcon />
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 6 }}>
        Sending access request...
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.6 }}>
        An OTP has been sent to <strong>{workerName}</strong>&apos;s app. Ask them to share the
        6-digit code with you.
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={DOC_ACCESS_ACCENT}
        d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2Z"
      />
    </svg>
  );
}
