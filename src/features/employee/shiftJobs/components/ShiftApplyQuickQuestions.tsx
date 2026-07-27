// App name: Job Mitra | ShiftApplyQuickQuestions.tsx — glass + seg-tabs (post-details polish)

type QuickQuestion = { id: string; text: string };

type Props = {
  questions: QuickQuestion[];
  answers: Record<string, "yes" | "no">;
  onChange: (answers: Record<string, "yes" | "no">) => void;
};

export function ShiftApplyQuickQuestions({ questions, answers, onChange }: Props) {
  if (!questions || questions.length === 0) return null;

  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const allAnswered = answeredCount === questions.length;

  function handleAnswer(id: string, val: "yes" | "no") {
    onChange({ ...answers, [id]: val });
  }

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-animateIn"
      data-testid="shift-apply-quick-questions"
      style={{ padding: 16, animationDelay: "110ms" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          gap: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-accent-shift, #16a34a)" }}>
          Quick Questions
        </div>
        <span
          className="wm-shift-pill"
          style={{
            fontSize: 11,
            background: allAnswered ? "rgba(22,163,74,0.10)" : "rgba(217,119,6,0.10)",
            color: allAnswered ? "var(--wm-er-accent-shift, #16a34a)" : "#92400e",
            border: allAnswered ? "1px solid rgba(22,163,74,0.3)" : "1px solid rgba(217,119,6,0.3)",
          }}
        >
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      <div style={{ fontSize: 11, color: "var(--wm-er-muted, #64748b)", marginBottom: 12 }}>
        Please answer all questions before applying.
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          return (
            <div
              key={q.id}
              className="wm-shift-surface-glass"
              style={{
                padding: "10px 12px",
                background: ans !== undefined ? "rgba(22,163,74,0.04)" : "rgba(248,250,252,0.96)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--wm-er-text, #1e293b)",
                  marginBottom: 8,
                }}
              >
                Q{idx + 1}. {q.text}
              </div>
              <div className="wm-shift-seg-tab-row">
                {(["yes", "no"] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`wm-shift-seg-tab ${ans === val ? "isActive" : ""}`}
                    onClick={() => handleAnswer(q.id, val)}
                    aria-pressed={ans === val}
                    style={{ flex: 1 }}
                  >
                    {val === "yes" ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
