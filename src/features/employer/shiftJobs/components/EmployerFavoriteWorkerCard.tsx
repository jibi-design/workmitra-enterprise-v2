// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerFavoriteWorkerCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerFavoriteWorkerCard.tsx

import type { FavoriteWorker } from "../storage/favoritesStorage";
import type { InviteTarget } from "../types/employerFavorites.types";
import { FavoriteWorkerAvailabilityBadge } from "./favoriteWorkerCard/FavoriteWorkerAvailabilityBadge";
import { FavoriteWorkerInviteButton } from "./favoriteWorkerCard/FavoriteWorkerInviteButton";
import { FavoriteWorkerActions } from "./favoriteWorkerCard/FavoriteWorkerActions";
import { FavoriteWorkerHeader } from "./favoriteWorkerCard/FavoriteWorkerHeader";
import { FavoriteWorkerMetaRow } from "./favoriteWorkerCard/FavoriteWorkerMetaRow";
import { FavoriteWorkerNotes } from "./favoriteWorkerCard/FavoriteWorkerNotes";

type EmployerFavoriteWorkerCardProps = {
  favorite: FavoriteWorker;
  removingId: string | null;
  editNotesId: string | null;
  notesValue: string;
  onOpenInvite: (target: InviteTarget) => void;
  onStartEditNotes: (workerMlId: string, currentNotes?: string) => void;
  onNotesChange: (value: string) => void;
  onSaveNotes: () => void;
  onCancelEditNotes: () => void;
  onRequestRemove: (workerMlId: string) => void;
  onCancelRemove: () => void;
  onConfirmRemove: (workerMlId: string) => void;
};

export function EmployerFavoriteWorkerCard({
  favorite,
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
}: EmployerFavoriteWorkerCardProps) {
  const isEditingNotes = editNotesId === favorite.workerMlId;
  const isRemoving = removingId === favorite.workerMlId;

  return (
    <div className="wm-er-card">
      <FavoriteWorkerHeader favorite={favorite} />

      <FavoriteWorkerMetaRow favorite={favorite} />

      <FavoriteWorkerAvailabilityBadge workerMlId={favorite.workerMlId} />

      <FavoriteWorkerInviteButton
        target={{ workerMlId: favorite.workerMlId, workerName: favorite.workerName }}
        onOpenInvite={onOpenInvite}
      />

      <FavoriteWorkerNotes
        favorite={favorite}
        isEditingNotes={isEditingNotes}
        notesValue={notesValue}
        onNotesChange={onNotesChange}
        onSaveNotes={onSaveNotes}
        onCancelEditNotes={onCancelEditNotes}
      />

      <FavoriteWorkerActions
        favorite={favorite}
        isEditingNotes={isEditingNotes}
        isRemoving={isRemoving}
        onStartEditNotes={onStartEditNotes}
        onRequestRemove={onRequestRemove}
        onCancelRemove={onCancelRemove}
        onConfirmRemove={onConfirmRemove}
      />
    </div>
  );
}
