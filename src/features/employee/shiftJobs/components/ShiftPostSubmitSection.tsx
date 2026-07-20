// App name: Job Mitra
// File name: ShiftPostSubmitSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftPostSubmitSection.tsx

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
    <div style={{ marginTop: 16, paddingBottom: 48, display: "grid", gap: 10 }}>
      <button
        type="button"
        onClick={onToggleSaved}
        style={{
          width: "100%",
          padding: 13,
          borderRadius: 12,
          border: "1px solid rgba(22,163,74,0.2)",
          background: isSaved ? "rgba(22,163,74,0.12)" : "rgba(22,163,74,0.06)",
          color: "var(--wm-er-accent-shift, #16a34a)",
          fontSize: 14,
          fontWeight: 850,
          cursor: "pointer",
        }}
      >
        {isSaved ? "Saved Shift" : "Save Shift"}
      </button>

      {show && (
        <>
          {!canSubmit && visibleBlockReason && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
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
          )}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: canSubmit ? "none" : "1px solid rgba(148,163,184,0.42)",
              background: canSubmit
                ? "var(--wm-er-accent-shift, #16a34a)"
                : "linear-gradient(180deg, rgba(226,232,240,0.96), rgba(203,213,225,0.92))",
              color: canSubmit ? "#fff" : "#64748b",
              fontSize: 14,
              fontWeight: 850,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {isClosedOrExpired ? "Applications Closed" : "Submit Application"}
          </button>
        </>
      )}
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
