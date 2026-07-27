// App: Job Mitra / WorkMitra_Enterprise_v2
// File: OfferResponseViewStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\offerResponse\OfferResponseViewStep.tsx

import type { HRCandidateRecord } from "../../../../shared/hr/hrPublic";

type OfferLetter = NonNullable<HRCandidateRecord["offerLetter"]>;

type Props = {
  record: HRCandidateRecord;
  offer: OfferLetter;
  formatDate: (timestamp: number) => string;
  onRejectClick: () => void;
  onAcceptClick: () => void;
};

export function OfferResponseViewStep({
  record,
  offer,
  formatDate,
  onRejectClick,
  onAcceptClick,
}: Props) {
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: "var(--wm-er-accent-career, #3730a3)",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Offer Letter
        </div>

        <div
          style={{
            fontWeight: 900,
            fontSize: 16,
            color: "var(--wm-emp-text, var(--wm-er-text))",
            marginTop: 6,
          }}
        >
          {record.jobTitle}
        </div>

        <div
          style={{ fontSize: 13, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}
        >
          {record.department ? `${record.department} · ` : ""}
          {record.location || ""}
        </div>
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 10,
          border: "1px solid var(--wm-er-border, #e5e7eb)",
          fontSize: 13,
          color: "var(--wm-emp-text, var(--wm-er-text))",
          lineHeight: 1.8,
        }}
      >
        <div>
          <strong>Salary:</strong> {offer.salaryAmount} ({offer.salaryFrequency})
        </div>

        <div>
          <strong>Joining Date:</strong> {formatDate(offer.joiningDate)}
        </div>

        <div>
          <strong>Work Schedule:</strong> {offer.workSchedule || "—"}
        </div>

        {offer.additionalTerms && (
          <div style={{ marginTop: 8 }}>
            <strong>Additional Terms:</strong>
            <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{offer.additionalTerms}</div>
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "var(--wm-emp-muted, var(--wm-er-muted))",
          marginTop: 10,
          textAlign: "center",
        }}
      >
        Sent on {formatDate(offer.sentAt)}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onRejectClick}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 10,
            border: "2px solid #dc2626",
            background: "rgba(220,38,38,0.06)",
            color: "#dc2626",
            fontWeight: 900,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Reject Offer
        </button>

        <button
          type="button"
          onClick={onAcceptClick}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: "#16a34a",
            color: "#fff",
            fontWeight: 900,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Accept Offer
        </button>
      </div>
    </>
  );
}
