// src/features/employer/careerJobs/components/CareerCreateScreeningSection.tsx
//
// Screening Questions section for career post creation.
// Employer adds up to 5 Yes/No questions applicants must answer.
// Career domain: Indigo var(--wm-er-accent-career).

import { useState } from "react";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type ScreeningQuestion = { id: string; text: string };

/* ------------------------------------------------ */
/* Suggestions                                      */
/* ------------------------------------------------ */
const ROLE_SUGGESTIONS: Record<string, string[]> = {
  "full-time": [
    "Are you available to work full-time (40 hrs/week)?",
    "Do you have the required experience for this role?",
    "Are you willing to relocate if needed?",
    "Do you have the required qualifications listed?",
  ],
  "part-time": [
    "Are you available for part-time hours?",
    "Do you have experience relevant to this role?",
    "Can you commit to the scheduled days and times?",
  ],
  "contract": [
    "Are you available to start within 2 weeks?",
    "Do you have the required skills for this contract?",
    "Are you open to contract extension if needed?",
  ],
};

const DEFAULT_SUGGESTIONS = [
  "Do you have the required experience for this role?",
  "Are you legally authorized to work in this location?",
  "Are you available to start within the stated timeframe?",
  "Do you have the required qualifications listed in this post?",
  "Are you comfortable with the work mode (on-site / remote / hybrid)?",
];

function getSuggestions(jobType: string): string[] {
  return ROLE_SUGGESTIONS[jobType] ?? DEFAULT_SUGGESTIONS;
}

function genId(): string {
  return `sq_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

/* ------------------------------------------------ */
/* Icon                                             */
/* ------------------------------------------------ */
function IconScreening() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  jobType: string;
  questions: ScreeningQuestion[];
  onChange: (questions: ScreeningQuestion[]) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function CareerCreateScreeningSection({ jobType, questions, onChange }: Props) {
  const [customText, setCustomText] = useState("");

  const suggestions  = getSuggestions(jobType);
  const addedTexts   = new Set(questions.map((q) => q.text));
  const MAX          = 5;
  const atLimit      = questions.length >= MAX;

  function addQuestion(text: string) {
    if (atLimit || addedTexts.has(text) || !text.trim()) return;
    onChange([...questions, { id: genId(), text: text.trim() }]);
  }

  function removeQuestion(id: string) {
    onChange(questions.filter((q) => q.id !== id));
  }

  function handleAddCustom() {
    const t = customText.trim();
    if (!t || addedTexts.has(t) || atLimit) return;
    addQuestion(t);
    setCustomText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleAddCustom(); }
  }

  return (
    <section className="wm-er-card" style={{ marginTop: 12 }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "rgba(55,48,163,0.08)", color: "var(--wm-er-accent-career)", flexShrink: 0,
          }}>
            <IconScreening />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-er-text)" }}>
            Screening Questions
          </div>
        </div>
        <div style={{ marginTop: 4, marginLeft: 42, fontSize: 12, color: "var(--wm-er-muted)" }}>
          Optional Yes/No questions applicants must answer before applying. Max {MAX}.
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
          Suggested for {jobType || "this role"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {suggestions.map((s) => {
            const already = addedTexts.has(s);
            return (
              <button key={s} type="button"
                disabled={atLimit && !already}
                onClick={() => already ? undefined : addQuestion(s)}
                style={{
                  fontSize: 11, fontWeight: 600, padding: "5px 10px",
                  borderRadius: 999, cursor: already || atLimit ? "default" : "pointer",
                  border: already ? "1.5px solid var(--wm-er-accent-career)" : "1.5px solid var(--wm-er-border)",
                  background: already ? "rgba(55,48,163,0.07)" : "var(--wm-er-surface)",
                  color: already ? "var(--wm-er-accent-career)" : atLimit ? "var(--wm-er-muted)" : "var(--wm-er-text)",
                  opacity: atLimit && !already ? 0.45 : 1,
                  transition: "all 0.15s",
                }}
                aria-pressed={already}
              >
                {already ? "\u2713 " : "+ "}{s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Added questions */}
      {questions.length > 0 && (
        <div style={{ marginBottom: 10, display: "grid", gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Added ({questions.length}/{MAX})
          </div>
          {questions.map((q, idx) => (
            <div key={q.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              padding: "8px 12px", borderRadius: 10,
              background: "var(--wm-er-bg)", border: "1px solid var(--wm-er-border)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)", flex: 1 }}>
                Q{idx + 1}. {q.text}
              </div>
              <button type="button" onClick={() => removeQuestion(q.id)}
                style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: "rgba(220,38,38,0.08)", color: "var(--wm-error, #dc2626)" }}
                aria-label="Remove">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom input */}
      {!atLimit && (
        <div className="wm-field" style={{ marginTop: 4 }}>
          <div className="wm-label">Add custom question</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="wm-input"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a Yes/No screening question..."
              maxLength={160}
              style={{ flex: 1 }}
            />
            <button type="button" onClick={handleAddCustom}
              disabled={!customText.trim() || addedTexts.has(customText.trim())}
              style={{
                fontSize: 12, fontWeight: 600, padding: "0 14px", borderRadius: 10,
                border: "none", background: "var(--wm-er-accent-career, #1d4ed8)",
                color: "#fff", cursor: "pointer", height: 42, whiteSpace: "nowrap",
                opacity: !customText.trim() ? 0.5 : 1,
              }}>
              Add
            </button>
          </div>
        </div>
      )}

      {atLimit && (
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 6, fontStyle: "italic" }}>
          Maximum {MAX} questions reached. Remove one to add another.
        </div>
      )}
    </section>
  );
}