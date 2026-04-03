// src/shared/employment/components/ResignJobModal.tsx
// Session 17: Employee resign modal — reason dropdown + optional notes + confirm.

import { useState, useCallback } from "react";
import { CenterModal } from "../../components/CenterModal";
import type { EmployeeResignReason } from "../employmentTypes";
import { EMPLOYEE_RESIGN_REASONS } from "../employmentTypes";

/* ── Types ── */
type ResignJobModalProps = {
  open: boolean;
  companyName: string;
  noticePeriodDays: number;
  onConfirm: (reason: EmployeeResignReason, notes: string) => void;
  onCancel: () => void;
};

/* ── Component ── */
export function ResignJobModal({ open, companyName, noticePeriodDays, onConfirm, onCancel }: ResignJobModalProps) {
  const [reason, setReason] = useState<EmployeeResignReason | "">("");
  const [notes, setNotes] = useState("");

  const handleConfirm = useCallback(() => {
    if (!reason) return;
    onConfirm(reason, notes.trim());
  }, [reason, notes, onConfirm]);

  const noticeText = noticePeriodDays > 0
    ? `You have a ${noticePeriodDays}-day notice period. Your employer will be notified.`
    : "Your employer will be notified and must confirm your resignation.";

  return (
    <CenterModal open={open} onBackdropClose={onCancel} ariaLabel="Resign from job">
      <div style={{ padding: 24 }}>
        {/* Title */}
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--wm-error, #dc2626)" }}>
          Resign from job
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "var(--wm-text-muted, #64748b)", lineHeight: 1.5 }}>
          You are resigning from <strong>{companyName}</strong>. This action cannot be undone once your employer confirms.
        </div>

        {/* Notice Period Info */}
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(180,83,9,0.06)",
            border: "1px solid rgba(180,83,9,0.12)",
            fontSize: 12,
            color: "#92400e",
            lineHeight: 1.5,
          }}
        >
          {noticeText}
        </div>

        {/* Reason Dropdown */}
        <div style={{ marginTop: 16 }}>
          <label
            htmlFor="wm-resign-reason"
            style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--wm-text-muted, #64748b)", marginBottom: 6 }}
          >
            Reason for leaving <span style={{ color: "var(--wm-error, #dc2626)" }}>*</span>
          </label>
          <select
            id="wm-resign-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as EmployeeResignReason)}
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
            {EMPLOYEE_RESIGN_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Optional Notes */}
        <div style={{ marginTop: 12 }}>
          <label
            htmlFor="wm-resign-notes"
            style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--wm-text-muted, #64748b)", marginBottom: 6 }}
          >
            Additional notes <span style={{ fontSize: 11, fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="wm-resign-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 240))}
            placeholder="Any additional information for your employer"
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
              minWidth: 120,
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
            Submit resignation
          </button>
        </div>
      </div>
    </CenterModal>
  );
}