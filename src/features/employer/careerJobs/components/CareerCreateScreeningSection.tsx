// App name: Job Mitra
// File name: CareerCreateScreeningSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCreateScreeningSection.tsx

import { useState } from "react";

export type ScreeningQuestion = { id: string; text: string };

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
const MAX = 7;

const ROLE_SUGGESTIONS: Record<string, string[]> = {
  "full-time": [
    "Are you available to work full-time for this role?",
    "Do you meet the required experience mentioned in this post?",
    "Do you have the required qualifications listed for this role?",
    "Are you comfortable with the listed responsibilities?",
    "Are you available for the employer interview process?",
    "Are you open to the listed salary range?",
    "Can you join within the expected notice period?",
  ],
  "part-time": [
    "Are you available for part-time working hours?",
    "Can you commit to the required working days and times?",
    "Do you have experience relevant to this role?",
    "Are you comfortable with the listed responsibilities?",
    "Are you available for the employer interview process?",
    "Are you open to the listed salary range?",
    "Can you join within the expected notice period?",
  ],
  contract: [
    "Are you available to start within the required timeframe?",
    "Do you have the required skills for this contract role?",
    "Are you comfortable with the listed responsibilities?",
    "Can you commit for the full contract period?",
    "Are you open to contract extension if needed?",
    "Are you available for the employer interview process?",
    "Are you open to the listed salary range?",
  ],
};

const DEFAULT_SUGGESTIONS = [
  "Do you meet the required experience mentioned in this post?",
  "Do you have the required qualifications listed for this role?",
  "Are you comfortable with the listed work mode?",
  "Are you available in the listed work location?",
  "Are you comfortable with the listed responsibilities?",
  "Are you available for the employer interview process?",
  "Can you join within the expected notice period?",
];

function getSuggestions(jobType: string): string[] {
  return ROLE_SUGGESTIONS[jobType] ?? DEFAULT_SUGGESTIONS;
}

