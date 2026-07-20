// App name: Job Mitra
// 3-step Create Shift wizard — sticky top bar with progress + Save Draft.

import type { CSSProperties } from "react";

export type ShiftCreateWizardStep = 1 | 2 | 3;

const STEPS: { step: ShiftCreateWizardStep; label: string }[] = [
  { step: 1, label: "Role & Team" },
  { step: 2, label: "Schedule, Pay & Location" },
  { step: 3, label: "Perks & Screening" },
];

type Props = {
  wizardStep: ShiftCreateWizardStep;
  onCancel: () => void;
  onSaveDraft: () => void;
  lastSavedAt: number | null;
};

const BAR_STYLE: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  marginTop: 2,
  padding: "12px 14px 14px",
  borderRadius: 20,
  border: "1px solid rgba(226,232,240,0.95)",
  background: "rgba(255,255,255,0.96)",
  boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
  backdropFilter: "blur(12px)",
};

export function ShiftCreateWizardTopBar({ wizardStep, onCancel, onSaveDraft, lastSavedAt }: Props) {
  const current = STEPS.find((item) => item.step === wizardStep);

  return (
    <header style={BAR_STYLE} data-testid="shift-create-wizard-topbar">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <button className="wm-outlineBtn" type="button" onClick={onCancel} style={{ fontSize: 12 }}>
          Cancel
        </button>

        <div style={{ textAlign: "center", minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)" }}>
            Step {wizardStep} of 3
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 950,
              color: "var(--wm-er-text)",
              lineHeight: 1.25,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {current?.label}
          </div>
        </div>

        <button
          type="button"
          className="wm-primarybtn"
          onClick={onSaveDraft}
          data-testid="shift-create-save-draft"
          style={{ fontSize: 12, whiteSpace: "nowrap", padding: "8px 12px" }}
        >
          Save Draft
        </button>
      </div>

      <div
        role="progressbar"
        aria-valuenow={wizardStep}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label={`Create shift wizard step ${wizardStep} of 3`}
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
        }}
      >
        {STEPS.map((item) => {
          const done = item.step < wizardStep;
          const active = item.step === wizardStep;

          return (
            <div
              key={item.step}
              style={{
                height: 4,
                borderRadius: 999,
                background: done || active ? "var(--wm-er-accent-shift)" : "rgba(226,232,240,0.95)",
                opacity: active ? 1 : done ? 0.72 : 0.45,
                transition: "background 200ms ease, opacity 200ms ease",
              }}
            />
          );
        })}
      </div>

      {lastSavedAt && (
        <div
          style={{
            marginTop: 8,
            fontSize: 10,
            fontWeight: 700,
            color: "var(--wm-er-muted)",
            textAlign: "center",
          }}
        >
          Draft saved on this device
        </div>
      )}
    </header>
  );
}
