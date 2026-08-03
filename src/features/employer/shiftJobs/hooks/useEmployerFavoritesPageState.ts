// App name: Job Mitra
// File name: useEmployerFavoritesPageState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\useEmployerFavoritesPageState.ts

import { useMemo, useState, useSyncExternalStore } from "react";
import { favoritesStorage, type FavoriteWorker } from "../storage/favoritesStorage";
import type { InviteTarget } from "../types/employerFavorites.types";
import { resolveShiftEmployerScopedKey } from "../../../shared/shift/shiftEmployerScope";

let favoritesRawCache: string | null = "__init__";
let favoritesKeyCache = "";
let favoritesListCache: FavoriteWorker[] = [];

function getFavoritesSnapshot(): FavoriteWorker[] {
  const key = resolveShiftEmployerScopedKey("shift_favorites_v1");
  const raw = localStorage.getItem(key);

  if (raw !== favoritesRawCache || key !== favoritesKeyCache) {
    favoritesRawCache = raw;
    favoritesKeyCache = key;
    favoritesListCache = favoritesStorage.getAll();
  }

  return favoritesListCache;
}

export function useEmployerFavoritesPageState() {
  const favorites = useSyncExternalStore(
    favoritesStorage.subscribe,
    getFavoritesSnapshot,
    getFavoritesSnapshot,
  );

  const [search, setSearch] = useState("");
  const [addInput, setAddInput] = useState("");
  const [addName, setAddName] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editNotesId, setEditNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [inviteTarget, setInviteTarget] = useState<InviteTarget | null>(null);

  const filteredFavorites = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return favorites;

    return favorites.filter(
      (favorite) =>
        favorite.workerName.toLowerCase().includes(query) ||
        favorite.workerMlId.toLowerCase().includes(query) ||
        (favorite.jobTitle ?? "").toLowerCase().includes(query),
    );
  }, [favorites, search]);

  function handleAddInputChange(value: string) {
    setAddInput(value);
    setAddError("");
  }

  function handleAddNameChange(value: string) {
    setAddName(value);
    setAddError("");
  }

  function handleAddManual() {
    const workerMlId = addInput.trim().toUpperCase();
    const workerName = addName.trim();

    if (!workerMlId) {
      setAddError("Enter a Mitra Labs ID.");
      return;
    }

    if (!workerName) {
      setAddError("Enter the worker's name.");
      return;
    }

    if (favoritesStorage.isFavorite(workerMlId)) {
      setAddError("This worker is already in your Favorites.");
      return;
    }

    favoritesStorage.addManual({ workerMlId, workerName });
    setAddInput("");
    setAddName("");
    setAddError("");
    setAddSuccess(`${workerName} added to Favorites.`);
    setTimeout(() => setAddSuccess(""), 2500);
  }

  function handleRemove(workerMlId: string) {
    favoritesStorage.remove(workerMlId);
    setRemovingId(null);
  }

  function startEditNotes(workerMlId: string, currentNotes?: string) {
    setEditNotesId(workerMlId);
    setNotesValue(currentNotes ?? "");
  }

  function cancelEditNotes() {
    setEditNotesId(null);
    setNotesValue("");
  }

  function handleSaveNotes() {
    if (!editNotesId) return;

    favoritesStorage.updateNotes(editNotesId, notesValue);
    setEditNotesId(null);
    setNotesValue("");
  }

  function openInvite(target: InviteTarget) {
    setInviteTarget(target);
  }

  function closeInvite() {
    setInviteTarget(null);
  }

  return {
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
  };
}
