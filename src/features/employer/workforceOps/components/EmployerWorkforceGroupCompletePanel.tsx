// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceGroupCompletePanel.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceGroupCompletePanel.tsx

type Props = {
  confirmComplete: boolean;
  onRequestComplete: () => void;
  onConfirmComplete: () => void;
  onCancelComplete: () => void;
};

export function EmployerWorkforceGroupCompletePanel({
  confirmComplete,
  onRequestComplete,
  onConfirmComplete,
  onCancelComplete,
}: Props) {
  return (
    <div
      className="wm-er-card"
      style={{
        marginTop: 16,
        marginBottom: 24,
        border: "1px solid rgba(22,163,74,0.22)",
        background: "linear-gradient(180deg, rgba(240,253,244,0.92), rgba(255,255,255,0.98))",
      }}
    >
      {!confirmComplete ? (
        <button
          type="button"
          onClick={onRequestComplete}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "var(--wm-radius-10)",
            border: "1px solid rgba(22,163,74,0.3)",
            background: "var(--wm-success)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Mark Completed and Start Rating
        </button>
      ) : (
        <div className="wm-er-card" style={{ border: "1px solid var(--wm-success)" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--wm-success)" }}>
            Complete this group?
          </div>

          <div style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 4, lineHeight: 1.5 }}>
            This will end the group. You'll be prompted to rate each member.
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={onConfirmComplete}
              style={{ background: "var(--wm-success)", padding: "8px 16px" }}
            >
              Yes, Complete
            </button>

            <button
              type="button"
              onClick={onCancelComplete}
              style={{
                background: "none",
                border: "1px solid var(--wm-er-border)",
                borderRadius: "var(--wm-radius-10)",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--wm-er-text)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
