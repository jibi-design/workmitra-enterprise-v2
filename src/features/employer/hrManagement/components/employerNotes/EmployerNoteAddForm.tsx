// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerNoteAddForm.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\employerNotes\EmployerNoteAddForm.tsx

type Props = {
  newNote: string;
  onNewNoteChange: (value: string) => void;
  onAddNote: () => void;
};

export function EmployerNoteAddForm({ newNote, onNewNoteChange, onAddNote }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <textarea
        value={newNote}
        onChange={(event) => onNewNoteChange(event.target.value)}
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
          onClick={onAddNote}
          disabled={!newNote.trim()}
          style={{ fontSize: 12, padding: "7px 16px", opacity: newNote.trim() ? 1 : 0.5 }}
        >
          Add Note
        </button>
      </div>
    </div>
  );
}
