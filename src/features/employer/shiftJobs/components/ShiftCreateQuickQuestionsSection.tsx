// src/features/employer/shiftJobs/components/ShiftCreateQuickQuestionsSection.tsx
//
// Quick Questions section for shift post creation.
// Employer adds up to 3 Yes/No questions workers must answer when applying.
// Category-based suggestions shown as tap-to-add chips.
// Workers see and answer these on the apply page.

import { useState } from "react";
import { SectionHead } from "./ShiftCreateIcons";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type QuickQuestion = { id: string; text: string };

/* ------------------------------------------------ */
/* Category Suggestions                             */
/* ------------------------------------------------ */
const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  "Construction":        ["Do you have your own safety equipment?", "Are you comfortable working at heights?", "Do you have relevant trade experience?"],
  "Kitchen / Restaurant":["Do you have food handling experience?", "Are you available for split shifts?", "Do you have a food hygiene certificate?"],
  "Catering":            ["Do you have catering or hospitality experience?", "Can you work on weekends?", "Do you have a food hygiene certificate?"],
  "Driving":             ["Do you hold a valid driving license?", "Do you own your own vehicle?", "Are you familiar with the local area?"],
  "Delivery":            ["Do you hold a valid driving license?", "Do you own a vehicle suitable for deliveries?", "Can you lift packages up to 20kg?"],
  "Cleaning":            ["Do you have professional cleaning experience?", "Are you comfortable using cleaning chemicals?", "Do you have your own equipment?"],
  "Events":              ["Have you worked at events before?", "Are you comfortable in crowded environments?", "Can you work late evenings or weekends?"],
  "Warehouse":           ["Can you lift heavy loads (25kg+)?", "Do you have warehouse or logistics experience?", "Are you available for early morning shifts?"],
  "Retail":              ["Do you have retail or customer service experience?", "Are you comfortable with cash handling?", "Can you commit to all scheduled dates?"],
  "Security":            ["Do you hold a valid security license?", "Have you worked in security before?", "Are you comfortable working night shifts?"],
  "Office":              ["Are you proficient in MS Office?", "Do you have customer service experience?", "Do you have data entry experience?"],
  "Agency":              ["Are you registered with any other agencies?", "Do you have relevant experience?", "Are you available at short notice?"],
};

const DEFAULT_SUGGESTIONS = [
  "Are you available on all listed dates?",
  "Do you have relevant experience for this role?",
  "Can you commit to the full shift duration?",
];

function getSuggestions(category: string): string[] {
  const exact = CATEGORY_SUGGESTIONS[category];
  if (exact) return exact;
  const lower = category.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_SUGGESTIONS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return val;
  }
  return DEFAULT_SUGGESTIONS;
}

function genId(): string {
  return `qq_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

/* ------------------------------------------------ */
/* Icon                                             */
/* ------------------------------------------------ */
function IconQuestion() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 17h-2v-2h2v2Zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25Z"/>
    </svg>
  );
}

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  category: string;
  questions: QuickQuestion[];
  onChange: (questions: QuickQuestion[]) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ShiftCreateQuickQuestionsSection({ category, questions, onChange }: Props) {
  const [customText, setCustomText] = useState("");

  const suggestions = getSuggestions(category);
  const addedTexts  = new Set(questions.map((q) => q.text));
  const MAX         = 3;
  const atLimit     = questions.length >= MAX;

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

  function handleCustomKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleAddCustom(); }
  }

  return (
    <section className="wm-er-card" style={{ marginTop: 12 }}>
      <SectionHead
        icon={<IconQuestion />}
        title="Quick Questions"
        sub={`Optional Yes/No questions workers must answer when applying. Max ${MAX} questions.`}
      />

      {/* Suggestions */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
          Suggested for {category || "this category"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {suggestions.map((s) => {
            const already = addedTexts.has(s);
            return (
              <button
                key={s}
                type="button"
                disabled={atLimit && !already}
                onClick={() => already ? undefined : addQuestion(s)}
                style={{
                  fontSize: 11, fontWeight: 600, padding: "5px 10px",
                  borderRadius: 999, cursor: already || atLimit ? "default" : "pointer",
                  border: already
                    ? "1.5px solid var(--wm-er-accent-shift)"
                    : "1.5px solid var(--wm-er-border)",
                  background: already ? "rgba(22,163,74,0.08)" : "var(--wm-er-surface)",
                  color: already ? "var(--wm-er-accent-shift)" : atLimit ? "var(--wm-er-muted)" : "var(--wm-er-text)",
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

      {/* Added questions list */}
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
              <button
                type="button"
                onClick={() => removeQuestion(q.id)}
                style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 8px",
                  borderRadius: 6, border: "none", cursor: "pointer",
                  background: "rgba(220,38,38,0.08)",
                  color: "var(--wm-error, #dc2626)",
                }}
                aria-label="Remove question"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom question input */}
      {!atLimit && (
        <div className="wm-field" style={{ marginTop: 4 }}>
          <div className="wm-label">Add custom question</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="wm-input"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={handleCustomKeyDown}
              placeholder="Type a Yes/No question..."
              maxLength={120}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleAddCustom}
              disabled={!customText.trim() || addedTexts.has(customText.trim())}
              style={{
                fontSize: 12, fontWeight: 600, padding: "0 14px", borderRadius: 10,
                border: "none", background: "var(--wm-er-accent-shift, #16a34a)",
                color: "#fff", cursor: "pointer", whiteSpace: "nowrap",
                opacity: !customText.trim() ? 0.5 : 1,
                height: 42,
              }}
            >
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