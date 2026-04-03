// src/features/employer/hrManagement/components/AppreciationLetterModal.tsx
//
// Employer generates an appreciation letter for an employee.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { letterTemplatesStorage } from "../storage/letterTemplates.storage";
import type { AppreciationLetterData } from "../types/letterTemplates.types";

type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  marginBottom: 4,
  display: "block",
};

export function AppreciationLetterModal({ open, onClose, record }: Props) {
  const [reason, setReason] = useState("");
  const [achievement, setAchievement] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");

  const isValid = reason.trim().length > 0 && achievement.trim().length > 0;

  const handleSend = () => {
    if (!isValid) return;

    const data: AppreciationLetterData = {
      employeeName: record.employeeName,
      jobTitle: record.jobTitle,
      reason: reason.trim(),
      achievement: achievement.trim(),
      additionalNote: additionalNote.trim(),
    };

    letterTemplatesStorage.createLetter({
      hrCandidateId: record.id,
      employeeUniqueId: record.employeeUniqueId,
      employeeName: record.employeeName,
      kind: "appreciation",
      letterData: { kind: "appreciation", data },
    });

    setReason("");
    setAchievement("");
    setAdditionalNote("");
    onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Send Appreciation Letter" maxWidth={460}>
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: "#16a34a" }}>Appreciation Letter</div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, marginBottom: 14 }}>
          Recognize {record.employeeName}'s good work. The employee will be notified and this will be added to their HR record.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>Reason for Appreciation *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this employee being appreciated?" maxLength={500} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>Achievement / Contribution *</label>
            <textarea value={achievement} onChange={(e) => setAchievement(e.target.value)} placeholder="Describe the specific achievement or contribution..." maxLength={500} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>Additional Note (optional)</label>
            <textarea value={additionalNote} onChange={(e) => setAdditionalNote(e.target.value)} placeholder="Any additional message for the employee..." maxLength={300} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
            background: "rgba(22, 163, 74, 0.06)",
            border: "1px solid rgba(22, 163, 74, 0.15)",
            fontSize: 11,
            color: "#166534",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          ✓ Appreciation letters boost employee morale and are recorded in their HR file as positive achievements.
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>Cancel</button>
          <button className="wm-primarybtn" type="button" disabled={!isValid} onClick={handleSend} style={{ background: "#16a34a", opacity: isValid ? 1 : 0.5 }}>
            Send Appreciation
          </button>
        </div>
      </div>
    </CenterModal>
  );
}