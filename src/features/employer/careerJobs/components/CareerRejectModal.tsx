// src/features/employer/careerJobs/components/CareerRejectModal.tsx
//
// Modal for rejecting a candidate with an optional/required reason.
// Reason is mandatory when rejecting from interview or offered stage.
// Uses shared CenterModal shell.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { CareerApplicationStage } from "../types/careerTypes";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  candidateName: string;
  currentStage: CareerApplicationStage;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CareerRejectModal({ open, candidateName, currentStage, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState("");

  const requiresReason = currentStage === "interview" || currentStage === "offered";
  const canSubmit = !requiresReason || reason.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(reason.trim());
    resetAndClose();
  }

  function resetAndClose() {
    setReason("");
    onClose();
  }

  const stageLabel =
    currentStage === "interview"
      ? "in interview stage"
      : currentStage === "offered"
        ? "after sending offer"
        : "";

  return (
    <CenterModal open={open} onBackdropClose={resetAndClose} ariaLabel="Reject Candidate">
      <div style={{ padding: 20 }}>
        {/* Header */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 1000,
            color: "var(--wm-error, #dc2626)",
            marginBottom: 4,
          }}
        >
          Reject Candidate
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 16 }}>
          {candidateName}
          {stageLabel ? ` (${stageLabel})` : ""}
        </div>

        {/* Warning for advanced stages */}
        {requiresReason && (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(220,38,38,0.04)",
              border: "1px solid rgba(220,38,38,0.15)",
              fontSize: 12,
              color: "var(--wm-error, #dc2626)",
              fontWeight: 700,
            }}
          >
            A reason is required when rejecting a candidate {stageLabel}.
            The candidate will be notified with this reason.
          </div>
        )}

        {/* Reason */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 4 }}>
            Reason{requiresReason ? " *" : " (optional)"}
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              requiresReason
                ? "Please provide the reason for rejection..."
                : "Optionally provide a reason..."
            }
            rows={3}
            style={{
              width: "100%",
              fontSize: 13,
              fontWeight: 700,
              padding: "10px 12px",
              borderRadius: 10,
              border: requiresReason && reason.trim().length === 0
                ? "1.5px solid var(--wm-error, #dc2626)"
                : "1.5px solid var(--wm-er-border)",
              background: "var(--wm-er-bg)",
              color: "var(--wm-er-text)",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={resetAndClose}
            style={{ fontSize: 13, height: 38, padding: "0 16px" }}
          >
            Cancel
          </button>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              fontSize: 13,
              padding: "8px 20px",
              background: "var(--wm-error, #dc2626)",
              opacity: canSubmit ? 1 : 0.5,
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </CenterModal>
  );
}