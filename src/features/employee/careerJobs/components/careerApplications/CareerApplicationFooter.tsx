// Split from CareerApplicationCardParts — CareerApplicationFooter.

import { CAREER_MUTED } from "./careerApplicationCard.constants";

export function CareerApplicationFooter({
  appliedAt,
  canWithdraw,
  withdrawOnlineBlocked = false,
  onWithdraw,
  onOpen,
  formatDateTime,
}: {
  appliedAt: number;
  canWithdraw: boolean;
  withdrawOnlineBlocked?: boolean;
  onWithdraw: () => void;
  onOpen?: () => void;
  formatDateTime: (timestamp: number) => string;
}) {
  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: "12px", color: CAREER_MUTED, fontWeight: 600 }}>
        Applied {formatDateTime(appliedAt)}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {onOpen ? (
          <button type="button" className="wm-career-cta" onClick={onOpen}>
            View details
          </button>
        ) : null}

        {canWithdraw && (
          <button
            type="button"
            className="wm-career-tap"
            onClick={(event) => {
              event.stopPropagation();
              onWithdraw();
            }}
            aria-label={
              withdrawOnlineBlocked
                ? "Contact support to withdraw application"
                : "Withdraw application"
            }
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#dc2626",
              background: "#fef2f2",
              border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "var(--wm-radius-10)",
              padding: "0 14px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {withdrawOnlineBlocked ? "Contact support" : "Withdraw"}
          </button>
        )}
      </div>
    </div>
  );
}
