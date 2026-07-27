// App name: Job Mitra
// File name: CareerCreateScreeningSection.tsx — facade

export type { ScreeningQuestion } from "./CareerCreateScreeningSection.helpers";

import { useState } from "react";
import {
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
  MAX_SCREENING_QUESTIONS,
  genScreeningQuestionId,
  getSuggestions,
  type ScreeningQuestion,
} from "./CareerCreateScreeningSection.helpers";
import {
  IconScreening,
  ScreeningAddedQuestions,
  ScreeningCustomQuestionInput,
  ScreeningSuggestionChips,
} from "./CareerCreateScreeningSection.parts";

type Props = {
  jobType: string;
  questions: ScreeningQuestion[];
  onChange: (questions: ScreeningQuestion[]) => void;
};

export function CareerCreateScreeningSection({ jobType, questions, onChange }: Props) {
  const [customText, setCustomText] = useState("");

  const suggestions = getSuggestions(jobType);
  const addedTexts = new Set(questions.map((question) => question.text));
  const atLimit = questions.length >= MAX_SCREENING_QUESTIONS;

  function addQuestion(text: string) {
    const cleanText = text.trim();
    if (atLimit || addedTexts.has(cleanText) || !cleanText) return;
    onChange([...questions, { id: genScreeningQuestionId(), text: cleanText }]);
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

  return (
    <section
      style={{
        marginTop: 12,
        padding: 15,
        borderRadius: "var(--wm-radius-employer-card)",
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
              borderRadius: "var(--wm-radius-chip)",
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
              Optional Yes/No questions applicants must answer before applying. Max{" "}
              {MAX_SCREENING_QUESTIONS}.
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginBottom: 12,
          padding: "10px 11px",
          borderRadius: "var(--wm-radius-chip)",
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

      <ScreeningSuggestionChips
        jobType={jobType}
        suggestions={suggestions}
        addedTexts={addedTexts}
        atLimit={atLimit}
        onAdd={addQuestion}
      />

      <ScreeningAddedQuestions questions={questions} onRemove={removeQuestion} />

      <ScreeningCustomQuestionInput
        customText={customText}
        atLimit={atLimit}
        addedTexts={addedTexts}
        onCustomTextChange={setCustomText}
        onAddCustom={handleAddCustom}
      />
    </section>
  );
}
