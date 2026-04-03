// src/features/employer/hrManagement/components/OfferLetterPreview.tsx
//
// Read-only preview of a sent offer letter.
// Used in HRCandidateDetailPage after offer is sent.

import type { OfferLetter } from "../types/hrManagement.types";

type Props = {
  offer: OfferLetter;
  employeeName: string;
  jobTitle: string;
  department: string;
  location: string;
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OfferLetterPreview({ offer, employeeName, jobTitle, department, location }: Props) {
  const responseColor =
    offer.response === "accepted"
      ? "#16a34a"
      : offer.response === "rejected"
        ? "#dc2626"
        : "#d97706";

  const responseLabel =
    offer.response === "accepted"
      ? "Accepted"
      : offer.response === "rejected"
        ? "Rejected"
        : "Awaiting Response";

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)" }}>
          Offer Letter
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            padding: "2px 8px",
            borderRadius: 999,
            background: responseColor + "14",
            color: responseColor,
            border: `1px solid ${responseColor}33`,
          }}
        >
          {responseLabel}
        </span>
      </div>

      <div style={{ fontSize: 13, color: "var(--wm-er-text)", lineHeight: 1.8 }}>
        <div><strong>To:</strong> {employeeName}</div>
        <div><strong>Position:</strong> {jobTitle}</div>
        {department && <div><strong>Department:</strong> {department}</div>}
        {location && <div><strong>Location:</strong> {location}</div>}
        <div style={{ marginTop: 10 }}><strong>Salary:</strong> {offer.salaryAmount} ({offer.salaryFrequency})</div>
        <div><strong>Joining Date:</strong> {formatDate(offer.joiningDate)}</div>
        <div><strong>Work Schedule:</strong> {offer.workSchedule || "—"}</div>
        {offer.additionalTerms && (
          <div style={{ marginTop: 10 }}>
            <strong>Additional Terms:</strong>
            <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{offer.additionalTerms}</div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: "1px solid var(--wm-er-border, #e5e7eb)",
          fontSize: 11,
          color: "var(--wm-er-muted)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div>Sent: {formatDate(offer.sentAt)}</div>
        {offer.respondedAt && <div>Responded: {formatDate(offer.respondedAt)}</div>}
        {offer.response === "rejected" && offer.rejectionReason && (
          <div style={{ marginTop: 4, color: "#dc2626" }}>
            Rejection reason: {offer.rejectionReason}
          </div>
        )}
      </div>
    </div>
  );
}