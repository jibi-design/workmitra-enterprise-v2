// src/features/employer/careerJobs/components/CareerCreatePageControls.tsx
//
// Progress bar + validation errors + action buttons for career create wizard.

import { CAREER_CREATE_STEPS } from "../helpers/careerCreateFormHelpers";

function IconArrowLeft() { return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" /></svg>; }
function IconArrowRight() { return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8Z" /></svg>; }
function IconCheck() { return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" /></svg>; }

/* ── Progress Bar ──────────────────────────────── */

export function CareerCreateProgressBar({ step, onGoToStep }: {
  step: number;
  onGoToStep: (s: number) => void;
}) {
  return (
    <div style={{
      marginTop: 12, display: "flex", gap: 0, borderRadius: "var(--wm-radius-14)",
      border: "1px solid var(--wm-er-border)", overflow: "hidden", background: "var(--wm-er-card)",
    }}>
      {CAREER_CREATE_STEPS.map((s) => {
        const isActive = s.num === step;
        const isDone = s.num < step;
        return (
          <button key={s.num} type="button"
            onClick={() => { if (s.num < step) onGoToStep(s.num); }}
            style={{
              flex: 1, padding: "12px 8px", border: "none",
              borderRight: s.num < 3 ? "1px solid var(--wm-er-border)" : "none",
              background: isActive ? "rgba(55,48,163,0.08)" : isDone ? "rgba(22,163,74,0.06)" : "transparent",
              cursor: s.num < step ? "pointer" : "default",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              transition: "background 0.2s ease",
            }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700,
              color: isDone ? "#fff" : isActive ? "var(--wm-er-accent-career)" : "var(--wm-er-muted)",
              background: isDone ? "var(--wm-success)" : isActive ? "rgba(55,48,163,0.15)" : "rgba(0,0,0,0.06)",
            }}>
              {isDone ? <IconCheck /> : s.num}
            </div>
            <div style={{
              fontSize: 11, fontWeight: isActive ? 700 : 600,
              color: isActive ? "var(--wm-er-accent-career)" : isDone ? "var(--wm-success)" : "var(--wm-er-muted)",
            }}>
              {s.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Validation Errors ─────────────────────────── */

export function CareerCreateValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div style={{
      marginTop: 12, padding: 14, borderRadius: "var(--wm-radius-14)",
      border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.04)",
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-error)" }}>
        Please fix before continuing:
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.6 }}>
        {errors.map((err) => <div key={err}>— {err}</div>)}
      </div>
    </div>
  );
}

/* ── Action Buttons ────────────────────────────── */

export function CareerCreateActions({ step, isCurrentValid, isAllValid, onBack, onNext, onCancel, onCreate }: {
  step: number;
  isCurrentValid: boolean;
  isAllValid: boolean;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  onCreate: () => void;
}) {
  return (
    <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "space-between", paddingBottom: 32 }}>
      <div>
        {step === 1 ? (
          <button className="wm-outlineBtn" type="button" onClick={onCancel}>Cancel</button>
        ) : (
          <button className="wm-outlineBtn" type="button" onClick={onBack}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconArrowLeft /> Back
          </button>
        )}
      </div>
      <div>
        {step < 3 ? (
          <button className="wm-primarybtn" type="button" onClick={onNext} disabled={!isCurrentValid}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Next <IconArrowRight />
          </button>
        ) : (
          <button className="wm-primarybtn" type="button" onClick={onCreate} disabled={!isAllValid}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconCheck /> Create Post
          </button>
        )}
      </div>
    </div>
  );
}