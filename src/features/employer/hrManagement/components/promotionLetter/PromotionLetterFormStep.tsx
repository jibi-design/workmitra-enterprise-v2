// App: Job Mitra / WorkMitra_Enterprise_v2
// File: PromotionLetterFormStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\promotionLetter\PromotionLetterFormStep.tsx

import type { HRCandidateRecord } from "../../types/hrManagement.types";
import { PromotionLetterDateField, PromotionLetterField } from "./promotionLetterUi";

type PromotionLetterFormValues = {
  newTitle: string;
  newDepartment: string;
  effectiveDate: string;
  newSalary: string;
  reason: string;
};

type Props = {
  record: HRCandidateRecord;
  form: PromotionLetterFormValues;
  canPreview: boolean | string;
  onFieldChange: (key: keyof PromotionLetterFormValues, value: string) => void;
  onPreview: () => void;
};

export function PromotionLetterFormStep({
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
        <strong style={{ color: "var(--wm-er-text)" }}>Current:</strong> {record.jobTitle}
        {record.department ? ` · ${record.department}` : ""}
      </div>

      <PromotionLetterField
        label="New Designation / Title *"
        value={form.newTitle}
        onChange={(value) => onFieldChange("newTitle", value)}
        placeholder="e.g. Senior Manager"
      />

      <PromotionLetterField
        label="New Department (leave blank if same)"
        value={form.newDepartment}
        onChange={(value) => onFieldChange("newDepartment", value)}
        placeholder={record.department || "e.g. Operations"}
      />

      <PromotionLetterDateField
        value={form.effectiveDate}
        onChange={(value) => onFieldChange("effectiveDate", value)}
      />

      <PromotionLetterField
        label="Revised Salary Note (optional, no currency)"
        value={form.newSalary}
        onChange={(value) => onFieldChange("newSalary", value)}
        placeholder="e.g. As per revised pay structure"
      />

      <PromotionLetterField
        label="Reason for Promotion *"
        value={form.reason}
        onChange={(value) => onFieldChange("reason", value)}
        placeholder="e.g. Outstanding performance in Q4"
        multiline
      />

      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.5, padding: "4px 0" }}>
        Note: Sending this letter will automatically update the employee&apos;s designation
        {form.newDepartment.trim() ? " and department" : ""} in their HR record.
      </div>

      <button className="wm-primarybtn" type="button" disabled={!canPreview} onClick={onPreview}>
        Preview Letter
      </button>
    </div>
  );
}
