// App name: Job Mitra
// File name: ShiftWorkspaceExitSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftWorkspaceExitSection.tsx

import { useCallback, useState } from "react";

import { CenterModal } from "../../../../shared/components/CenterModal";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { exitReasonLabel } from "../helpers/shiftWorkspaceDisplayHelpers";
import { shiftWorkspacesStorage } from "../../shiftJobs/storage/shiftWorkspaces.storage";
import type { ShiftWorkspace } from "../../shiftJobs/storage/shiftWorkspaces.storage";

type ExitReason = NonNullable<ShiftWorkspace["exitReason"]>;

type Props = {
  workspace: ShiftWorkspace;
  readOnly: boolean;
  onExited: () => void;
};

export function ShiftWorkspaceExitSection({ workspace, readOnly, onExited }: Props) {
  const [exitOpen, setExitOpen] = useState(false);
  const [exitReason, setExitReason] = useState<ExitReason>("emergency");
  const [exitNote, setExitNote] = useState("");
  const [confirm, setConfirm] = useState<ConfirmData | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const openExitModal = useCallback(() => {
    setExitReason("emergency");
    setExitNote("");
    setExitOpen(true);
  }, []);

  const doExit = useCallback(() => {
    setExitOpen(false);
    setConfirm({
      title: "Leave this work group?",
      message: `Reason: ${exitReasonLabel(exitReason)}. This will keep a local record and inform the employer inside the app.`,
      tone: "danger",
      confirmLabel: "Confirm Leave",
      cancelLabel: "Stay",
    });
    setConfirmAction(() => () => {
      shiftWorkspacesStorage.exitWorkspace(workspace.id, exitReason, exitNote);
      setNotice({
        title: "Leave recorded",
        message:
          "You left this work group. The employer can see the updated status inside the app.",
        tone: "info",
      });
    });
  }, [exitReason, exitNote, workspace.id]);

  if (readOnly || workspace.status === "completed") {
    return null;
  }

  return (
    <>
      <section
        className="wm-shift-surface-glass wm-animateIn"
        data-testid="shift-workspace-exit"
        style={{
          animationDelay: "160ms",
          marginBottom: 32,
          padding: 16,
          border: "1px solid rgba(217,119,6,0.18)",
          background: "linear-gradient(180deg, rgba(255,251,235,0.72), rgba(255,255,255,0.98))",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-emp-text)" }}>
              Leave Work Group
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "var(--wm-emp-muted)",
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              Use this only if you cannot attend or continue this confirmed shift.
            </div>
          </div>

          <span
            className="wm-shift-pill"
            style={{
              fontSize: 10,
              color: "#b45309",
              background: "rgba(217,119,6,0.08)",
              border: "1px solid rgba(217,119,6,0.18)",
            }}
          >
            Important
          </span>
        </div>

        <button
          type="button"
          className="wm-outlineBtn wm-shift-pressable"
          onClick={openExitModal}
          style={{
            width: "100%",
            marginTop: 14,
            color: "#b45309",
            borderColor: "rgba(217,119,6,0.22)",
          }}
        >
          Leave Work Group
        </button>
      </section>

      <CenterModal
        open={exitOpen}
        onBackdropClose={() => setExitOpen(false)}
        ariaLabel="Exit reason"
      >
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 950, fontSize: 15, color: "var(--wm-emp-text)" }}>
            Why are you leaving?
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "var(--wm-emp-muted)",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            Select a reason. The employer can see this update inside the app.
          </div>

          <div className="wm-shift-seg-tab-row" style={{ marginTop: 12 }}>
            {(["emergency", "sick", "travel", "other"] as ExitReason[]).map((reason) => (
              <button
                key={reason}
                className={`wm-shift-seg-tab ${exitReason === reason ? "isActive" : ""}`}
                type="button"
                onClick={() => setExitReason(reason)}
              >
                {exitReasonLabel(reason)}
              </button>
            ))}
          </div>

          <div className="wm-field" style={{ marginTop: 12 }}>
            <div className="wm-label">Note (optional)</div>
            <input
              className="wm-input"
              value={exitNote}
              onChange={(event) => setExitNote(event.target.value)}
              placeholder="Brief explanation"
              maxLength={120}
            />
          </div>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="wm-outlineBtn" type="button" onClick={() => setExitOpen(false)}>
              Cancel
            </button>
            <button className="wm-dangerBtn" type="button" onClick={doExit}>
              Continue
            </button>
          </div>
        </div>
      </CenterModal>

      <ConfirmModal
        confirm={confirm}
        onCancel={() => {
          setConfirm(null);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          setConfirm(null);
          confirmAction?.();
          setConfirmAction(null);
        }}
      />

      <NoticeModal
        notice={notice}
        onClose={() => {
          setNotice(null);
          onExited();
        }}
      />
    </>
  );
}
