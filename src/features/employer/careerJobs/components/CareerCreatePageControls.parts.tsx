import { CAREER_CREATE_STEPS } from "../helpers/careerCreateFormHelpers";
import { CAREER_BLUE, CAREER_BLUE_DEEP, CAREER_MUTED } from "./CareerCreatePageControls.styles";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconSave,
} from "./CareerCreatePageControls.icons";

export function CareerCreateProgressBar({
  step,
  onGoToStep,
}: {
  step: number;
  onGoToStep: (stepNumber: number) => void;
}) {
  return (
    <section
      style={{
        marginTop: "var(--wm-stack-gap)",
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 8,
      }}
    >
      {CAREER_CREATE_STEPS.map((item) => {
        const isActive = item.num === step;
        const isDone = item.num < step;

        return (
          <button
            key={item.num}
            type="button"
            onClick={() => {
              if (item.num <= step) onGoToStep(item.num);
            }}
            style={{
              minWidth: 0,
              padding: "10px 6px",
              borderRadius: "var(--wm-radius-chip)",
              border: isActive
                ? "1px solid rgba(37, 99, 235, 0.3)"
                : isDone
                  ? "1px solid rgba(37, 99, 235, 0.15)"
                  : "1px solid rgba(255, 255, 255, 0.9)",
              background: isActive
                ? "linear-gradient(135deg, rgba(239,246,255,0.95), rgba(219,234,254,0.7))"
                : isDone
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.6)",
              cursor: item.num <= step ? "pointer" : "default",
              boxShadow: isActive
                ? "0 8px 16px rgba(37,99,235,0.1), inset 0 1px 2px rgba(255,255,255,0.9)"
                : "0 4px 12px rgba(15,23,42,0.03)",
              backdropFilter: "blur(var(--wm-blur-md))",
              transition: "all var(--wm-motion-base) var(--wm-motion-spring)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                margin: "0 auto",
                borderRadius: "var(--wm-radius-button)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                color: isDone ? "#fff" : isActive ? CAREER_BLUE : CAREER_MUTED,
                background: isDone ? CAREER_BLUE : isActive ? "#fff" : "rgba(15,23,42,0.04)",
                boxShadow: isActive || isDone ? "0 2px 6px rgba(37,99,235,0.2)" : "none",
              }}
            >
              {isDone ? <IconCheck /> : item.num}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                fontWeight: isActive ? 800 : 700,
                color: isActive ? CAREER_BLUE_DEEP : isDone ? CAREER_BLUE_DEEP : CAREER_MUTED,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.label}
            </div>
          </button>
        );
      })}
    </section>
  );
}

export function CareerCreateValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;

  return (
    <section
      style={{
        marginTop: "var(--wm-stack-gap)",
        padding: 16,
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(245, 158, 11, 0.2)",
        background: "linear-gradient(135deg, rgba(254, 252, 232, 0.95), rgba(255, 255, 255, 0.9))",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(245, 158, 11, 0.05)",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13.5, color: "#92400e" }}>
        Complete required fields before continuing
      </div>

      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
        {errors.map((error) => (
          <div
            key={error}
            style={{ fontSize: 12.5, color: "#b45309", lineHeight: 1.45, fontWeight: 500 }}
          >
            • {error}
          </div>
        ))}
      </div>
    </section>
  );
}

export function CareerCreateActions({
  step,
  isCurrentValid,
  isAllValid,
  onBack,
  onNext,
  onCancel,
  onCreate,
  onSaveDraft,
}: {
  step: number;
  isCurrentValid: boolean;
  isAllValid: boolean;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  onCreate: () => void;
  onSaveDraft: () => void;
}) {
  return (
    <div className="wm-career-sticky-actions">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "var(--wm-space-12)",
          alignItems: "center",
        }}
      >
        <div>
          {step === 1 ? (
            <button type="button" className="wm-outlineBtn" onClick={onCancel}>
              Cancel
            </button>
          ) : (
            <button type="button" className="wm-outlineBtn" onClick={onBack}>
              <IconArrowLeft /> Back
            </button>
          )}
        </div>

        <button
          type="button"
          className="wm-ghostBtn"
          onClick={onSaveDraft}
          style={{ justifyContent: "center", color: CAREER_BLUE_DEEP }}
        >
          <IconSave /> Save Draft
        </button>

        <div>
          {step < 4 ? (
            <button
              type="button"
              className="wm-primarybtn"
              onClick={onNext}
              disabled={!isCurrentValid}
            >
              Next <IconArrowRight />
            </button>
          ) : (
            <button
              type="button"
              className="wm-primarybtn"
              onClick={onCreate}
              disabled={!isAllValid}
            >
              <IconCheck /> Publish Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
