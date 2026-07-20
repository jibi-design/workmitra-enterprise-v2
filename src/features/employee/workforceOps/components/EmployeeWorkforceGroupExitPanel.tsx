// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceGroupExitPanel.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceGroupExitPanel.tsx

import type { CancelReason } from "../../../../shared/domains/workforce/types/workforceTypes";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  exitReason: CancelReason;
  exitNote: string;
  exitConfirm: boolean;
  exitDone: boolean;
  onReasonChange: (reason: CancelReason) => void;
  onNoteChange: (value: string) => void;
  onRequestExit: () => void;
  onConfirmExit: () => void;
  onCancelExit: () => void;
  onBack: () => void;
};

const reasons: CancelReason[] = ["sick", "emergency", "travel", "other"];

export function EmployeeWorkforceGroupExitPanel({
  exitReason,
  exitNote,
  exitConfirm,
  exitDone,
  onReasonChange,
  onNoteChange,
  onRequestExit,
  onConfirmExit,
  onCancelExit,
  onBack,
}: Props) {
  if (exitDone) {
    return (
      <div className="wm-er-card" style={{ marginTop: 12, textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>
          You've exited this group
        </div>

        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
          The employer has been notified.
        </div>

        <button
          className="wm-primarybtn"
          type="button"
          onClick={onBack}
          style={{ marginTop: 12, background: AMBER }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div className="wm-er-card">
        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-error)" }}>Can't Attend?</div>

        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, lineHeight: 1.5 }}>
          If you can no longer attend, let the employer know. A replacement may be found
          automatically.
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div>
            <div
              style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}
            >
              Reason
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {reasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => onReasonChange(reason)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border:
                      exitReason === reason
                        ? `2px solid ${AMBER}`
                        : "1px solid var(--wm-er-border)",
                    background: exitReason === reason ? AMBER_BG : "var(--wm-er-bg)",
                    color: exitReason === reason ? AMBER : "var(--wm-er-text)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div
              style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}
            >
              Note (optional)
            </div>

            <input
              type="text"
              className="wm-input"
              placeholder="Any additional details..."
              value={exitNote}
              onChange={(event) => onNoteChange(event.target.value)}
              style={{ width: "100%", fontSize: 13 }}
              maxLength={200}
            />
          </div>

          {!exitConfirm ? (
            <button
              type="button"
              onClick={onRequestExit}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--wm-radius-10)",
                border: "1px solid var(--wm-error)",
                background: "rgba(220,38,38,0.06)",
                color: "var(--wm-error)",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              I Can't Attend
            </button>
          ) : (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid var(--wm-error)",
                background: "rgba(220,38,38,0.04)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-error)" }}>
                Are you sure?
              </div>

              <div style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 4 }}>
                You will be removed from this group. The employer will see your exit reason and may
                replace you. This cannot be undone.
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button
                  className="wm-primarybtn"
                  type="button"
                  onClick={onConfirmExit}
                  style={{ background: "var(--wm-error)", padding: "8px 16px" }}
                >
                  Yes, Leave Group
                </button>

                <button
                  type="button"
                  onClick={onCancelExit}
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
      </div>
    </div>
  );
}
