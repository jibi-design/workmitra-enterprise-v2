// src/features/employer/myStaff/components/ExitProcessingSteps.tsx

import type { CSSProperties } from "react";
import type { StaffExitReason } from "../storage/myStaff.storage";

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const EXIT_REASONS: { value: StaffExitReason; label: string }[] = [
  { value: "terminated", label: "Termination" },
  { value: "layoff", label: "Layoff" },
  { value: "contract_end", label: "Contract End" },
  { value: "mutual_agreement", label: "Mutual Agreement" },
];

/* ------------------------------------------------ */
/* Shared Props                                     */
/* ------------------------------------------------ */
type StepHeaderProps = {
  step: number;
  title: string;
  titleColor?: string;
  employeeName: string;
  jobTitle: string;
};

type BtnRowProps = {
  backLabel: string;
  onBack: () => void;
  nextLabel: string;
  onNext: () => void;
  nextEnabled: boolean;
  cancelBtn: CSSProperties;
  nextBtn: (enabled: boolean) => CSSProperties;
};

/* ------------------------------------------------ */
/* Step Header                                      */
/* ------------------------------------------------ */
function StepHeader({ step, title, titleColor, employeeName, jobTitle }: StepHeaderProps) {
  return (
    <>
      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", marginBottom: 12 }}>
        Step {step} of 4
      </div>
      <div style={{ fontWeight: 900, fontSize: 16, color: titleColor ?? "#dc2626", marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginBottom: 16 }}>
        {employeeName} – {jobTitle}
      </div>
    </>
  );
}

/* ------------------------------------------------ */
/* Button Row                                       */
/* ------------------------------------------------ */
function BtnRow({ backLabel, onBack, nextLabel, onNext, nextEnabled, cancelBtn, nextBtn }: BtnRowProps) {
  return (
    <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 }}>
      <button type="button" onClick={onBack} style={cancelBtn}>{backLabel}</button>
      <button type="button" onClick={onNext} disabled={!nextEnabled} style={nextBtn(nextEnabled)}>
        {nextLabel}
      </button>
    </div>
  );
}

/* ------------------------------------------------ */
/* Step 1: Reason                                   */
/* ------------------------------------------------ */
type Step1Props = {
  employeeName: string;
  jobTitle: string;
  reason: StaffExitReason | "";
  onReasonChange: (r: StaffExitReason) => void;
  onNext: () => void;
  onCancel: () => void;
  cancelBtn: CSSProperties;
  nextBtn: (e: boolean) => CSSProperties;
};

export function ExitStep1({ employeeName, jobTitle, reason, onReasonChange, onNext, onCancel, cancelBtn, nextBtn }: Step1Props) {
  return (
    <>
      <StepHeader step={1} title="End Employment" employeeName={employeeName} jobTitle={jobTitle} />
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 10 }}>
        Select reason for ending employment:
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {EXIT_REASONS.map((r) => (
          <button key={r.value} type="button" onClick={() => onReasonChange(r.value)}
            style={{
              padding: "12px 14px", borderRadius: 10,
              border: reason === r.value ? "2px solid #dc2626" : "1.5px solid rgba(0,0,0,0.1)",
              background: reason === r.value ? "rgba(220,38,38,0.06)" : "transparent",
              color: "var(--wm-er-text)", fontWeight: 800, fontSize: 13, textAlign: "left", cursor: "pointer",
            }}>
            {r.label}
          </button>
        ))}
      </div>
      <BtnRow backLabel="Cancel" onBack={onCancel} nextLabel="Next" onNext={onNext} nextEnabled={!!reason} cancelBtn={cancelBtn} nextBtn={nextBtn} />
    </>
  );
}

/* ------------------------------------------------ */
/* Step 2: Date                                     */
/* ------------------------------------------------ */
type Step2Props = {
  employeeName: string;
  jobTitle: string;
  dateStr: string;
  onDateChange: (d: string) => void;
  todayStr: string;
  dateValid: boolean;
  onNext: () => void;
  onBack: () => void;
  cancelBtn: CSSProperties;
  nextBtn: (e: boolean) => CSSProperties;
};

