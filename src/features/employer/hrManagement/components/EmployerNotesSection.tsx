// src/features/employer/hrManagement/components/EmployerNotesSection.tsx
//
// Employer Notes — Root Map Section 5.3.C.
// Private notes about an employee — only employer can see.
// Date-stamped log style entries. Add, edit, delete with confirmation.
// Employee CANNOT see these notes.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { EmployerNoteEntry } from "../types/employerNotes.types";
import { employerNotesStorage } from "../storage/employerNotes.storage";
import { useEmployerNotes } from "../helpers/employerNotesHooks";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  record: HRCandidateRecord;
};

// ─────────────────────────────────────────────────────────────────────────────
// Note Item Component
// ─────────────────────────────────────────────────────────────────────────────

function NoteItem({
  note,
  onDelete,
}: {
  note: EmployerNoteEntry;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const dateDisplay = new Date(note.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeDisplay = new Date(note.createdAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const wasEdited = note.updatedAt > note.createdAt + 1000;

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    employerNotesStorage.editNote(note.id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        padding: 12,
        background: "#f9fafb",
        borderRadius: 8,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      {/* Date + Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", fontWeight: 700 }}>
          {dateDisplay} at {timeDisplay}
          {wasEdited && (
            <span style={{ marginLeft: 6, fontStyle: "italic", fontWeight: 500 }}>(edited)</span>
          )}
        </div>
        {!isEditing && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--wm-er-accent-hr)",
                padding: 0,
              }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                color: "#dc2626",
                padding: 0,
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "9px 12px",
              fontSize: 13,
              border: "1px solid var(--wm-er-border, #e5e7eb)",
              borderRadius: 8,
              outline: "none",
              background: "#fff",
              color: "var(--wm-er-text)",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="wm-outlineBtn" type="button" onClick={handleCancelEdit} style={{ fontSize: 11, padding: "5px 12px" }}>
              Cancel
            </button>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={handleSaveEdit}
              disabled={!editContent.trim()}
              style={{ fontSize: 11, padding: "5px 12px", opacity: editContent.trim() ? 1 : 0.5 }}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "var(--wm-er-text)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
          {note.content}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Section Component
// ─────────────────────────────────────────────────────────────────────────────

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
      {/* Section Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
          Employer Notes
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
          Private notes — only you can see these
        </div>
      </div>

      {/* Add Note Form */}
      <div style={{ marginBottom: 16 }}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a private note about this employee..."
          rows={3}
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 13,
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: 8,
            outline: "none",
            background: "#fff",
            color: "var(--wm-er-text)",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            style={{ fontSize: 12, padding: "7px 16px", opacity: newNote.trim() ? 1 : 0.5 }}
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      {notes.length > 0 ? (
        <div>
          <div style={{ fontWeight: 800, fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 8 }}>
            Notes ({notes.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayNotes.map((note) => (
              <NoteItem key={note.id} note={note} onDelete={handleDeleteRequest} />
            ))}
          </div>
          {notes.length > 5 && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
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
              View all {notes.length} notes →
            </button>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "16px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>
          No notes yet.
        </div>
      )}

      {/* Delete Confirm Modal */}
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
