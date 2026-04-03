// src/features/employer/hrManagement/components/ConfirmEmployeeModal.tsx

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { CenterModal } from "../../../../shared/components/CenterModal";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type ConfirmEmployeeModalProps = {
  open: boolean;
  record: HRCandidateRecord;
  onClose: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ConfirmEmployeeModal({ open, record, onClose }: ConfirmEmployeeModalProps) {
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    hrManagementStorage.confirmEmployee(record.id, note.trim() || undefined);
    onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Confirm Employee" maxWidth={420}>
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: "#16a34a" }}>
          Confirm Employee
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, marginBottom: 14, lineHeight: 1.5 }}>
          This will change {record.employeeName}'s status from Probation to Confirmed. This means the employee has successfully completed their probation period.
        </div>

        <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", display: "block", marginBottom: 4 }}>
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Excellent performance during probation"
          maxLength={300}
          rows={2}
          style={{
            width: "100%", padding: "10px 12px", fontSize: 13,
            border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 8,
            outline: "none", background: "#fff", color: "var(--wm-er-text)",
            boxSizing: "border-box", resize: "vertical",
          }}
        />

        <div
          style={{
            marginTop: 12, padding: 10, borderRadius: 8,
            background: "rgba(22, 163, 74, 0.06)", border: "1px solid rgba(22, 163, 74, 0.15)",
            fontSize: 11, color: "#166534", lineHeight: 1.5, fontWeight: 700,
          }}
        >
          ✓ After confirmation, the employee will have full permanent status. An appointment letter can be generated from the Letters section.
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>Cancel</button>
          <button className="wm-primarybtn" type="button" onClick={handleConfirm} style={{ background: "#16a34a" }}>
            Confirm Employee
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
