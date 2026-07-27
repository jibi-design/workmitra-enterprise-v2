// App: Job Mitra / WorkMitra_Enterprise_v2
// File: OfferResponseRejectStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\offerResponse\OfferResponseRejectStep.tsx

import type { HRCandidateRecord } from "../../../../shared/hr/hrPublic";

type Props = {
  record: HRCandidateRecord;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  onBack: () => void;
  onConfirmReject: () => void;
};

export function OfferResponseRejectStep({
  record,
  rejectReason,
  onRejectReasonChange,
  onBack,
  onConfirmReject,
}: Props) {
  return (
    <>
      <div style={{ fontWeight: 900, fontSize: 16, color: "#dc2626", marginBottom: 4 }}>
        Reject This Offer?
      </div>

      <div
        style={{
          fontSize: 13,
          color: "var(--wm-emp-muted, var(--wm-er-muted))",
          marginBottom: 14,
          lineHeight: 1.5,
        }}
      >
        Are you sure you want to reject the offer for <strong>{record.jobTitle}</strong>? This
        action cannot be undone.
      </div>

      <label
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "var(--wm-emp-text, var(--wm-er-text))",
          display: "block",
          marginBottom: 4,
        }}
      >
        Reason (optional)
      </label>

      <textarea
        value={rejectReason}
        onChange={(event) => onRejectReasonChange(event.target.value)}
        placeholder="Why are you rejecting? (optional)"
        maxLength={500}
        rows={3}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1.5px solid rgba(0,0,0,0.12)",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--wm-emp-text, var(--wm-er-text))",
          background: "var(--wm-emp-surface, #f8fafc)",
          outline: "none",
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          marginTop: 12,
          padding: 10,
          borderRadius: 8,
          background: "rgba(220,38,38,0.06)",
          border: "1px solid rgba(220,38,38,0.15)",
          fontSize: 11,
          color: "#991b1b",
          lineHeight: 1.5,
          fontWeight: 700,
        }}
      >
        Warning: Once rejected, you cannot accept this offer again. The employer will be notified.
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
          onClick={onConfirmReject}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            border: "none",
            background: "#dc2626",
            color: "#fff",
            fontWeight: 900,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Reject Offer
        </button>
      </div>
    </>
  );
}
