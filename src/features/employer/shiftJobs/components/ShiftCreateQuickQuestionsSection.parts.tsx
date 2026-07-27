import { SectionHead } from "./ShiftCreateIcons";
import type { QuickQuestion } from "./ShiftCreateQuickQuestionsSection.helpers";
import {
  MAX_QUICK_QUESTIONS,
  capitalizeFirstLetter,
} from "./ShiftCreateQuickQuestionsSection.helpers";

export function IconQuestion() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 17h-2v-2h2v2Zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25Z"
      />
    </svg>
  );
}

export function SuggestionChips({
  category,
  suggestions,
  addedTexts,
  atLimit,
  onAdd,
}: {
  category: string;
  suggestions: string[];
  addedTexts: Set<string>;
  atLimit: boolean;
  onAdd: (text: string) => void;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "var(--wm-er-muted)",
          marginBottom: 7,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        Suggested for {category || "this category"}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {suggestions.map((suggestion) => {
          const already = addedTexts.has(suggestion);

          return (
            <button
              key={suggestion}
              type="button"
              disabled={atLimit && !already}
              onClick={() => (already ? undefined : onAdd(suggestion))}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "6px 11px",
                borderRadius: "var(--wm-radius-pill)",
                cursor: already || atLimit ? "default" : "pointer",
                border: already
                  ? "1.5px solid var(--wm-er-accent-shift)"
                  : "1.5px solid var(--wm-er-border)",
                background: already ? "rgba(22,163,74,0.08)" : "var(--wm-er-surface)",
                color: already
                  ? "var(--wm-er-accent-shift)"
                  : atLimit
                    ? "var(--wm-er-muted)"
                    : "var(--wm-er-text)",
                opacity: atLimit && !already ? 0.45 : 1,
              }}
              aria-pressed={already}
            >
              {already ? "Added: " : "+ "}
              {suggestion}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AddedQuestionsList({
  questions,
  onRemove,
}: {
  questions: QuickQuestion[];
  onRemove: (id: string) => void;
}) {
  if (questions.length === 0) return null;

  return (
    <div style={{ marginBottom: 10, display: "grid", gap: 6 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        Added ({questions.length}/{MAX_QUICK_QUESTIONS})
      </div>

      {questions.map((question, index) => (
        <div
          key={question.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "9px 12px",
            borderRadius: "var(--wm-radius-button)",
            background: "rgba(248,250,252,0.95)",
            border: "1px solid rgba(226,232,240,0.95)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--wm-er-text)",
              flex: 1,
              lineHeight: 1.4,
            }}
          >
            Q{index + 1}. {question.text}
          </div>

          <button
            type="button"
            onClick={() => onRemove(question.id)}
            style={{
              fontSize: 11,
              fontWeight: 800,
              padding: "5px 9px",
              borderRadius: "var(--wm-radius-8)",
              border: "none",
              cursor: "pointer",
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
  );
}

export function CustomQuestionInput({
  customText,
  atLimit,
  addedTexts,
  onChange,
  onAdd,
}: {
  customText: string;
  atLimit: boolean;
  addedTexts: Set<string>;
  onChange: (value: string) => void;
  onAdd: () => void;
}) {
  if (atLimit) {
    return (
      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 6, lineHeight: 1.45 }}>
        Maximum {MAX_QUICK_QUESTIONS} questions reached. Remove one to add another.
      </div>
    );
  }

  const normalized = capitalizeFirstLetter(customText.trim());

  return (
    <div className="wm-field" style={{ marginTop: 4 }}>
      <div className="wm-label">Add custom question</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="wm-input"
          value={customText}
          onChange={(e) => onChange(capitalizeFirstLetter(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder="Type a Yes/No question..."
          maxLength={120}
          style={{ flex: 1 }}
        />

        <button
          type="button"
          onClick={onAdd}
          disabled={!normalized || addedTexts.has(normalized)}
          style={{
            fontSize: 12,
            fontWeight: 800,
            padding: "0 14px",
            borderRadius: "var(--wm-radius-10)",
            border: "none",
            background: "var(--wm-er-accent-shift, #16a34a)",
            color: "#fff",
            cursor: "pointer",
            whiteSpace: "nowrap",
            opacity: !normalized ? 0.5 : 1,
            height: 42,
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function QuickQuestionsSectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="wm-er-card"
      style={{
        marginTop: 12,
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(226,232,240,0.95)",
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
      }}
    >
      <SectionHead
        icon={<IconQuestion />}
        title="Quick Questions"
        sub={`Optional Yes/No questions workers must answer when applying. Max ${MAX_QUICK_QUESTIONS} questions.`}
      />
      {children}
    </section>
  );
}
