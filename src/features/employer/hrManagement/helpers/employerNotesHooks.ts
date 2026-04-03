// src/features/employer/hrManagement/helpers/employerNotesHooks.ts
//
// React hook for Employer Notes (Root Map Section 5.3.C).
// Subscribes to notes storage changes — auto-refreshes UI.

import { useState, useEffect } from "react";
import type { EmployerNoteEntry } from "../types/employerNotes.types";
import { employerNotesStorage } from "../storage/employerNotes.storage";

// ─────────────────────────────────────────────────────────────────────────────
// useEmployerNotes — get all notes for a candidate (auto-refresh)
// ─────────────────────────────────────────────────────────────────────────────

export function useEmployerNotes(hrCandidateId: string): EmployerNoteEntry[] {
  const [notes, setNotes] = useState<EmployerNoteEntry[]>(
    () => employerNotesStorage.getAllForCandidate(hrCandidateId),
  );

  useEffect(() => {
    const refresh = () => setNotes(employerNotesStorage.getAllForCandidate(hrCandidateId));
    refresh();
    return employerNotesStorage.subscribe(refresh);
  }, [hrCandidateId]);

  return notes;
}