// App name: Job Mitra
// File name: CareerApplyQuickQuestions.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\CareerApplyQuickQuestions.tsx

type CareerQuickQuestion = {
  id: string;
  text: string;
};

type CareerApplyQuickQuestionsProps = {
  questions: CareerQuickQuestion[];
  answers: Record<string, "yes" | "no">;
  onChange: (answers: Record<string, "yes" | "no">) => void;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export function CareerApplyQuickQuestions({
  questions,
  answers,
  onChange,
}: CareerApplyQuickQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  const answeredCount = questions.filter((question) => answers[question.id] !== undefined).length;
  const allAnswered = answeredCount === questions.length;

  function handleAnswer(id: string, value: "yes" | "no") {
    onChange({ ...answers, [id]: value });
  }

  return (
    <section
      className="wm-ee-card"
      style={{
        marginTop: 12,
        padding: 16,
        borderRadius: 24,
        border: "1px solid rgba(29,78,216,0.16)",
        background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
        boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 950, color: CAREER_TEXT }}>
            Screening questions
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: CAREER_MUTED, lineHeight: 1.45 }}>
            Answer all required questions before applying.
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 950,
            padding: "5px 9px",
            borderRadius: 999,
            background: allAnswered ? "rgba(29,78,216,0.10)" : "rgba(255,251,235,0.95)",
            color: allAnswered ? CAREER_BLUE : "#92400e",
            border: allAnswered
              ? "1px solid rgba(29,78,216,0.22)"
              : "1px solid rgba(217,119,6,0.24)",
            whiteSpace: "nowrap",
          }}
        >
          {answeredCount}/{questions.length}
        </span>
      </div>

      <div style={{ marginTop: 13, display: "grid", gap: 10 }}>
        {questions.map((question, index) => {
          const answer = answers[question.id];
          const answered = answer !== undefined;

          return (
            <div
              key={question.id}
              style={{
                padding: "11px 12px",
                borderRadius: 16,
                background: answered ? "rgba(239,246,255,0.75)" : "rgba(248,250,252,0.95)",
                border: answered
                  ? "1px solid rgba(29,78,216,0.18)"
                  : "1px solid rgba(148,163,184,0.18)",
              }}
            >
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 850,
                  color: CAREER_TEXT,
                  marginBottom: 9,
                  lineHeight: 1.45,
                }}
              >
                {index + 1}. {question.text}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <QuestionAnswerButton
                  label="Yes"
                  active={answer === "yes"}
                  onClick={() => handleAnswer(question.id, "yes")}
                />
                <QuestionAnswerButton
                  label="No"
                  active={answer === "no"}
                  onClick={() => handleAnswer(question.id, "no")}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function QuestionAnswerButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minWidth: 74,
        padding: "7px 14px",
        borderRadius: 999,
        border: active ? "1.5px solid rgba(67,56,202,0.9)" : "1px solid rgba(148,163,184,0.24)",
        background: active
          ? "linear-gradient(135deg, rgba(239,246,255,1), rgba(238,242,255,0.96))"
          : "#fff",
        color: active ? CAREER_BLUE : CAREER_MUTED,
        fontSize: 12,
        fontWeight: active ? 950 : 850,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
