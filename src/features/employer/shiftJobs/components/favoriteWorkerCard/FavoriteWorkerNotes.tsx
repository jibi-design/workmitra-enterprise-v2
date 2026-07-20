// App: Job Mitra / WorkMitra_Enterprise_v2
// File: FavoriteWorkerNotes.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\favoriteWorkerCard\FavoriteWorkerNotes.tsx

import type { FavoriteWorker } from "../../storage/favoritesStorage";

type Props = {
  favorite: FavoriteWorker;
  isEditingNotes: boolean;
  notesValue: string;
  onNotesChange: (value: string) => void;
  onSaveNotes: () => void;
  onCancelEditNotes: () => void;
};

export function FavoriteWorkerNotes({
  favorite,
  isEditingNotes,
  notesValue,
  onNotesChange,
  onSaveNotes,
  onCancelEditNotes,
}: Props) {
  return (
    <>
      {favorite.notes && !isEditingNotes && (
        <div
          style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", fontStyle: "italic" }}
        >
          Note: {favorite.notes}
        </div>
      )}

      {isEditingNotes && (
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <input
            className="wm-input"
            value={notesValue}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Add a note about this worker..."
            maxLength={120}
            style={{ flex: 1, fontSize: 12 }}
            autoFocus
          />

          <button
            type="button"
            onClick={onSaveNotes}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "0 12px",
              height: 38,
              borderRadius: 8,
              border: "none",
              background: "var(--wm-er-accent-shift, #16a34a)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Save
          </button>

          <button
            type="button"
            onClick={onCancelEditNotes}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "0 10px",
              height: 38,
              borderRadius: 8,
              border: "1px solid var(--wm-er-border)",
              background: "none",
              color: "var(--wm-er-muted)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
