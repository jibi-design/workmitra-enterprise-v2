// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerNotesList.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\employerNotes\EmployerNotesList.tsx

import type { EmployerNoteEntry } from "../../types/employerNotes.types";
import { EmployerNoteItem } from "./EmployerNoteItem";

type Props = {
  notes: EmployerNoteEntry[];
  displayNotes: EmployerNoteEntry[];
  showAll: boolean;
  onShowAll: () => void;
  onDeleteRequest: (id: string) => void;
};

export function EmployerNotesList({
  notes,
  displayNotes,
  showAll,
  onShowAll,
  onDeleteRequest,
}: Props) {
  if (notes.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "16px 0",
          color: "var(--wm-er-muted)",
          fontSize: 13,
        }}
      >
        No notes yet.
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 8 }}>
        Notes ({notes.length})
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {displayNotes.map((note) => (
          <EmployerNoteItem key={note.id} note={note} onDelete={onDeleteRequest} />
        ))}
      </div>

      {notes.length > 5 && !showAll && (
        <button
          type="button"
          onClick={onShowAll}
          style={{
            marginTop: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
            color: "var(--wm-er-accent-hr)",
          }}
        >
          View all {notes.length} notes
        </button>
      )}
    </div>
  );
}
