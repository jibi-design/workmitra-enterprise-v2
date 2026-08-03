// src/features/employee/workVault/services/vaultFolderService.ts

import type { VaultFolder, FolderVisibility } from "../types/vaultTypes";
import { DEFAULT_FOLDER_SUGGESTIONS } from "../constants/vaultConstants";
import { readStorage, writeStorage, generateVaultEntityId } from "../helpers/vaultStorageUtils";
import { normalizeFolders } from "../helpers/vaultNormalizers";
import { resolveVaultWorkerScopedKey } from "../../../shared/workVault/vaultWorkerScope";

function foldersKey(workerScopeId?: string): string {
  return resolveVaultWorkerScopedKey("folders_v1", workerScopeId);
}

/**
 * Reads all folders from storage (current worker unless workerScopeId passed).
 */
export function getAllFolders(workerScopeId?: string): VaultFolder[] {
  return normalizeFolders(readStorage(foldersKey(workerScopeId)));
}

/**
 * Writes all folders to storage. Throws when browser storage write fails.
 */
function saveFolders(folders: VaultFolder[], workerScopeId?: string): void {
  const result = writeStorage(foldersKey(workerScopeId), folders);
  if (!result.ok) {
    throw new Error("Browser storage is full or unavailable. Folder changes were not saved.");
  }
}

/**
 * Gets a single folder by ID.
 */
export function getFolderById(folderId: string): VaultFolder | null {
  return getAllFolders().find((f) => f.id === folderId) ?? null;
}

/**
 * Creates a new folder.
 */
export function createFolder(name: string, icon: string): VaultFolder {
  const folders = getAllFolders();
  const maxOrder = folders.reduce((max, f) => Math.max(max, f.sortOrder), 0);

  const folder: VaultFolder = {
    id: generateVaultEntityId(),
    name: name.trim(),
    icon,
    visibility: "visible",
    sortOrder: maxOrder + 1,
    createdAt: Date.now(),
  };

  saveFolders([...folders, folder]);
  return folder;
}

/**
 * Renames a folder.
 */
export function renameFolder(folderId: string, newName: string): boolean {
  const folders = getAllFolders();
  const index = folders.findIndex((f) => f.id === folderId);
  if (index === -1) return false;

  folders[index] = { ...folders[index], name: newName.trim() };
  saveFolders(folders);
  return true;
}

/**
 * Deletes a folder (and its documents should be cleaned up separately).
 */
export function deleteFolder(folderId: string): boolean {
  const folders = getAllFolders();
  const filtered = folders.filter((f) => f.id !== folderId);
  if (filtered.length === folders.length) return false;

  saveFolders(filtered);
  return true;
}

/**
 * Toggles folder visibility.
 */
export function setFolderVisibility(folderId: string, visibility: FolderVisibility): boolean {
  const folders = getAllFolders();
  const index = folders.findIndex((f) => f.id === folderId);
  if (index === -1) return false;

  folders[index] = { ...folders[index], visibility };
  saveFolders(folders);
  return true;
}

/**
 * Sets all folders to a single visibility state.
 */
export function setAllFoldersVisibility(visibility: FolderVisibility): void {
  const folders = getAllFolders().map((f) => ({ ...f, visibility }));
  saveFolders(folders);
}

/**
 * Returns only visible folders (for employer view).
 * Pass workerScopeId when employer reviews a candidate vault.
 */
export function getVisibleFolders(workerScopeId?: string): VaultFolder[] {
  return getAllFolders(workerScopeId).filter((f) => f.visibility === "visible");
}

/**
 * Initializes default folders if vault is empty.
 */
export function initializeDefaultFolders(): VaultFolder[] {
  const existing = getAllFolders();
  if (existing.length > 0) return existing;

  const defaults: VaultFolder[] = DEFAULT_FOLDER_SUGGESTIONS.map((suggestion, index) => ({
    id: generateVaultEntityId(),
    name: suggestion.name,
    icon: suggestion.icon,
    visibility: "visible" as const,
    sortOrder: index + 1,
    createdAt: Date.now(),
  }));

  saveFolders(defaults);
  return defaults;
}
