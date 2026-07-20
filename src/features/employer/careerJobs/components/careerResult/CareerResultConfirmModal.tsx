// App name: Job Mitra
// File name: CareerResultConfirmModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\careerResult\CareerResultConfirmModal.tsx

import { CenterModal } from "../../../../../shared/components/CenterModal";

type Props = {
  open: boolean;
  result: "passed" | "failed" | null;
  confirmTitle: string;
  candidateName: string;
  candidateWorkerId: string;
  roundLabel: string;
  confirmMessage: string;
  confirmColor: string;
  onBack: () => void;
  onConfirm: () => void;
};

const CONFIRM_MODAL_INTERACTIONS = `
  .wm-confirm-btn {
    transition: all var(--wm-motion-base) var(--wm-motion-spring) !important;
  }
  .wm-confirm-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.15) !important;
  }
  .wm-confirm-btn:active:not(:disabled) {
    transform: scale(0.96) !important;
  }

  .wm-back-btn {
    transition: all var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-back-btn:hover {
    background: #f1f5f9 !important;
    color: #0f172a !important;
    border-color: #94a3b8 !important;
  }
  .wm-back-btn:active {
    transform: scale(0.96) !important;
  }
`;

export function CareerResultConfirmModal({
  open,
  result,
  confirmTitle,
  candidateName,
  candidateWorkerId,
  roundLabel,
  confirmMessage,
  confirmColor,
  onBack,
  onConfirm,
}: Props) {
  if (!open) return null;

  const isPassed = result === "passed";
  const badgeBg = isPassed ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)";
  const badgeBorder = isPassed ? "rgba(22, 163, 74, 0.2)" : "rgba(220, 38, 38, 0.2)";
  const gradientBg = isPassed
    ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
    : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";

  return (
    <CenterModal open={open} onBackdropClose={() => {}} ariaLabel="Confirm Result">
      {/* FIXED: Background, Box-shadow, and Border removed for a clean single layer */}
      <div
        className="wm-confirm-modal"
        style={{
          padding: "16px 20px",
          width: "100%",
          maxWidth: 460,
          boxSizing: "border-box",
          background: "transparent",
          boxShadow: "none",
          border: "none",
        }}
      >
        <style>{CONFIRM_MODAL_INTERACTIONS}</style>

        {/* Top Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 12,
            background: badgeBg,
            border: `1px solid ${badgeBorder}`,
            color: confirmColor,
            fontSize: 11,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 16,
          }}
        >
          {isPassed ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
          {isPassed ? "PASS" : "FAIL"}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: confirmColor,
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
          }}
        >
          {confirmTitle}
        </div>

        {/* Candidate Details Card */}
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
            background: "rgba(241, 245, 249, 0.6)",
            border: "1px solid rgba(203, 213, 225, 0.4)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>{candidateName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#475569" }}>
            Worker ID: <span style={{ color: "#1e3a8a" }}>{candidateWorkerId}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#475569" }}>
            Round: <span style={{ color: "#1e3a8a" }}>{roundLabel}</span>
          </div>
        </div>

        {/* Warning Message Box */}
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 16,
            background: isPassed ? "rgba(240, 253, 244, 0.5)" : "rgba(254, 242, 242, 0.5)",
            border: `1px dashed ${badgeBorder}`,
            color: "#334155",
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          {confirmMessage}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button
            className="wm-back-btn"
            type="button"
            onClick={onBack}
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: 800,
              minHeight: 52,
              borderRadius: 18,
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#475569",
              cursor: "pointer",
            }}
          >
            Go Back
          </button>

          <button
            className="wm-confirm-btn"
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: 900,
              minHeight: 52,
              borderRadius: 18,
              background: gradientBg,
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              boxShadow: `0 8px 24px ${isPassed ? "rgba(22, 163, 74, 0.25)" : "rgba(220, 38, 38, 0.25)"}`,
            }}
          >
            Yes, Confirm
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
