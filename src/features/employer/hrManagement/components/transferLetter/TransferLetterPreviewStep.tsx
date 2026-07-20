// App: Job Mitra / WorkMitra_Enterprise_v2
// File: TransferLetterPreviewStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\transferLetter\TransferLetterPreviewStep.tsx

import type { HRCandidateRecord } from "../../types/hrManagement.types";
import { TransferLetterPreviewBlock } from "./transferLetterUi";

type TransferLetterFormValues = {
  toLocation: string;
  toDepartment: string;
  effectiveDate: string;
  reason: string;
  reportingManager: string;
  remarks: string;
};

type Props = {
  record: HRCandidateRecord;
  form: TransferLetterFormValues;
  effectiveTs: number;
  formatDate: (timestamp: number) => string;
  onEdit: () => void;
  onSend: () => void;
};

export function TransferLetterPreviewStep({
  record,
  form,
  effectiveTs,
  formatDate,
  onEdit,
  onSend,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <TransferLetterPreviewBlock label="Employee" value={record.employeeName} />
      <TransferLetterPreviewBlock label="Designation" value={record.jobTitle} />
      <TransferLetterPreviewBlock label="Transfer From" value={record.location || "—"} />
      <TransferLetterPreviewBlock
        label="Transfer To"
        value={form.toLocation.trim() || record.location || "—"}
      />
      <TransferLetterPreviewBlock label="Previous Department" value={record.department || "—"} />
      <TransferLetterPreviewBlock
        label="New Department"
        value={form.toDepartment.trim() || record.department || "—"}
      />
      <TransferLetterPreviewBlock label="Effective Date" value={formatDate(effectiveTs)} />
      <TransferLetterPreviewBlock label="Reason" value={form.reason} />

      {form.reportingManager.trim() && (
        <TransferLetterPreviewBlock label="New Reporting Manager" value={form.reportingManager} />
      )}

      {form.remarks.trim() && <TransferLetterPreviewBlock label="Remarks" value={form.remarks} />}

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button className="wm-outlineBtn" type="button" onClick={onEdit} style={{ flex: 1 }}>
          Edit
        </button>

        <button className="wm-primarybtn" type="button" onClick={onSend} style={{ flex: 1 }}>
          Send Letter
        </button>
      </div>
    </div>
  );
}
