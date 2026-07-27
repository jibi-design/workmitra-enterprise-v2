// src/features/employer/shiftJobs/components/ShiftCreateQuickQuestionsSection.tsx
//
// Quick Questions section for shift post creation.

import { useState } from "react";
import {
  AddedQuestionsList,
  CustomQuestionInput,
  QuickQuestionsSectionShell,
  SuggestionChips,
} from "./ShiftCreateQuickQuestionsSection.parts";
import type { QuickQuestion } from "./ShiftCreateQuickQuestionsSection.helpers";
import {
  MAX_QUICK_QUESTIONS,
  capitalizeFirstLetter,
  genQuickQuestionId,
  getSuggestions,
} from "./ShiftCreateQuickQuestionsSection.helpers";

export type { QuickQuestion };

type Props = {
  category: string;
  questions: QuickQuestion[];
  onChange: (questions: QuickQuestion[]) => void;
};

export function ShiftCreateQuickQuestionsSection({ category, questions, onChange }: Props) {
  const [customText, setCustomText] = useState("");

  const suggestions = getSuggestions(category);
  const addedTexts = new Set(questions.map((q) => q.text));
  const atLimit = questions.length >= MAX_QUICK_QUESTIONS;

  function addQuestion(text: string) {
    const normalizedText = capitalizeFirstLetter(text.trim());

    if (atLimit || addedTexts.has(normalizedText) || !normalizedText) return;

    onChange([...questions, { id: genQuickQuestionId(), text: normalizedText }]);
  }

  function removeQuestion(id: string) {
    onChange(questions.filter((q) => q.id !== id));
  }

  function handleAddCustom() {
    const normalizedText = capitalizeFirstLetter(customText.trim());

    if (!normalizedText || addedTexts.has(normalizedText) || atLimit) return;

    addQuestion(normalizedText);
    setCustomText("");
  }

  return (
    <QuickQuestionsSectionShell>
      <SuggestionChips
        category={category}
        suggestions={suggestions}
        addedTexts={addedTexts}
        atLimit={atLimit}
        onAdd={addQuestion}
      />

      <AddedQuestionsList questions={questions} onRemove={removeQuestion} />

      <CustomQuestionInput
        customText={customText}
        atLimit={atLimit}
        addedTexts={addedTexts}
        onChange={setCustomText}
        onAdd={handleAddCustom}
      />
    </QuickQuestionsSectionShell>
  );
}
