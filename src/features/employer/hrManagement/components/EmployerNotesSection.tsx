// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerNotesSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\EmployerNotesSection.tsx

import { useState } from "react";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { useEmployerNotes } from "../helpers/employerNotesHooks";
import { employerNotesStorage } from "../storage/employerNotes.storage";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { EmployerNoteAddForm } from "./employerNotes/EmployerNoteAddForm";
import { EmployerNotesHeader } from "./employerNotes/EmployerNotesHeader";
import { EmployerNotesList } from "./employerNotes/EmployerNotesList";

type Props = {
  record: HRCandidateRecord;
};

export function EmployerNotesSection({ record }: Props) {
  const notes = useEmployerNotes(record.id);
  const [newNote, setNewNote] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmData | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const displayNotes = showAll ? notes : notes.slice(0, 5);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    employerNotesStorage.addNote(record.id, newNote);
    setNewNote("");
  };

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id);
    setDeleteConfirm({
      title: "Delete Note",
      message: "This will permanently delete this note. This action cannot be undone.",
      tone: "danger",
      confirmLabel: "Delete Note",
      cancelLabel: "Keep It",
    });
  };

  const handleDeleteConfirm = () => {
    if (pendingDeleteId) {
      employerNotesStorage.deleteNote(pendingDeleteId);
    }

    setPendingDeleteId(null);
    setDeleteConfirm(null);
  };

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      <EmployerNotesHeader />

      <EmployerNoteAddForm
        newNote={newNote}
        onNewNoteChange={setNewNote}
        onAddNote={handleAddNote}
      />

      <EmployerNotesList
        notes={notes}
        displayNotes={displayNotes}
        showAll={showAll}
        onShowAll={() => setShowAll(true)}
        onDeleteRequest={handleDeleteRequest}
      />

      <ConfirmModal
        confirm={deleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setPendingDeleteId(null);
          setDeleteConfirm(null);
        }}
      />
    </div>
  );
}
