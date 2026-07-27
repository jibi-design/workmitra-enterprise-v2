import type { HRCandidateRecord } from "../types/hrManagement.types";
import { fmtExitDate } from "./ExitClearanceSection.helpers";

type FinalizePanelProps = {
  record: HRCandidateRecord;
  exitData: NonNullable<HRCandidateRecord["exitData"]>;
  canFinalize: boolean;
  allCleared: boolean;
  showConfirmFinalize: boolean;
  onShowConfirm: () => void;
  onHideConfirm: () => void;
  onFinalize: () => void;
};

export function FinalizeErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(220,38,38,0.06)",
        border: "1px solid rgba(220,38,38,0.2)",
        fontSize: 12,
        fontWeight: 600,
        color: "#b91c1c",
      }}
    >
      {message}
    </div>
  );
}

export function FinalizeExitPanel({
  record,
  exitData,
  canFinalize,
  allCleared,
  showConfirmFinalize,
  onShowConfirm,
  onHideConfirm,
  onFinalize,
}: FinalizePanelProps) {
  if (exitData.exitCompletedAt || record.status === "exited") {
    return (
      <div
        style={{
          padding: 16,
          background: "rgba(22,163,74,0.04)",
          borderRadius: 12,
          border: "1px solid rgba(22,163,74,0.2)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 900, color: "#16a34a" }}>✓ Exit Completed</div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
          {exitData.exitCompletedAt
            ? `Finalized on ${fmtExitDate(exitData.exitCompletedAt)}`
            : "Exit finalized"}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      {!showConfirmFinalize ? (
        <>
          <div
            style={{
              fontSize: 12,
              color: "var(--wm-er-muted)",
              marginBottom: 10,
              lineHeight: 1.5,
            }}
          >
            To finalize the exit, you must complete all clearance items and send an experience
            letter.
          </div>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={onShowConfirm}
            disabled={!canFinalize}
            style={{ width: "100%", fontSize: 13 }}
          >
            Finalize Exit
          </button>
          {!canFinalize && (
            <div style={{ fontSize: 11, color: "#d97706", marginTop: 6, textAlign: "center" }}>
              {!allCleared && "Complete all clearance items. "}
              {!exitData.experienceLetterSent && "Send experience letter first."}
            </div>
          )}
        </>
      ) : (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#dc2626", marginBottom: 8 }}>
            Are you sure you want to finalize this exit?
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--wm-er-muted)",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            This action cannot be undone. The employee's record will be marked as exited and their
            Work Vault will be updated.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onHideConfirm}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--wm-er-border, #e5e7eb)",
                background: "#fff",
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
                color: "var(--wm-er-text)",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onFinalize}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                background: "#dc2626",
                color: "#fff",
                fontWeight: 900,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Confirm Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
