// src/features/employer/hrManagement/components/WarningLetterModal.tsx
//
// Employer generates a warning letter for an employee.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { letterTemplatesStorage } from "../storage/letterTemplates.storage";
import type { WarningLetterData } from "../types/letterTemplates.types";

type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
};

type WarningType = "verbal" | "written" | "final";

function formatDateInput(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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

export function WarningLetterModal({ open, onClose, record }: Props) {
  const [warningType, setWarningType] = useState<WarningType>("written");
  const [reason, setReason] = useState("");
  const [incidentDateStr, setIncidentDateStr] = useState(() => formatDateInput(Date.now()));
  const [expectedImprovement, setExpectedImprovement] = useState("");
  const [consequence, setConsequence] = useState("Further disciplinary action may be taken, up to and including termination.");

  const incidentDateTs = new Date(incidentDateStr + "T00:00:00").getTime();
  const isValid = reason.trim().length > 0 && expectedImprovement.trim().length > 0;

  const handleSend = () => {
    if (!isValid) return;

    const data: WarningLetterData = {
      employeeName: record.employeeName,
      jobTitle: record.jobTitle,
      warningType,
      reason: reason.trim(),
      incidentDate: incidentDateTs,
      expectedImprovement: expectedImprovement.trim(),
      consequenceIfRepeated: consequence.trim(),
    };

    letterTemplatesStorage.createLetter({
      hrCandidateId: record.id,
      employeeUniqueId: record.employeeUniqueId,
      employeeName: record.employeeName,
      kind: "warning",
      letterData: { kind: "warning", data },
    });

    setReason("");
    setExpectedImprovement("");
    onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Issue Warning Letter" maxWidth={460}>
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: "#dc2626" }}>Warning Letter</div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, marginBottom: 14 }}>
          Issue a warning letter to {record.employeeName}. The employee will be notified and can acknowledge it.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>Warning Type *</label>
            <select value={warningType} onChange={(e) => setWarningType(e.target.value as WarningType)} style={inputStyle}>
              <option value="verbal">Verbal Warning</option>
              <option value="written">Written Warning</option>
              <option value="final">Final Warning</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Incident Date</label>
            <input type="date" value={incidentDateStr} onChange={(e) => setIncidentDateStr(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Reason *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe the reason for this warning..." maxLength={500} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>Expected Improvement *</label>
            <textarea value={expectedImprovement} onChange={(e) => setExpectedImprovement(e.target.value)} placeholder="What improvement is expected from the employee?" maxLength={500} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>Consequence if Repeated</label>
            <textarea value={consequence} onChange={(e) => setConsequence(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
            background: "rgba(220, 38, 38, 0.06)",
            border: "1px solid rgba(220, 38, 38, 0.15)",
            fontSize: 11,
            color: "#991b1b",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          ⚠ This warning will be permanently recorded in the employee's HR file. It cannot be deleted after sending.
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>Cancel</button>
          <button className="wm-primarybtn" type="button" disabled={!isValid} onClick={handleSend} style={{ background: "#dc2626", opacity: isValid ? 1 : 0.5 }}>
            Issue Warning
          </button>
        </div>
      </div>
    </CenterModal>
  );
}