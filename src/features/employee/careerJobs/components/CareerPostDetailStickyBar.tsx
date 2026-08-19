// App name: Job Mitra
// File name: CareerPostDetailStickyBar.tsx

type CareerPostDetailStickyBarProps = {
  isApplied: boolean;
  canWithdraw: boolean;
  withdrawOnlineBlocked?: boolean;
  isExpired: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onWithdraw: () => void;
  onApply: () => void;
};

export function CareerPostDetailStickyBar({
  isApplied,
  canWithdraw,
  withdrawOnlineBlocked = false,
  isExpired,
  canSubmit,
  isSubmitting,
  onBack,
  onWithdraw,
  onApply,
}: CareerPostDetailStickyBarProps) {
  return (
    <div
      className="wm-stickySaveBar"
      style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.8)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 -10px 30px rgba(0,0,0,0.03)",
      }}
    >
      <div className="wm-stickyInner" style={{ gap: 12, padding: "12px 16px" }}>
        <button
          className="wm-outlineBtn wm-apply-btn"
          type="button"
          onClick={onBack}
          style={{
            fontWeight: 800,
            padding: "12px 24px",
            borderRadius: "var(--wm-radius-chip)",
            cursor: "pointer",
          }}
        >
          Back
        </button>

        {canWithdraw ? (
          <button
            className="wm-outlineBtn wm-apply-btn"
            type="button"
            onClick={onWithdraw}
            aria-label={
              withdrawOnlineBlocked
                ? "Contact support to withdraw application"
                : "Withdraw application"
            }
            style={{
              color: "var(--wm-error, #dc2626)",
              borderColor: "rgba(220,38,38,0.3)",
              background: "rgba(254,242,242,0.5)",
              fontWeight: 800,
              padding: "12px 24px",
              borderRadius: "var(--wm-radius-chip)",
              cursor: "pointer",
            }}
          >
            {withdrawOnlineBlocked ? "Contact support" : "Withdraw"}
          </button>
        ) : null}

        {isApplied ? (
          <button
            className="wm-primarybtn wm-apply-btn"
            type="button"
            disabled
            aria-disabled="true"
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: "var(--wm-radius-chip)",
              fontWeight: 900,
            }}
          >
            Submitted
          </button>
        ) : null}

        {!isApplied && !isExpired ? (
          <button
            className="wm-primarybtn wm-apply-btn"
            type="button"
            onClick={onApply}
            disabled={!canSubmit || isSubmitting}
            aria-busy={isSubmitting}
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: "var(--wm-radius-chip)",
              opacity: canSubmit && !isSubmitting ? 1 : 0.4,
              fontWeight: 900,
              background:
                canSubmit && !isSubmitting
                  ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                  : "#cbd5e1",
              color: canSubmit && !isSubmitting ? "#fff" : "#64748b",
              border: "none",
              cursor: canSubmit && !isSubmitting ? "pointer" : "not-allowed",
              boxShadow: canSubmit && !isSubmitting ? "0 8px 20px rgba(37,99,235,0.2)" : "none",
            }}
          >
            {isSubmitting ? "Submitting…" : "Submit Application"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
