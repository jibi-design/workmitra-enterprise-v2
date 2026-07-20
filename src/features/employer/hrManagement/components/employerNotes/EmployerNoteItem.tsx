// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerNoteItem.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\employerNotes\EmployerNoteItem.tsx

import { useState } from "react";
import { employerNotesStorage } from "../../storage/employerNotes.storage";
import type { EmployerNoteEntry } from "../../types/employerNotes.types";

type Props = {
  note: EmployerNoteEntry;
  onDelete: (id: string) => void;
};

export function EmployerNoteItem({ note, onDelete }: Props) {
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
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

      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
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
            <button
              className="wm-outlineBtn"
              type="button"
              onClick={handleCancelEdit}
              style={{ fontSize: 11, padding: "5px 12px" }}
            >
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
        <div
          style={{
            fontSize: 13,
            color: "var(--wm-er-text)",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {note.content}
        </div>
      )}
    </div>
  );
}
