// App name: Job Mitra
// File name: CareerCreatePageControls.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCreatePageControls.tsx

import { CAREER_CREATE_STEPS } from "../helpers/careerCreateFormHelpers";
import type { CSSProperties } from "react";

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e40af";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #475569)";

function IconArrowLeft() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconSave() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

// PREMIUM BUTTON STYLES
const BTN_PRIMARY: CSSProperties = {
  minHeight: 46,
  padding: "0 20px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)",
  color: "#fff",
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3), 0 8px 16px -4px rgba(37, 99, 235, 0.25)",
  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
  transition: "all 0.2s var(--wm-motion-spring)",
};

const BTN_SECONDARY: CSSProperties = {
  minHeight: 46,
  padding: "0 20px",
  borderRadius: 14,
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  color: CAREER_TEXT,
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255,255,255,1)",
  transition: "all 0.2s var(--wm-motion-spring)",
};

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
        marginTop: 16,
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
              borderRadius: 16,
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
                borderRadius: 12,
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
        marginTop: 16,
        padding: 16,
        borderRadius: 20,
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
    <div
      style={{
        marginTop: 20,
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 12,
        alignItems: "center",
        paddingBottom: 40,
      }}
    >
      <div>
        {step === 1 ? (
          <button type="button" onClick={onCancel} style={BTN_SECONDARY}>
            Cancel
          </button>
        ) : (
          <button type="button" onClick={onBack} style={BTN_SECONDARY}>
            <IconArrowLeft /> Back
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onSaveDraft}
        style={{
          ...BTN_SECONDARY,
          justifyContent: "center",
          color: CAREER_BLUE_DEEP,
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
        }}
      >
        <IconSave /> Save Draft
      </button>

      <div>
        {step < 4 ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!isCurrentValid}
            style={{
              ...BTN_PRIMARY,
              opacity: isCurrentValid ? 1 : 0.5,
              cursor: isCurrentValid ? "pointer" : "not-allowed",
            }}
          >
            Next <IconArrowRight />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCreate}
            disabled={!isAllValid}
            style={{
              ...BTN_PRIMARY,
              opacity: isAllValid ? 1 : 0.5,
              cursor: isAllValid ? "pointer" : "not-allowed",
              background: "linear-gradient(180deg, #10b981 0%, #d97706 100%)", // Distinct color for publish
            }}
          >
            <IconCheck /> Publish Job
          </button>
        )}
      </div>
    </div>
  );
}