function genId(): string {
  return `sq_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function IconScreening() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM9.5 16.5 6 13l1.41-1.41L9.5 13.67l5.09-5.09L16 10l-6.5 6.5ZM13 9V3.5L18.5 9H13Z"
      />
    </svg>
  );
}

type Props = {
  jobType: string;
  questions: ScreeningQuestion[];
  onChange: (questions: ScreeningQuestion[]) => void;
};

export function CareerCreateScreeningSection({ jobType, questions, onChange }: Props) {
  const [customText, setCustomText] = useState("");

  const suggestions = getSuggestions(jobType);
  const addedTexts = new Set(questions.map((question) => question.text));
  const atLimit = questions.length >= MAX;

  function addQuestion(text: string) {
    const cleanText = text.trim();
    if (atLimit || addedTexts.has(cleanText) || !cleanText) return;
    onChange([...questions, { id: genId(), text: cleanText }]);
  }

  function removeQuestion(id: string) {
    onChange(questions.filter((question) => question.id !== id));
  }

  function handleAddCustom() {
    const cleanText = customText.trim();
    if (!cleanText || addedTexts.has(cleanText) || atLimit) return;

    addQuestion(cleanText);
    setCustomText("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddCustom();
    }
  }

  return (
    <section
      style={{
        marginTop: 12,
        padding: 15,
        borderRadius: 24,
        border: "1px solid rgba(29,78,216,0.13)",
        background:
          "radial-gradient(circle at 94% 0%, rgba(29,78,216,0.06), transparent 30%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
        boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 17,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(29,78,216,0.08)",
              color: CAREER_BLUE,
              border: "1px solid rgba(29,78,216,0.12)",
              flexShrink: 0,
            }}
          >
            <IconScreening />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 950, fontSize: 15, color: CAREER_TEXT, lineHeight: 1.22 }}>
              Screening questions
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: CAREER_MUTED, lineHeight: 1.45 }}>
              Optional Yes/No questions applicants must answer before applying. Max {MAX}.
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginBottom: 12,
          padding: "10px 11px",
          borderRadius: 16,
          background: "rgba(29,78,216,0.055)",
          border: "1px solid rgba(29,78,216,0.10)",
          color: CAREER_BLUE_DEEP,
          fontSize: 11.5,
          fontWeight: 850,
          lineHeight: 1.45,
        }}
      >
        Use screening questions to confirm eligibility, role fit, and joining readiness before
        reviewing candidates.
      </div>

      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 950,
            color: CAREER_MUTED,
            marginBottom: 7,
            textTransform: "uppercase",
            letterSpacing: 0.45,
          }}
        >
          Suggested for {jobType || "this role"}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {suggestions.map((suggestion) => {
            const already = addedTexts.has(suggestion);

            return (
              <button
                key={suggestion}
                type="button"
                disabled={atLimit && !already}
                onClick={() => {
                  if (!already) addQuestion(suggestion);
                }}
                style={{
                  fontSize: 11.5,
                  fontWeight: already ? 900 : 750,
                  padding: "6px 10px",
                  borderRadius: 999,
                  cursor: already || atLimit ? "default" : "pointer",
                  border: already
                    ? "1.5px solid rgba(29,78,216,0.28)"
                    : "1px solid rgba(148,163,184,0.22)",
                  background: already ? "rgba(29,78,216,0.09)" : "rgba(255,255,255,0.88)",
                  color: already ? CAREER_BLUE_DEEP : atLimit ? CAREER_MUTED : CAREER_MUTED,
                  opacity: atLimit && !already ? 0.45 : 1,
                  lineHeight: 1.25,
                }}
                aria-pressed={already}
              >
                {already ? "✓ " : "+ "}
                {suggestion}
              </button>
            );
          })}
        </div>
      </div>

      {questions.length > 0 && (
        <div style={{ marginBottom: 12, display: "grid", gap: 7 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 950,
              color: CAREER_MUTED,
              textTransform: "uppercase",
              letterSpacing: 0.45,
            }}
          >
            Added questions ({questions.length}/{MAX})
          </div>

          {questions.map((question, index) => (
            <div
              key={question.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 9,
                padding: "9px 11px",
                borderRadius: 15,
                background: "rgba(248,250,252,0.94)",
                border: "1px solid rgba(29,78,216,0.09)",
              }}
            >
              <div
                style={{ fontSize: 12.5, fontWeight: 850, color: CAREER_TEXT, lineHeight: 1.45 }}
              >
                {index + 1}. {question.text}
              </div>

              <button
                type="button"
                onClick={() => removeQuestion(question.id)}
                style={{
                  fontSize: 11,
                  fontWeight: 950,
                  padding: "5px 9px",
                  borderRadius: 999,
                  border: "1px solid rgba(220,38,38,0.16)",
                  cursor: "pointer",
                  background: "rgba(254,242,242,0.92)",
                  color: "var(--wm-error, #dc2626)",
                }}
                aria-label="Remove screening question"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {!atLimit && (
        <div className="wm-field" style={{ marginTop: 4 }}>
          <div className="wm-label">Add custom question</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="wm-input"
              value={customText}
              onChange={(event) => setCustomText(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a Yes/No screening question..."
              maxLength={180}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              style={{ flex: 1 }}
            />

            <button
              type="button"
              onClick={handleAddCustom}
              disabled={!customText.trim() || addedTexts.has(customText.trim())}
              style={{
                fontSize: 12,
                fontWeight: 950,
                padding: "0 14px",
                borderRadius: 999,
                border: "none",
                background: CAREER_BLUE,
                color: "#fff",
                cursor: "pointer",
                height: 42,
                whiteSpace: "nowrap",
                opacity: !customText.trim() || addedTexts.has(customText.trim()) ? 0.5 : 1,
                boxShadow:
                  customText.trim() && !addedTexts.has(customText.trim())
                    ? "0 10px 20px rgba(29,78,216,0.16)"
                    : "none",
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {atLimit && (
        <div style={{ fontSize: 11.5, color: CAREER_MUTED, marginTop: 7, lineHeight: 1.45 }}>
          Maximum {MAX} questions reached. Remove one to add another.
        </div>
      )}
    </section>
  );
}
