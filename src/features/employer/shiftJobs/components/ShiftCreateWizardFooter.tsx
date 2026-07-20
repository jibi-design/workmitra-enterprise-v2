// App name: Job Mitra
// Step footer navigation for the 3-step Create Shift wizard.

import type { CSSProperties } from "react";
import type { ShiftCreateWizardStep } from "./ShiftCreateWizardTopBar";
import { IconPlus } from "./ShiftCreateIcons";

type Props = {
  wizardStep: ShiftCreateWizardStep;
  onCancel: () => void;
  onBack: () => void;
  onNext: () => void;
  onReviewPublish: () => void;
  stepErrors: string[];
};

const FOOTER_STYLE: CSSProperties = {
  marginTop: 16,
  paddingTop: 14,
  borderTop: "1px solid rgba(226,232,240,0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
};

export function ShiftCreateWizardFooter({
  wizardStep,
  onCancel,
  onBack,
  onNext,
  onReviewPublish,
  stepErrors,
}: Props) {
  return (
    <div style={{ marginTop: 8, paddingBottom: 28 }}>
      {stepErrors.length > 0 && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(220,38,38,0.2)",
            background: "rgba(220,38,38,0.04)",
            fontSize: 12,
            color: "var(--wm-er-muted)",
            lineHeight: 1.55,
          }}
        >
          <div style={{ fontWeight: 800, color: "var(--wm-error)", marginBottom: 4 }}>
            Please fix before continuing:
          </div>
          {stepErrors.map((err) => (
            <div key={err}>• {err}</div>
          ))}
        </div>
      )}

      <div style={FOOTER_STYLE}>
        {wizardStep === 1 ? (
          <button className="wm-outlineBtn" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : (
          <button className="wm-outlineBtn" type="button" onClick={onBack}>
            {wizardStep === 2 ? "Back to Step 1" : "Back to Step 2"}
          </button>
        )}

        {wizardStep < 3 ? (
          <button
            type="button"
            className="wm-primarybtn"
            onClick={onNext}
            data-testid="shift-create-wizard-next"
          >
            Next Step
          </button>
        ) : (
          <button
            type="button"
            className="wm-primarybtn"
            onClick={onReviewPublish}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
          >
            <IconPlus /> Review &amp; Publish
          </button>
        )}
      </div>
    </div>
  );
}
