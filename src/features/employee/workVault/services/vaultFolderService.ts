// src/features/employee/workVault/services/vaultFolderService.ts

import type { VaultFolder, FolderVisibility } from "../types/vaultTypes";
import { VAULT_STORAGE_KEYS, DEFAULT_FOLDER_SUGGESTIONS } from "../constants/vaultConstants";
import { readStorage, writeStorage, generateVaultEntityId } from "../helpers/vaultStorageUtils";
import { normalizeFolders } from "../helpers/vaultNormalizers";

/**
 * Reads all folders from storage.
 */
export function getAllFolders(): VaultFolder[] {
  return normalizeFolders(readStorage(VAULT_STORAGE_KEYS.folders));
}

/**
 * Writes all folders to storage.
 */
function saveFolders(folders: VaultFolder[]): void {
  writeStorage(VAULT_STORAGE_KEYS.folders, folders);
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
 */
export function getVisibleFolders(): VaultFolder[] {
  return getAllFolders().filter((f) => f.visibility === "visible");
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