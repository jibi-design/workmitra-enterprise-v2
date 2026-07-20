// App: Job Mitra / WorkMitra_Enterprise_v2
// File: DocAccessModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\docAccess\DocAccessModal.tsx

import { DocAccessExpiredStep } from "../../../../shared/docAccess/components/DocAccessExpiredStep";
import { DocAccessOtpStep } from "../../../../shared/docAccess/components/DocAccessOtpStep";
import { DocAccessViewingStep } from "../../../../shared/docAccess/components/DocAccessViewingStep";
import type { DocAccessModalProps } from "../../../../shared/docAccess/types/docAccessModal.types";
import { useDocAccessModalState } from "./useDocAccessModalState";

export function DocAccessModal({
  workerName,
  workerWmId,
  profile,
  domain,
  onClose,
}: DocAccessModalProps) {
  const state = useDocAccessModalState({
    workerWmId,
    domain,
    onClose,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "24px 16px 48px",
      }}
      onClick={undefined}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--wm-er-card, #fff)",
          borderRadius: 18,
          padding: "20px 20px 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {state.step === "otp" && (
          <DocAccessOtpStep
            workerName={workerName}
            otpError={state.otpError}
            onSubmit={state.handleOtpSubmit}
            onClose={onClose}
          />
        )}

        {state.step === "viewing" && state.sessionActive && (
          <DocAccessViewingStep
            workerName={workerName}
            profile={profile}
            folders={state.folders}
            documents={state.documents}
            onEndSession={state.handleEndSession}
          />
        )}

        {state.step === "viewing" && !state.sessionActive && (
          <DocAccessExpiredStep onClose={onClose} />
        )}
      </div>
    </div>
  );
}
