// src/shared/employment/components/TerminateEmployeeModal.tsx
// Session 17: Employer terminate employee — reason dropdown + notes + confirm.

import { useState, useCallback } from "react";
import { CenterModal } from "../../components/CenterModal";
import type { EmployerTerminateReason } from "../employmentTypes";
import { EMPLOYER_TERMINATE_REASONS } from "../employmentTypes";

/* ── Types ── */
type TerminateEmployeeModalProps = {
  open: boolean;
  employeeName: string;
  onConfirm: (reason: EmployerTerminateReason, notes: string) => void;
  onCancel: () => void;
};

/* ── Component ── */
export function TerminateEmployeeModal({ open, employeeName, onConfirm, onCancel }: TerminateEmployeeModalProps) {
  const [reason, setReason] = useState<EmployerTerminateReason | "">("");
  const [notes, setNotes] = useState("");

  const handleConfirm = useCallback(() => {
    if (!reason) return;
    onConfirm(reason, notes.trim());
  }, [reason, notes, onConfirm]);

  return (
    <CenterModal open={open} onBackdropClose={onCancel} ariaLabel="Terminate employee">
      <div style={{ padding: 24 }}>
        {/* Title */}
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--wm-error, #dc2626)" }}>
          Terminate employee
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "var(--wm-text-muted, #64748b)", lineHeight: 1.5 }}>
          You are terminating <strong>{employeeName}</strong>. This action is permanent and cannot be undone.
        </div>

        {/* Warning */}
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.12)",
            fontSize: 12,
            color: "#991b1b",
            lineHeight: 1.5,
          }}
        >
          The employee will be notified immediately. Both sides will be asked to rate the experience. This record becomes part of their work history.
        </div>

        {/* Reason Dropdown */}
        <div style={{ marginTop: 16 }}>
          <label
            htmlFor="wm-terminate-reason"
            style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--wm-text-muted, #64748b)", marginBottom: 6 }}
          >
            Reason for termination <span style={{ color: "var(--wm-error, #dc2626)" }}>*</span>
          </label>
          <select
            id="wm-terminate-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as EmployerTerminateReason)}
            style={{
              width: "100%",
              height: 44,
              padding: "0 12px",
              borderRadius: 10,
              border: "1px solid var(--wm-border, #e2e8f0)",
              fontSize: 14,
              color: reason ? "var(--wm-text-primary, #1e293b)" : "#94a3b8",
              background: "var(--wm-bg-card, #fff)",
            }}
          >
            <option value="" disabled>Select a reason</option>
            {EMPLOYER_TERMINATE_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div style={{ marginTop: 12 }}>
          <label
            htmlFor="wm-terminate-notes"
            style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--wm-text-muted, #64748b)", marginBottom: 6 }}
          >
            Additional notes <span style={{ fontSize: 11, fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="wm-terminate-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 240))}
            placeholder="Any additional context for this decision"
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--wm-border, #e2e8f0)",
              fontSize: 13,
              color: "var(--wm-text-primary, #1e293b)",
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: 2, fontSize: 11, color: "#94a3b8", textAlign: "right" }}>
            {notes.length}/240
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="wm-outlineBtn" onClick={onCancel} style={{ minWidth: 80 }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!reason}
            style={{
              minWidth: 140,
              height: 40,
              borderRadius: 10,
              border: "none",
              background: !reason ? "#94a3b8" : "var(--wm-error, #dc2626)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: !reason ? "not-allowed" : "pointer",
              opacity: !reason ? 0.6 : 1,
            }}
          >
            Confirm termination
          </button>
        </div>
      </div>
    </CenterModal>
  );
}