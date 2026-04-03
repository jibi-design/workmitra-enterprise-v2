// src/features/employer/hrManagement/components/ExperienceLetterModal.tsx
//
// Auto-generates experience letter from HR data.
// 2-step: auto-filled preview → edit → send.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { ExperienceLetterData } from "../types/letterTemplates.types";
import { letterTemplatesStorage } from "../storage/letterTemplates.storage";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { performanceReviewStorage } from "../storage/performanceReview.storage";
import { RATING_LABELS } from "../types/performanceReview.types";
import type { ReviewRating } from "../types/performanceReview.types";

type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
};

export function ExperienceLetterModal({ open, onClose, record }: Props) {
  const [step, setStep] = useState<"form" | "preview">("form");

  const [nowMs] = useState(() => Date.now());
  const joiningDate = record.offerLetter?.joiningDate ?? record.movedToHRAt;
  const exitDate = record.exitData?.initiatedAt ?? nowMs;

  // Auto-generate performance summary from reviews
  const avgRating = performanceReviewStorage.getAverageRating(record.id);
  const autoPerformance = avgRating
    ? `Average rating: ${avgRating}/5 — ${RATING_LABELS[Math.round(avgRating) as ReviewRating] || "N/A"}`
    : "Performance was satisfactory during the tenure.";

  const [duties, setDuties] = useState(`Worked as ${record.jobTitle} in the ${record.department || "General"} department.`);
  const [performance, setPerformance] = useState(autoPerformance);

  if (!open) return null;

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const handleSend = () => {
    const letterData: ExperienceLetterData = {
      employeeName: record.employeeName,
      jobTitle: record.jobTitle,
      department: record.department || "General",
      joiningDate,
      exitDate,
      duties: duties.trim(),
      performance: performance.trim(),
    };

    letterTemplatesStorage.createLetter({
      hrCandidateId: record.id,
      employeeUniqueId: record.employeeUniqueId,
      employeeName: record.employeeName,
      kind: "experience",
      letterData: { kind: "experience", data: letterData },
    });

    // Mark experience letter as sent in exit data
    hrManagementStorage.markExperienceLetterSent(record.id);

    setStep("form");
    onClose();
  };

  const handleClose = () => {
    setStep("form");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px 16px 0 0",
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflow: "auto",
          padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
            {step === "form" ? "Experience Letter" : "Preview & Send"}
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--wm-er-muted)" }}
          >
            ×
          </button>
        </div>

        {step === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 10, borderRadius: 8, background: "var(--wm-er-bg, #f9fafb)", fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--wm-er-text)" }}>Auto-filled from HR records.</strong> You can edit the details below before sending.
            </div>

            <PreviewBlock label="Employee" value={record.employeeName} />
            <PreviewBlock label="Designation" value={record.jobTitle} />
            <PreviewBlock label="Department" value={record.department || "General"} />
            <PreviewBlock label="Joining Date" value={fmtDate(joiningDate)} />
            <PreviewBlock label="Exit Date" value={fmtDate(exitDate)} />

            <div>
              <FieldLabel text="Key Duties & Responsibilities" />
              <textarea
                value={duties}
                onChange={(e) => setDuties(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div>
              <FieldLabel text="Performance Summary" />
              <textarea
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
              💡 This experience letter will be app-verified and added to the employee's Work Vault. It cannot be faked or modified after sending.
            </div>

            <button className="wm-primarybtn" type="button" onClick={() => setStep("preview")} disabled={!duties.trim() || !performance.trim()}>
              Preview Letter
            </button>
          </div>
        )}

        {step === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <PreviewBlock label="Employee" value={record.employeeName} />
            <PreviewBlock label="Designation" value={record.jobTitle} />
            <PreviewBlock label="Department" value={record.department || "General"} />
            <PreviewBlock label="Period" value={`${fmtDate(joiningDate)} — ${fmtDate(exitDate)}`} />
            <PreviewBlock label="Duties" value={duties} />
            <PreviewBlock label="Performance" value={performance} />

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="wm-outlineBtn" type="button" onClick={() => setStep("form")} style={{ flex: 1 }}>
                ← Edit
              </button>
              <button className="wm-primarybtn" type="button" onClick={handleSend} style={{ flex: 1 }}>
                Send Letter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
      {text}
    </div>
  );
}

function PreviewBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 10, borderRadius: 8, background: "var(--wm-er-bg, #f9fafb)" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginTop: 2, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 600,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  color: "var(--wm-er-text)",
  background: "#fff",
  boxSizing: "border-box",
};