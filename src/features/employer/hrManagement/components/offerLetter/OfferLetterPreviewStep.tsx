// App: Job Mitra / WorkMitra_Enterprise_v2
// File: OfferLetterPreviewStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\offerLetter\OfferLetterPreviewStep.tsx

import type { HRCandidateRecord } from "../../types/hrManagement.types";
import type { OfferLetterSalaryFrequency } from "./OfferLetterFormStep";

type Props = {
  record: HRCandidateRecord;
  salaryAmount: string;
  salaryFrequency: OfferLetterSalaryFrequency;
  joiningDateTs: number;
  workSchedule: string;
  additionalTerms: string;
  formatDateDisplay: (timestamp: number) => string;
  onEdit: () => void;
  onSend: () => void;
};

export function OfferLetterPreviewStep({
  record,
  salaryAmount,
  salaryFrequency,
  joiningDateTs,
  workSchedule,
  additionalTerms,
  formatDateDisplay,
  onEdit,
  onSend,
}: Props) {
  return (
    <div>
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "2px solid var(--wm-er-accent-hr)",
          background: "#fff",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "var(--wm-er-accent-hr)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Offer Letter
          </div>
        </div>

        <div style={{ fontSize: 13, color: "var(--wm-er-text)", lineHeight: 1.8 }}>
          <div>
            <strong>To:</strong> {record.employeeName}
          </div>

          <div>
            <strong>Position:</strong> {record.jobTitle}
          </div>

          {record.department && (
            <div>
              <strong>Department:</strong> {record.department}
            </div>
          )}

          {record.location && (
            <div>
              <strong>Location:</strong> {record.location}
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <strong>Salary:</strong> {salaryAmount} ({salaryFrequency})
          </div>

          <div>
            <strong>Joining Date:</strong> {formatDateDisplay(joiningDateTs)}
          </div>

          <div>
            <strong>Work Schedule:</strong> {workSchedule || "—"}
          </div>

          {additionalTerms && (
            <div style={{ marginTop: 10 }}>
              <strong>Additional Terms:</strong>
              <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{additionalTerms}</div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 10,
          borderRadius: 8,
          background: "rgba(217, 119, 6, 0.06)",
          border: "1px solid rgba(217, 119, 6, 0.15)",
          fontSize: 11,
          color: "#92400e",
          lineHeight: 1.5,
          fontWeight: 700,
        }}
      >
        Warning: Once sent, this offer letter cannot be edited. The candidate will be notified
        immediately and can accept or reject it.
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <button className="wm-outlineBtn" type="button" onClick={onEdit}>
          Edit
        </button>

        <button className="wm-primarybtn" type="button" onClick={onSend}>
          Send Offer Letter
        </button>
      </div>
    </div>
  );
}
