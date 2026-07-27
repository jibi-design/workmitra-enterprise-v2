// App: Job Mitra / WorkMitra_Enterprise_v2
// File: FavoriteWorkerActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\favoriteWorkerCard\FavoriteWorkerActions.tsx

import type { FavoriteWorker } from "../../storage/favoritesStorage";

type Props = {
  favorite: FavoriteWorker;
  isEditingNotes: boolean;
  isRemoving: boolean;
  onStartEditNotes: (workerMlId: string, currentNotes?: string) => void;
  onRequestRemove: (workerMlId: string) => void;
  onCancelRemove: () => void;
  onConfirmRemove: (workerMlId: string) => void;
};

export function FavoriteWorkerActions({
  favorite,
  isEditingNotes,
  isRemoving,
  onStartEditNotes,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
}: Props) {
  return (
    <div
      style={{
        marginTop: 10,
        display: "flex",
        gap: 8,
        justifyContent: "flex-end",
        flexWrap: "wrap",
      }}
    >
      {!isEditingNotes && (
        <button
          type="button"
          onClick={() => onStartEditNotes(favorite.workerMlId, favorite.notes)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "var(--wm-radius-8)",
            border: "1px solid var(--wm-er-border)",
            background: "none",
            color: "var(--wm-er-muted)",
            cursor: "pointer",
          }}
        >
          {favorite.notes ? "Edit Note" : "Add Note"}
        </button>
      )}

      {isRemoving ? (
        <>
          <span style={{ fontSize: 11, color: "var(--wm-er-muted)", alignSelf: "center" }}>
            Remove from Favorites?
          </span>

          <button
            type="button"
            onClick={() => onConfirmRemove(favorite.workerMlId)}
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "var(--wm-radius-8)",
              border: "none",
              background: "rgba(220,38,38,0.1)",
              color: "var(--wm-error, #dc2626)",
              cursor: "pointer",
            }}
          >
            Yes, Remove
          </button>

          <button
            type="button"
            onClick={onCancelRemove}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "var(--wm-radius-8)",
              border: "1px solid var(--wm-er-border)",
              background: "none",
              color: "var(--wm-er-muted)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => onRequestRemove(favorite.workerMlId)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "var(--wm-radius-8)",
            border: "1px solid rgba(220,38,38,0.2)",
            background: "none",
            color: "var(--wm-error, #dc2626)",
            cursor: "pointer",
          }}
        >
          Remove
        </button>
      )}
    </div>
  );
}
