import {
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
  MAX_SCREENING_QUESTIONS,
  type ScreeningQuestion,
} from "./CareerCreateScreeningSection.helpers";

export function IconScreening() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM9.5 16.5 6 13l1.41-1.41L9.5 13.67l5.09-5.09L16 10l-6.5 6.5ZM13 9V3.5L18.5 9H13Z"
      />
    </svg>
  );
}

type SuggestionChipsProps = {
  jobType: string;
  suggestions: string[];
  addedTexts: Set<string>;
  atLimit: boolean;
  onAdd: (text: string) => void;
};

export function ScreeningSuggestionChips({
  jobType,
  suggestions,
  addedTexts,
  atLimit,
  onAdd,
}: SuggestionChipsProps) {
  return (
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
                if (!already) onAdd(suggestion);
              }}
              style={{
                fontSize: 11.5,
                fontWeight: already ? 900 : 750,
                padding: "6px 10px",
                borderRadius: "var(--wm-radius-pill)",
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
  );
}

type AddedQuestionsProps = {
  questions: ScreeningQuestion[];
  onRemove: (id: string) => void;
};

export function ScreeningAddedQuestions({ questions, onRemove }: AddedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
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
        Added questions ({questions.length}/{MAX_SCREENING_QUESTIONS})
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
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(248,250,252,0.94)",
            border: "1px solid rgba(29,78,216,0.09)",
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 850, color: CAREER_TEXT, lineHeight: 1.45 }}>
            {index + 1}. {question.text}
          </div>

          <button
            type="button"
            onClick={() => onRemove(question.id)}
            style={{
              fontSize: 11,
              fontWeight: 950,
              padding: "5px 9px",
              borderRadius: "var(--wm-radius-pill)",
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
  );
}

type CustomQuestionProps = {
  customText: string;
  atLimit: boolean;
  addedTexts: Set<string>;
  onCustomTextChange: (value: string) => void;
  onAddCustom: () => void;
};

export function ScreeningCustomQuestionInput({
  customText,
  atLimit,
  addedTexts,
  onCustomTextChange,
  onAddCustom,
}: CustomQuestionProps) {
  if (atLimit) {
    return (
      <div style={{ fontSize: 11.5, color: CAREER_MUTED, marginTop: 7, lineHeight: 1.45 }}>
        Maximum {MAX_SCREENING_QUESTIONS} questions reached. Remove one to add another.
      </div>
    );
  }

  return (
    <div className="wm-field" style={{ marginTop: 4 }}>
      <div className="wm-label">Add custom question</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="wm-input"
          value={customText}
          onChange={(event) => onCustomTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAddCustom();
            }
          }}
          placeholder="Type a Yes/No screening question..."
          maxLength={180}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          style={{ flex: 1 }}
        />

        <button
          type="button"
          onClick={onAddCustom}
          disabled={!customText.trim() || addedTexts.has(customText.trim())}
          style={{
            fontSize: 12,
            fontWeight: 950,
            padding: "0 14px",
            borderRadius: "var(--wm-radius-pill)",
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
  );
}
