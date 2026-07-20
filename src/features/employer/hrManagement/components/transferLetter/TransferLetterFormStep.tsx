// App: Job Mitra / WorkMitra_Enterprise_v2
// File: TransferLetterFormStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\transferLetter\TransferLetterFormStep.tsx

import type { HRCandidateRecord } from "../../types/hrManagement.types";
import { TransferLetterField } from "./transferLetterUi";

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
  canPreview: boolean | string;
  onFieldChange: (key: keyof TransferLetterFormValues, value: string) => void;
  onPreview: () => void;
};

export function TransferLetterFormStep({
  record,
  form,
  canPreview,
  onFieldChange,
  onPreview,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          padding: 10,
          borderRadius: 8,
          background: "var(--wm-er-bg, #f9fafb)",
          fontSize: 12,
          color: "var(--wm-er-muted)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--wm-er-text)" }}>Current:</strong> {record.location || "—"}
        {record.department ? ` · ${record.department}` : ""}
      </div>

      <TransferLetterField
        label="Transfer To — Location *"
        value={form.toLocation}
        onChange={(value) => onFieldChange("toLocation", value)}
        placeholder="e.g. Branch Office — North Region"
      />

      <TransferLetterField
        label="New Department (leave blank if same)"
        value={form.toDepartment}
        onChange={(value) => onFieldChange("toDepartment", value)}
        placeholder={record.department || "e.g. Logistics"}
      />

      <TransferLetterField
        label="Effective Date *"
        type="date"
        value={form.effectiveDate}
        onChange={(value) => onFieldChange("effectiveDate", value)}
      />

      <TransferLetterField
        label="Reason for Transfer *"
        value={form.reason}
        onChange={(value) => onFieldChange("reason", value)}
        placeholder="e.g. Operational requirement"
        multiline
      />

      <TransferLetterField
        label="Reporting Manager at New Location (optional)"
        value={form.reportingManager}
        onChange={(value) => onFieldChange("reportingManager", value)}
        placeholder="e.g. Sarah Johnson"
      />

      <TransferLetterField
        label="Additional Remarks (optional)"
        value={form.remarks}
        onChange={(value) => onFieldChange("remarks", value)}
        placeholder="Any additional notes"
        multiline
      />

      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.5, padding: "4px 0" }}>
        Note: Sending this letter will automatically update the employee&apos;s location
        {form.toDepartment.trim() ? " and department" : ""} in their HR record.
      </div>

      <button className="wm-primarybtn" type="button" disabled={!canPreview} onClick={onPreview}>
        Preview Letter
      </button>
    </div>
  );
}
