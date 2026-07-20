// App name: Job Mitra
// File name: useShiftPostApplyAnswers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\shiftPostApply\useShiftPostApplyAnswers.ts

import { useState } from "react";
import type { AnswerState } from "../../helpers/shiftApplyHelpers";
import type { ShiftAnswerMap, ShiftNoteMap, ShiftQuickAnswerMap } from "./shiftPostApply.types";

export function useShiftPostApplyAnswers() {
  const [mustAns, setMustAns] = useState<ShiftAnswerMap>({});
  const [goodAns, setGoodAns] = useState<ShiftAnswerMap>({});
  const [notes, setNotes] = useState<ShiftNoteMap>({});
  const [quickAnswers, setQuickAnswers] = useState<ShiftQuickAnswerMap>({});

  function handleAnswer(kind: "must" | "good", item: string, value: AnswerState) {
    if (kind === "must") {
      setMustAns((current) => ({ ...current, [item]: value }));
      return;
    }

    setGoodAns((current) => ({ ...current, [item]: value }));
  }

  function handleNote(item: string, value: string) {
    setNotes((current) => ({ ...current, [item]: value }));
  }

  return {
    mustAns,
    goodAns,
    notes,
    quickAnswers,
    setQuickAnswers,
    handleAnswer,
    handleNote,
  };
}