export function ExitStep2({ employeeName, jobTitle, dateStr, onDateChange, todayStr, dateValid, onNext, onBack, cancelBtn, nextBtn }: Step2Props) {
  return (
    <>
      <StepHeader step={2} title="Last Working Date" employeeName={employeeName} jobTitle={jobTitle} />
      <input type="date" value={dateStr} max={todayStr} onChange={(e) => onDateChange(e.target.value)}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 10,
          border: "1.5px solid rgba(0,0,0,0.12)", fontSize: 14, fontWeight: 700,
          color: "var(--wm-er-text)", background: "#f8fafc", outline: "none", boxSizing: "border-box",
        }} />
      <BtnRow backLabel="Back" onBack={onBack} nextLabel="Next" onNext={onNext} nextEnabled={dateValid} cancelBtn={cancelBtn} nextBtn={nextBtn} />
    </>
  );
}

/* ------------------------------------------------ */
/* Step 3: Rating                                   */
/* ------------------------------------------------ */
type Step3Props = {
  employeeName: string;
  jobTitle: string;
  rating: number;
  onRatingChange: (r: number) => void;
  comment: string;
  onCommentChange: (c: string) => void;
  onNext: () => void;
  onBack: () => void;
  cancelBtn: CSSProperties;
  nextBtn: (e: boolean) => CSSProperties;
};

export function ExitStep3({ employeeName, jobTitle, rating, onRatingChange, comment, onCommentChange, onNext, onBack, cancelBtn, nextBtn }: Step3Props) {
  return (
    <>
      <StepHeader step={3} title="Rate Employee" titleColor="var(--wm-er-text)" employeeName={employeeName} jobTitle={jobTitle} />
      <div style={{
        fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5, marginBottom: 12,
        padding: "8px 12px", background: "rgba(37,99,235,0.05)",
        border: "1px solid rgba(37,99,235,0.12)", borderRadius: 8,
      }}>
        Rate this employee based on their work performance. Tap a star to select your rating – this is required to proceed. Your rating will be visible on their verified work history.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onRatingChange(star)}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            style={{
              fontSize: 28, background: "none", border: "none", cursor: "pointer",
              color: star <= rating ? "#f59e0b" : "#d1d5db", padding: 2,
            }}>
            ★
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Comment (optional)" maxLength={500} rows={3}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 10,
          border: "1.5px solid rgba(0,0,0,0.12)", fontSize: 13, fontWeight: 700,
          color: "var(--wm-er-text)", background: "#f8fafc", outline: "none",
          resize: "vertical", boxSizing: "border-box",
        }} />
      <BtnRow backLabel="Back" onBack={onBack} nextLabel="Next" onNext={onNext} nextEnabled={rating > 0} cancelBtn={cancelBtn} nextBtn={nextBtn} />
    </>
  );
}

/* ------------------------------------------------ */
/* Step 4: Done                                     */
/* ------------------------------------------------ */
type Step4Props = {
  employeeName: string;
  onDone: () => void;
};

export function ExitStep4({ employeeName, onDone }: Step4Props) {
  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#16a34a" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" />
      </svg>
      <div style={{ fontWeight: 900, fontSize: 16, color: "#16a34a", marginTop: 10 }}>Exit Processed</div>
      <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 6, lineHeight: 1.5 }}>
        {employeeName}'s employment has been ended. Their verified work history has been updated.
      </div>
      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
        <button type="button" onClick={onDone}
          style={{
            padding: "12px 28px", borderRadius: 10, border: "none",
            background: "#16a34a", color: "#fff", fontWeight: 900, fontSize: 14, cursor: "pointer",
          }}>
          Done
        </button>
      </div>
    </div>
  );
}