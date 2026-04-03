// src/features/employee/shiftJobs/components/ShiftApplyQuickQuestions.tsx
//
// Displays employer's quick questions on the apply page.
// Worker must answer all Yes/No questions before Submit is enabled.
// Shift domain: Green var(--wm-er-accent-shift).

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
type QuickQuestion = { id: string; text: string };

type Props = {
  questions: QuickQuestion[];
  answers: Record<string, "yes" | "no">;
  onChange: (answers: Record<string, "yes" | "no">) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ShiftApplyQuickQuestions({ questions, answers, onChange }: Props) {
  if (!questions || questions.length === 0) return null;

  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const allAnswered   = answeredCount === questions.length;

  function handleAnswer(id: string, val: "yes" | "no") {
    onChange({ ...answers, [id]: val });
  }

  return (
    <div className="wm-ee-card" style={{ marginTop: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-accent-shift, #16a34a)" }}>
          Quick Questions
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
          background: allAnswered ? "rgba(22,163,74,0.10)" : "rgba(217,119,6,0.10)",
          color: allAnswered ? "var(--wm-er-accent-shift, #16a34a)" : "#92400e",
          border: allAnswered ? "1px solid rgba(22,163,74,0.3)" : "1px solid rgba(217,119,6,0.3)",
        }}>
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      <div style={{ fontSize: 11, color: "var(--wm-er-muted, #64748b)", marginBottom: 12 }}>
        Please answer all questions before applying.
      </div>

      {/* Questions */}
      <div style={{ display: "grid", gap: 10 }}>
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          return (
            <div key={q.id} style={{
              padding: "10px 12px", borderRadius: 10,
              background: ans !== undefined ? "rgba(22,163,74,0.04)" : "var(--wm-er-bg, #f8fafc)",
              border: `1px solid ${ans !== undefined ? "rgba(22,163,74,0.2)" : "var(--wm-er-border, #e5e7eb)"}`,
              transition: "background 0.15s, border 0.15s",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text, #1e293b)", marginBottom: 8 }}>
                Q{idx + 1}. {q.text}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {(["yes", "no"] as const).map((val) => {
                  const isSelected = ans === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAnswer(q.id, val)}
                      style={{
                        flex: 1, padding: "7px 0", borderRadius: 8,
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        transition: "all 0.15s",
                        border: isSelected
                          ? val === "yes"
                            ? "2px solid var(--wm-er-accent-shift, #16a34a)"
                            : "2px solid var(--wm-er-muted, #94a3b8)"
                          : "1.5px solid var(--wm-er-border, #e5e7eb)",
                        background: isSelected
                          ? val === "yes"
                            ? "rgba(22,163,74,0.10)"
                            : "rgba(148,163,184,0.10)"
                          : "var(--wm-er-surface, #fff)",
                        color: isSelected
                          ? val === "yes"
                            ? "var(--wm-er-accent-shift, #16a34a)"
                            : "var(--wm-er-muted, #64748b)"
                          : "var(--wm-er-muted, #64748b)",
                      }}
                      aria-pressed={isSelected}
                    >
                      {val === "yes" ? "\u2713 Yes" : "\u2715 No"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}