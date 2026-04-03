// src/features/employee/employment/components/OfferResponseModal.tsx
//
// 2-step modal for employee to accept or reject an offer letter.
// Step 1: Show offer details + choice
// Step 2: Confirm action (warning for reject, celebration for accept)

import { useState } from "react";
import type { HRCandidateRecord } from "../../../employer/hrManagement/types/hrManagement.types";

type Props = {
  open: boolean;
  record: HRCandidateRecord;
  onAccept: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OfferResponseModal({ open, record, onAccept, onReject, onClose }: Props) {
  const [step, setStep] = useState<"view" | "confirm_accept" | "confirm_reject">("view");
  const [rejectReason, setRejectReason] = useState("");

  if (!open || !record.offerLetter) return null;

  const offer = record.offerLetter;

  const handleClose = () => {
    setStep("view");
    setRejectReason("");
    onClose();
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 440,
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    maxHeight: "90vh",
    overflowY: "auto",
  };

  if (step === "view") {
    return (
      <div role="dialog" aria-modal="true" style={overlayStyle} onClick={handleClose}>
        <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "var(--wm-er-accent-career, #3730a3)", textTransform: "uppercase", letterSpacing: 1 }}>
              Offer Letter
            </div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-emp-text, var(--wm-er-text))", marginTop: 6 }}>
              {record.jobTitle}
            </div>
            <div style={{ fontSize: 13, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>
              {record.department ? `${record.department} · ` : ""}{record.location || ""}
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
            <div><strong>Salary:</strong> {offer.salaryAmount} ({offer.salaryFrequency})</div>
            <div><strong>Joining Date:</strong> {formatDate(offer.joiningDate)}</div>
            <div><strong>Work Schedule:</strong> {offer.workSchedule || "—"}</div>
            {offer.additionalTerms && (
              <div style={{ marginTop: 8 }}>
                <strong>Additional Terms:</strong>
                <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{offer.additionalTerms}</div>
              </div>
            )}
          </div>

          <div style={{ fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 10, textAlign: "center" }}>
            Sent on {formatDate(offer.sentAt)}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => setStep("confirm_reject")}
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
              onClick={() => setStep("confirm_accept")}
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
        </div>
      </div>
    );
  }

  if (step === "confirm_accept") {
    return (
      <div role="dialog" aria-modal="true" style={overlayStyle} onClick={handleClose}>
        <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "#16a34a" }}>
              Accept This Offer?
            </div>
            <div style={{ fontSize: 13, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 8, lineHeight: 1.5 }}>
              You are accepting the position of <strong>{record.jobTitle}</strong> with a salary of <strong>{offer.salaryAmount} ({offer.salaryFrequency})</strong> starting <strong>{formatDate(offer.joiningDate)}</strong>.
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
            ✓ After accepting, your employer will start the onboarding process. Your verified work history will be updated automatically.
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setStep("view")}
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
              onClick={() => { onAccept(); handleClose(); }}
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
        </div>
      </div>
    );
  }

  /* confirm_reject */
  return (
    <div role="dialog" aria-modal="true" style={overlayStyle} onClick={handleClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 900, fontSize: 16, color: "#dc2626", marginBottom: 4 }}>
          Reject This Offer?
        </div>
        <div style={{ fontSize: 13, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginBottom: 14, lineHeight: 1.5 }}>
          Are you sure you want to reject the offer for <strong>{record.jobTitle}</strong>? This action cannot be undone.
        </div>

        <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-emp-text, var(--wm-er-text))", display: "block", marginBottom: 4 }}>
          Reason (optional)
        </label>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
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
          ⚠ Once rejected, you cannot accept this offer again. The employer will be notified.
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => setStep("view")}
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
            onClick={() => { onReject(rejectReason.trim()); handleClose(); }}
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
      </div>
    </div>
  );
}
