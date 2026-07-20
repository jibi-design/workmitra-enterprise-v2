// App: Job Mitra / WorkMitra_Enterprise_v2
// File: PromotionLetterPreviewStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\promotionLetter\PromotionLetterPreviewStep.tsx

import type { HRCandidateRecord } from "../../types/hrManagement.types";
import { PromotionLetterPreviewBlock } from "./promotionLetterUi";

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
  effectiveTs: number;
  formatDate: (timestamp: number) => string;
  onEdit: () => void;
  onSend: () => void;
};

export function PromotionLetterPreviewStep({
  record,
  form,
  effectiveTs,
  formatDate,
  onEdit,
  onSend,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PromotionLetterPreviewBlock label="Employee" value={record.employeeName} />
      <PromotionLetterPreviewBlock label="Previous Designation" value={record.jobTitle} />
      <PromotionLetterPreviewBlock label="New Designation" value={form.newTitle} />
      <PromotionLetterPreviewBlock label="Previous Department" value={record.department || "—"} />
      <PromotionLetterPreviewBlock
        label="New Department"
        value={form.newDepartment.trim() || record.department || "—"}
      />
      <PromotionLetterPreviewBlock label="Effective Date" value={formatDate(effectiveTs)} />

      {form.newSalary.trim() && (
        <PromotionLetterPreviewBlock label="Salary Revision" value={form.newSalary} />
      )}

      <PromotionLetterPreviewBlock label="Reason" value={form.reason} />

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
