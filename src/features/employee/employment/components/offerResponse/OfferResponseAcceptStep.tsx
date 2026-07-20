// App: Job Mitra / WorkMitra_Enterprise_v2
// File: OfferResponseAcceptStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\offerResponse\OfferResponseAcceptStep.tsx

import type { HRCandidateRecord } from "../../../../employer/hrManagement/types/hrManagement.types";

type OfferLetter = NonNullable<HRCandidateRecord["offerLetter"]>;

type Props = {
  record: HRCandidateRecord;
  offer: OfferLetter;
  formatDate: (timestamp: number) => string;
  onBack: () => void;
  onConfirmAccept: () => void;
};

export function OfferResponseAcceptStep({
  record,
  offer,
  formatDate,
  onBack,
  onConfirmAccept,
}: Props) {
  return (
    <>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: "#16a34a" }}>Accept This Offer?</div>

        <div
          style={{
            fontSize: 13,
            color: "var(--wm-emp-muted, var(--wm-er-muted))",
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          You are accepting the position of <strong>{record.jobTitle}</strong> with a salary of{" "}
          <strong>
            {offer.salaryAmount} ({offer.salaryFrequency})
          </strong>{" "}
          starting <strong>{formatDate(offer.joiningDate)}</strong>.
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 10,
          borderRadius: 8,
          background: "rgba(22, 163, 74, 0.06)",
          border: "1px solid rgba(22, 163, 74, 0.15)",
          fontSize: 11,
          color: "#166534",
          lineHeight: 1.5,
          fontWeight: 700,
        }}
      >
        After accepting, your employer will start the onboarding process. Your verified work history
        will be updated automatically.
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "1.5px solid rgba(0,0,0,0.12)",
            background: "transparent",
            fontWeight: 800,
            fontSize: 13,
            color: "var(--wm-emp-text, var(--wm-er-text))",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>

        <button
          type="button"
          onClick={onConfirmAccept}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            border: "none",
            background: "#16a34a",
            color: "#fff",
            fontWeight: 900,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Confirm Accept
        </button>
      </div>
    </>
  );
}
