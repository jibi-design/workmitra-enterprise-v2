// src/shared/employment/components/MarkAsJoinedModal.tsx
// Session 17: Employer marks employee as joined — date picker + confirm.

import { useState, useCallback } from "react";
import { CenterModal } from "../../components/CenterModal";
import { toInputDate, fromInputDate } from "../employmentDisplayHelpers";

/* ── Types ── */
type MarkAsJoinedModalProps = {
  open: boolean;
  employeeName: string;
  onConfirm: (joinedAt: number) => void;
  onCancel: () => void;
};

/* ── Component ── */
export function MarkAsJoinedModal({ open, employeeName, onConfirm, onCancel }: MarkAsJoinedModalProps) {
  const [dateStr, setDateStr] = useState(() => toInputDate(Date.now()));

  const handleConfirm = useCallback(() => {
    const epoch = fromInputDate(dateStr);
    if (!epoch || isNaN(epoch)) return;
    onConfirm(epoch);
  }, [dateStr, onConfirm]);

  const [todayStr] = useState(() => toInputDate(Date.now()));

  return (
    <CenterModal open={open} onBackdropClose={onCancel} ariaLabel="Mark as joined">
      <div style={{ padding: 24 }}>
        {/* Title */}
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--wm-text-primary, #1e293b)" }}>
          Mark as joined
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "var(--wm-text-muted, #64748b)", lineHeight: 1.5 }}>
          Confirm that <strong>{employeeName}</strong> has joined and started working.
        </div>

        {/* Date Picker */}
        <div style={{ marginTop: 16 }}>
          <label
            htmlFor="wm-join-date"
            style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--wm-text-muted, #64748b)", marginBottom: 6 }}
          >
            Joining date
          </label>
          <input
            id="wm-join-date"
            type="date"
            value={dateStr}
            max={todayStr}
            onChange={(e) => setDateStr(e.target.value)}
            style={{
              width: "100%",
              height: 44,
              padding: "0 12px",
              borderRadius: 10,
              border: "1px solid var(--wm-border, #e2e8f0)",
              fontSize: 14,
              color: "var(--wm-text-primary, #1e293b)",
              background: "var(--wm-bg-card, #fff)",
            }}
          />
          <div style={{ marginTop: 4, fontSize: 11, color: "#94a3b8" }}>
            Select the actual date the employee started. Cannot be a future date.
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            className="wm-outlineBtn"
            onClick={onCancel}
            style={{ minWidth: 80 }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              minWidth: 120,
              height: 40,
              borderRadius: 10,
              border: "none",
              background: "var(--wm-er-accent-career, #1d4ed8)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Confirm joining
          </button>
        </div>
      </div>
    </CenterModal>
  );
}