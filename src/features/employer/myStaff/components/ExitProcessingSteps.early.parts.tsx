import { EXIT_REASONS, type Step1Props, type Step2Props } from "./ExitProcessingSteps.helpers";
import { BtnRow, StepHeader } from "./ExitProcessingSteps.shared.parts";

export function ExitStep1({
  employeeName,
  jobTitle,
  reason,
  onReasonChange,
  exitNote,
  onExitNoteChange,
  onNext,
  onCancel,
  cancelBtn,
  nextBtn,
}: Step1Props) {
  return (
    <>
      <StepHeader step={1} title="End Employment" employeeName={employeeName} jobTitle={jobTitle} />
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 10 }}>
        Select reason for ending employment:
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {EXIT_REASONS.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => onReasonChange(r.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "var(--wm-radius-10)",
              border: reason === r.value ? "2px solid #dc2626" : "1.5px solid rgba(0,0,0,0.1)",
              background: reason === r.value ? "rgba(220,38,38,0.06)" : "transparent",
              color: "var(--wm-er-text)",
              fontWeight: 800,
              fontSize: 13,
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 850, color: "var(--wm-er-text)", marginBottom: 7 }}>
          Exit note / reason details optional
        </div>

        <textarea
          value={exitNote}
          onChange={(event) => onExitNoteChange(event.target.value)}
          placeholder="Add short reason details, handover note, or context for this exit..."
          maxLength={400}
          rows={3}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            border: "1.5px solid rgba(0,0,0,0.12)",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--wm-er-text)",
            background: "#f8fafc",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            marginTop: 4,
            textAlign: "right",
            fontSize: 10.5,
            fontWeight: 750,
            color: "var(--wm-er-muted)",
          }}
        >
          {exitNote.length}/400
        </div>
      </div>

      <BtnRow
        backLabel="Cancel"
        onBack={onCancel}
        nextLabel="Next"
        onNext={onNext}
        nextEnabled={!!reason}
        cancelBtn={cancelBtn}
        nextBtn={nextBtn}
      />
    </>
  );
}

export function ExitStep2({
  employeeName,
  jobTitle,
  dateStr,
  onDateChange,
  todayStr,
  dateValid,
  onNext,
  onBack,
  cancelBtn,
  nextBtn,
}: Step2Props) {
  return (
    <>
      <StepHeader
        step={2}
        title="Last Working Date"
        employeeName={employeeName}
        jobTitle={jobTitle}
      />
      <input
        type="date"
        value={dateStr}
        max={todayStr}
        onChange={(e) => onDateChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "var(--wm-radius-10)",
          border: "1.5px solid rgba(0,0,0,0.12)",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--wm-er-text)",
          background: "#f8fafc",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <BtnRow
        backLabel="Back"
        onBack={onBack}
        nextLabel="Next"
        onNext={onNext}
        nextEnabled={dateValid}
        cancelBtn={cancelBtn}
        nextBtn={nextBtn}
      />
    </>
  );
}
