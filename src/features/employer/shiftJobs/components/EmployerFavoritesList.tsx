// App name: Job Mitra
// File name: EmployerFavoritesList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerFavoritesList.tsx

import type { FavoriteWorker } from "../storage/favoritesStorage";
import type { InviteTarget } from "../types/employerFavorites.types";
import { EmployerFavoriteWorkerCard } from "./EmployerFavoriteWorkerCard";

type EmployerFavoritesListProps = {
  favorites: FavoriteWorker[];
  totalFavorites: number;
  removingId: string | null;
  editNotesId: string | null;
  notesValue: string;
  onOpenInvite: (target: InviteTarget) => void;
  onStartEditNotes: (workerWmId: string, currentNotes?: string) => void;
  onNotesChange: (value: string) => void;
  onSaveNotes: () => void;
  onCancelEditNotes: () => void;
  onRequestRemove: (workerWmId: string) => void;
  onCancelRemove: () => void;
  onConfirmRemove: (workerWmId: string) => void;
};

export function EmployerFavoritesList({
  favorites,
  totalFavorites,
  removingId,
  editNotesId,
  notesValue,
  onOpenInvite,
  onStartEditNotes,
  onNotesChange,
  onSaveNotes,
  onCancelEditNotes,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
}: EmployerFavoritesListProps) {
  return (
    <div style={{ marginTop: 12, display: "grid", gap: 10, marginBottom: 32 }}>
      {favorites.map((favorite) => (
        <EmployerFavoriteWorkerCard
          key={favorite.id}
          favorite={favorite}
          removingId={removingId}
          editNotesId={editNotesId}
          notesValue={notesValue}
          onOpenInvite={onOpenInvite}
          onStartEditNotes={onStartEditNotes}
          onNotesChange={onNotesChange}
          onSaveNotes={onSaveNotes}
          onCancelEditNotes={onCancelEditNotes}
          onRequestRemove={onRequestRemove}
          onCancelRemove={onCancelRemove}
          onConfirmRemove={onConfirmRemove}
        />
      ))}

      {favorites.length === 0 && totalFavorites > 0 && (
        <div
          style={{ padding: 20, textAlign: "center", fontSize: 12, color: "var(--wm-er-muted)" }}
        >
          No favorites match your search.
        </div>
      )}
    </div>
  );
}
