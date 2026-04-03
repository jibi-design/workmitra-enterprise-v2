// src/features/employer/hrManagement/types/employerNotes.types.ts
//
// Types for Employer Notes (Root Map Section 5.3.C).
// Private notes about an employee — only employer can see.
// Date-stamped entries, log style, multiple notes per employee.

// ─────────────────────────────────────────────────────────────────────────────
// Note Entry
// ─────────────────────────────────────────────────────────────────────────────

export type EmployerNoteEntry = {
  /** Unique note ID */
  id: string;
  /** HR candidate record ID (links to HRCandidateRecord) */
  hrCandidateId: string;
  /** Note content (free text) */
  content: string;
  /** Created timestamp (date stamp for log style) */
  createdAt: number;
  /** Last updated timestamp */
  updatedAt: number;
};