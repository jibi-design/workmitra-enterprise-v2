// App name: Job Mitra | ShiftPostSubmitSection.tsx — pressable CTAs (post-details polish)

type ShiftPostSubmitSectionProps = {
  show: boolean;
  canSubmit: boolean;
  isClosedOrExpired: boolean;
  allQuestionsAnswered: boolean;
  quickQuestionCount: number;
  submitBlockReason?: string;
  isSaved: boolean;
  onToggleSaved: () => void;
  onSubmit: () => void;
};

export function ShiftPostSubmitSection({
  show,
  canSubmit,
  isClosedOrExpired,
  allQuestionsAnswered,
  quickQuestionCount,
  submitBlockReason,
  isSaved,
  onToggleSaved,
  onSubmit,
}: ShiftPostSubmitSectionProps) {
  const fallbackBlockReason = getFallbackBlockReason({
    canSubmit,
    isClosedOrExpired,
    allQuestionsAnswered,
    quickQuestionCount,
  });

  const visibleBlockReason = submitBlockReason || fallbackBlockReason;

  return (
    <div
      className="wm-animateIn"
      data-testid="shift-post-submit"
      style={{ paddingBottom: 48, display: "grid", gap: 10, animationDelay: "160ms" }}
    >
      <button
        type="button"
        className="wm-outlineBtn wm-shift-pressable"
        onClick={onToggleSaved}
        style={{ width: "100%" }}
        aria-pressed={isSaved}
      >
        {isSaved ? "Saved Shift" : "Save Shift"}
      </button>

      {show ? (
        <>
          {!canSubmit && visibleBlockReason ? (
            <div
              className="wm-shift-surface-glass"
              role="status"
              style={{
                padding: "10px 12px",
                border: "1px solid rgba(217,119,6,0.24)",
                background:
                  "linear-gradient(180deg, rgba(255,251,235,0.92), rgba(255,247,237,0.74))",
                color: "#92400e",
                fontSize: 12,
                fontWeight: 800,
                textAlign: "center",
                lineHeight: 1.45,
              }}
            >
              {visibleBlockReason}
            </div>
          ) : null}

          <button
            type="button"
            className="wm-primarybtn wm-shift-pressable"
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{ width: "100%" }}
          >
            {isClosedOrExpired ? "Applications Closed" : "Submit Application"}
          </button>
        </>
      ) : null}
    </div>
  );
}

function getFallbackBlockReason({
  canSubmit,
  isClosedOrExpired,
  allQuestionsAnswered,
  quickQuestionCount,
}: {
  canSubmit: boolean;
  isClosedOrExpired: boolean;
  allQuestionsAnswered: boolean;
  quickQuestionCount: number;
}) {
  if (canSubmit) return "";

  if (isClosedOrExpired) {
    return "This shift is closed or expired. Applications are no longer available.";
  }

  if (!allQuestionsAnswered && quickQuestionCount > 0) {
    return "Please answer all quick questions before submitting your application.";
  }

  return "Please complete the required application steps before submitting.";
}
