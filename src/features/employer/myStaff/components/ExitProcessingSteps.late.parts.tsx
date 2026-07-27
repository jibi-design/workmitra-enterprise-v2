import type { Step3Props, Step4Props } from "./ExitProcessingSteps.helpers";
import { BtnRow, StepHeader } from "./ExitProcessingSteps.shared.parts";

export function ExitStep3({
  employeeName,
  jobTitle,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  onNext,
  onBack,
  cancelBtn,
  nextBtn,
}: Step3Props) {
  return (
    <>
      <StepHeader
        step={3}
        title="Rate Employee"
        titleColor="var(--wm-er-text)"
        employeeName={employeeName}
        jobTitle={jobTitle}
      />
      <div
        style={{
          fontSize: 12,
          color: "var(--wm-er-muted)",
          lineHeight: 1.5,
          marginBottom: 12,
          padding: "8px 12px",
          background: "rgba(37,99,235,0.05)",
          border: "1px solid rgba(37,99,235,0.12)",
          borderRadius: "var(--wm-radius-8)",
        }}
      >
        Rate this employee based on their work performance. Tap a star to select your rating – this
        is required to proceed. Your rating will be visible on their verified work history.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            style={{
              fontSize: 28,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: star <= rating ? "#f59e0b" : "#d1d5db",
              padding: 2,
            }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Comment (optional)"
        maxLength={500}
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
      <BtnRow
        backLabel="Back"
        onBack={onBack}
        nextLabel="Next"
        onNext={onNext}
        nextEnabled={rating > 0}
        cancelBtn={cancelBtn}
        nextBtn={nextBtn}
      />
    </>
  );
}

export function ExitStep4({ employeeName, onDone }: Step4Props) {
  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#16a34a"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z"
        />
      </svg>
      <div style={{ fontWeight: 900, fontSize: 16, color: "#16a34a", marginTop: 10 }}>
        Exit Processed
      </div>
      <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 6, lineHeight: 1.5 }}>
        {employeeName}'s employment has been ended. Their verified work history has been updated.
      </div>
      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          onClick={onDone}
          style={{
            padding: "12px 28px",
            borderRadius: "var(--wm-radius-10)",
            border: "none",
            background: "#16a34a",
            color: "#fff",
            fontWeight: 900,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
