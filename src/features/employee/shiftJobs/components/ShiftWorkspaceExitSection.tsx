// src/features/employee/shiftJobs/components/ShiftWorkspaceExitSection.tsx
//
// Leave workspace card + exit reason modal.

import { useState, useCallback } from "react";

import { shiftWorkspacesStorage } from "../storage/shiftWorkspaces.storage";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { exitReasonLabel, statusBadgeLabel } from "../helpers/shiftWorkspaceDisplayHelpers";

import type { ShiftWorkspace } from "../storage/shiftWorkspaces.storage";

/* ── Types ─────────────────────────────────────── */

type ExitReason = NonNullable<ShiftWorkspace["exitReason"]>;

type Props = {
  workspace: ShiftWorkspace;
  readOnly: boolean;
  onExited: () => void;
};

/* ── Component ─────────────────────────────────── */

export function ShiftWorkspaceExitSection({ workspace, readOnly, onExited }: Props) {
  const [exitOpen, setExitOpen] = useState(false);
  const [exitReason, setExitReason] = useState<ExitReason>("emergency");
  const [exitNote, setExitNote] = useState("");
  const [confirm, setConfirm] = useState<ConfirmData | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const openExitModal = useCallback(() => {
    if (readOnly) return;
    setExitReason("emergency");
    setExitNote("");
    setExitOpen(true);
  }, [readOnly]);

  const doExit = useCallback(() => {
    setExitOpen(false);
    setConfirm({
      title: "Leave this workspace?",
      message: `Reason: ${exitReasonLabel(exitReason)}. Employer will be notified. This cannot be undone.`,
      tone: "danger", confirmLabel: "Confirm Leave", cancelLabel: "Stay",
    });
    setConfirmAction(() => () => {
      shiftWorkspacesStorage.exitWorkspace(workspace.id, exitReason, exitNote);
      setNotice({ title: "Recorded", message: "You left this workspace. Employer has been notified.", tone: "info" });
    });
  }, [exitReason, exitNote, workspace.id]);

  return (
    <>
      {/* Leave workspace card */}
      <div className="wm-ee-card" style={{ marginTop: 12, marginBottom: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>Leave workspace</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 500 }}>
          If you cannot attend, leave here. Employer will be notified.
        </div>
        {readOnly ? (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 600 }}>
            Leave is disabled because this workspace is read-only ({statusBadgeLabel(workspace.status)}).
          </div>
        ) : (
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button className="wm-dangerBtn" type="button" onClick={openExitModal}>Leave Now</button>
          </div>
        )}
      </div>

      {/* Exit reason modal */}
      <CenterModal open={exitOpen} onBackdropClose={() => setExitOpen(false)} ariaLabel="Exit reason">
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>Why are you leaving?</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 500 }}>
            Select a reason. Employer will be notified.
          </div>
          <div className="wm-chipRow" style={{ marginTop: 12 }}>
            {(["emergency", "sick", "travel", "other"] as ExitReason[]).map((r) => (
              <button key={r} className={`wm-chipBtn ${exitReason === r ? "isActive" : ""}`} type="button" onClick={() => setExitReason(r)}>
                {exitReasonLabel(r)}
              </button>
            ))}
          </div>
          <div className="wm-field" style={{ marginTop: 12 }}>
            <div className="wm-label">Note (optional)</div>
            <input className="wm-input" value={exitNote} onChange={(e) => setExitNote(e.target.value)} placeholder="Brief explanation..." maxLength={120} />
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="wm-outlineBtn" type="button" onClick={() => setExitOpen(false)}>Cancel</button>
            <button className="wm-dangerBtn" type="button" onClick={doExit}>Continue</button>
          </div>
        </div>
      </CenterModal>

      <ConfirmModal
        confirm={confirm}
        onCancel={() => { setConfirm(null); setConfirmAction(null); }}
        onConfirm={() => { setConfirm(null); if (confirmAction) confirmAction(); setConfirmAction(null); }}
      />
      <NoticeModal notice={notice} onClose={() => { setNotice(null); onExited(); }} />
    </>
  );
}