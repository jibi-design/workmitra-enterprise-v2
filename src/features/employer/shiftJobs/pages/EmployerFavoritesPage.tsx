// App name: Job Mitra | EmployerFavoritesPage.tsx — stackGrid (Wave 3)

import { EmployerFavoriteAddCard } from "../components/EmployerFavoriteAddCard";
import { EmployerFavoritesEmptyState } from "../components/EmployerFavoritesEmptyState";
import { EmployerFavoritesHeader } from "../components/EmployerFavoritesHeader";
import { EmployerFavoritesList } from "../components/EmployerFavoritesList";
import { EmployerFavoritesSearch } from "../components/EmployerFavoritesSearch";
import { EmployerInviteToShiftModal } from "../components/EmployerInviteToShiftModal";
import { useEmployerFavoritesPageState } from "../hooks/useEmployerFavoritesPageState";

export function EmployerFavoritesPage() {
  const {
    favorites,
    filteredFavorites,
    search,
    addInput,
    addName,
    addError,
    addSuccess,
    removingId,
    editNotesId,
    notesValue,
    inviteTarget,
    setSearch,
    setRemovingId,
    setNotesValue,
    handleAddInputChange,
    handleAddNameChange,
    handleAddManual,
    handleRemove,
    startEditNotes,
    cancelEditNotes,
    handleSaveNotes,
    openInvite,
    closeInvite,
  } = useEmployerFavoritesPageState();

  return (
    <div
      className="wm-er-vShift wm-stackGrid"
      data-testid="employer-favorites-page"
      style={{ gap: "var(--wm-stack-gap)", paddingBottom: 32 }}
    >
      {inviteTarget ? (
        <EmployerInviteToShiftModal target={inviteTarget} onClose={closeInvite} />
      ) : null}

      <EmployerFavoritesHeader totalFavorites={favorites.length} />

      <EmployerFavoriteAddCard
        addInput={addInput}
        addName={addName}
        addError={addError}
        addSuccess={addSuccess}
        onAddInputChange={handleAddInputChange}
        onAddNameChange={handleAddNameChange}
        onAddManual={handleAddManual}
      />

      <EmployerFavoritesSearch
        show={favorites.length > 3}
        search={search}
        onSearchChange={setSearch}
      />

      <EmployerFavoritesEmptyState show={favorites.length === 0} />

      <EmployerFavoritesList
        favorites={filteredFavorites}
        totalFavorites={favorites.length}
        removingId={removingId}
        editNotesId={editNotesId}
        notesValue={notesValue}
        onOpenInvite={openInvite}
        onStartEditNotes={startEditNotes}
        onNotesChange={setNotesValue}
        onSaveNotes={handleSaveNotes}
        onCancelEditNotes={cancelEditNotes}
        onRequestRemove={setRemovingId}
        onCancelRemove={() => setRemovingId(null)}
        onConfirmRemove={handleRemove}
      />
    </div>
  );
}
