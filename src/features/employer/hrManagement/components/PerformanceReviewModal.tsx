// src/features/employer/hrManagement/components/PerformanceReviewModal.tsx
//
// 2-step modal: Fill form → Preview → Send performance review.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { ReviewType, ReviewRating } from "../types/performanceReview.types";
import { REVIEW_TYPE_LABELS, RATING_LABELS, RATING_COLORS } from "../types/performanceReview.types";
import { performanceReviewStorage } from "../storage/performanceReview.storage";
import { FieldLabel, Field, PreviewBlock } from "./PerformanceReviewFormParts";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
};

type FormState = {
  reviewType: ReviewType;
  periodFrom: string;
  periodTo: string;
  rating: ReviewRating | 0;
  strengths: string;
  improvements: string;
  goalsNextPeriod: string;
  overallComments: string;
};

const INITIAL_FORM: FormState = {
  reviewType: "quarterly",
  periodFrom: "",
  periodTo: "",
  rating: 0,
  strengths: "",
  improvements: "",
  goalsNextPeriod: "",
  overallComments: "",
};

const REVIEW_TYPES: ReviewType[] = ["probation", "quarterly", "half_yearly", "annual"];

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "10px 12px", fontSize: 13, fontWeight: 600,
  border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 8,
  outline: "none", color: "var(--wm-er-text)", background: "#fff", boxSizing: "border-box",
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function PerformanceReviewModal({ open, onClose, record }: Props) {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  if (!open) return null;

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const canPreview =
    form.periodFrom && form.periodTo &&
    form.rating >= 1 && form.rating <= 5 &&
    form.strengths.trim() && form.overallComments.trim();

  const toTs = (d: string) => (d ? new Date(d + "T00:00:00").getTime() : 0);
  const fmtDate = (ts: number) =>
    ts ? new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "–";

  const handleSend = () => {
    if (!canPreview || form.rating < 1) return;
    performanceReviewStorage.createReview({
      hrCandidateId: record.id,
      employeeUniqueId: record.employeeUniqueId,
      employeeName: record.employeeName,
      jobTitle: record.jobTitle,
      reviewType: form.reviewType,
      periodFrom: toTs(form.periodFrom),
      periodTo: toTs(form.periodTo),
      rating: form.rating as ReviewRating,
      strengths: form.strengths.trim(),
      improvements: form.improvements.trim(),
      goalsNextPeriod: form.goalsNextPeriod.trim(),
      overallComments: form.overallComments.trim(),
    });
    setForm(INITIAL_FORM);
    setStep("form");
    onClose();
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setStep("form");
    onClose();
  };

  const ratingVal = form.rating as ReviewRating;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div style={{
        background: "#fff", borderRadius: "16px 16px 0 0",
        width: "100%", maxWidth: 480, maxHeight: "90vh", overflow: "auto", padding: 20,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
            {step === "form" ? "Performance Review" : "Preview & Send"}
          </div>
          <button type="button" onClick={handleClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--wm-er-muted)" }}>
            ×
          </button>
        </div>

        {step === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 10, borderRadius: 8, background: "var(--wm-er-bg, #f9fafb)", fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--wm-er-text)" }}>{record.employeeName}</strong> · {record.jobTitle}
            </div>

            <div>
              <FieldLabel text="Review Type *" />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {REVIEW_TYPES.map((rt) => (
                  <button key={rt} type="button" onClick={() => set("reviewType", rt)}
                    style={{
                      padding: "6px 12px", fontSize: 11, fontWeight: 800, borderRadius: 6,
                      border: `1.5px solid ${form.reviewType === rt ? "var(--wm-er-accent-hr)" : "var(--wm-er-border, #e5e7eb)"}`,
                      background: form.reviewType === rt ? "rgba(124, 58, 237, 0.06)" : "#fff",
                      color: form.reviewType === rt ? "var(--wm-er-accent-hr)" : "var(--wm-er-muted)",
                      cursor: "pointer",
                    }}>
                    {REVIEW_TYPE_LABELS[rt]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <FieldLabel text="Period From *" />
                <input type="date" value={form.periodFrom} onChange={(e) => set("periodFrom", e.target.value)} style={INPUT_STYLE} />
              </div>
              <div>
                <FieldLabel text="Period To *" />
                <input type="date" value={form.periodTo} onChange={(e) => set("periodTo", e.target.value)} style={INPUT_STYLE} />
              </div>
            </div>

            <div>
              <FieldLabel text="Overall Rating *" />
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {([1, 2, 3, 4, 5] as ReviewRating[]).map((r) => (
                  <button key={r} type="button" onClick={() => set("rating", r)}
                    style={{
                      width: 44, height: 44, borderRadius: 8,
                      border: `2px solid ${form.rating === r ? RATING_COLORS[r] : "var(--wm-er-border, #e5e7eb)"}`,
                      background: form.rating === r ? `${RATING_COLORS[r]}12` : "#fff",
                      color: form.rating === r ? RATING_COLORS[r] : "var(--wm-er-muted)",
                      fontWeight: 900, fontSize: 16, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    {r}
                  </button>
                ))}
              </div>
              {form.rating >= 1 && form.rating <= 5 && (
                <div style={{ fontSize: 11, fontWeight: 800, color: RATING_COLORS[ratingVal], marginTop: 6 }}>
                  {RATING_LABELS[ratingVal]}
                </div>
              )}
            </div>

            <Field label="Strengths *" value={form.strengths} onChange={(v) => set("strengths", v)} placeholder="Key strengths observed during this period" multiline />
            <Field label="Areas for Improvement (optional)" value={form.improvements} onChange={(v) => set("improvements", v)} placeholder="Areas where improvement is expected" multiline />
            <Field label="Goals for Next Period (optional)" value={form.goalsNextPeriod} onChange={(v) => set("goalsNextPeriod", v)} placeholder="Targets and objectives for the next review period" multiline />
            <Field label="Overall Comments *" value={form.overallComments} onChange={(v) => set("overallComments", v)} placeholder="Summary of overall performance" multiline />

            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.5, padding: "4px 0" }}>
              The employee will receive this review and can acknowledge or raise a dispute.
            </div>

            <button className="wm-primarybtn" type="button" disabled={!canPreview} onClick={() => setStep("preview")}>
              Preview Review
            </button>
          </div>
        )}

        {step === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <PreviewBlock label="Employee" value={`${record.employeeName} · ${record.jobTitle}`} />
            <PreviewBlock label="Review Type" value={REVIEW_TYPE_LABELS[form.reviewType]} />
            <PreviewBlock label="Review Period" value={`${fmtDate(toTs(form.periodFrom))} – ${fmtDate(toTs(form.periodTo))}`} />

            <div style={{ padding: 10, borderRadius: 8, background: "var(--wm-er-bg, #f9fafb)" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Rating</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} style={{ fontSize: 18, color: s <= (form.rating as number) ? RATING_COLORS[ratingVal] : "#e5e7eb" }}>★</span>
                  ))}
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: RATING_COLORS[ratingVal] }}>
                  {form.rating}/5 – {RATING_LABELS[ratingVal]}
                </span>
              </div>
            </div>

            <PreviewBlock label="Strengths" value={form.strengths} />
            {form.improvements.trim() && <PreviewBlock label="Areas for Improvement" value={form.improvements} />}
            {form.goalsNextPeriod.trim() && <PreviewBlock label="Goals for Next Period" value={form.goalsNextPeriod} />}
            <PreviewBlock label="Overall Comments" value={form.overallComments} />

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="wm-outlineBtn" type="button" onClick={() => setStep("form")} style={{ flex: 1 }}>← Edit</button>
              <button className="wm-primarybtn" type="button" onClick={handleSend} style={{ flex: 1 }}>Send Review</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
