import type { BtnRowProps, StepHeaderProps } from "./ExitProcessingSteps.helpers";

export function StepHeader({ step, title, titleColor, employeeName, jobTitle }: StepHeaderProps) {
  return (
    <>
      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", marginBottom: 12 }}>
        Step {step} of 4
      </div>
      <div
        style={{ fontWeight: 900, fontSize: 16, color: titleColor ?? "#dc2626", marginBottom: 4 }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginBottom: 16 }}>
        {employeeName} – {jobTitle}
      </div>
    </>
  );
}

export function BtnRow({
  backLabel,
  onBack,
  nextLabel,
  onNext,
  nextEnabled,
  cancelBtn,
  nextBtn,
}: BtnRowProps) {
  return (
    <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 }}>
      <button type="button" onClick={onBack} style={cancelBtn}>
        {backLabel}
      </button>
      <button type="button" onClick={onNext} disabled={!nextEnabled} style={nextBtn(nextEnabled)}>
        {nextLabel}
      </button>
    </div>
  );
}
