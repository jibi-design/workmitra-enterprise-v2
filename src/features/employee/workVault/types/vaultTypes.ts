// src/features/employee/workVault/types/vaultTypes.ts

/** Folder visibility state. */
export type FolderVisibility = "visible" | "hidden";

/** A document folder in the vault. */
export type VaultFolder = {
  id: string;
  name: string;
  icon: string;
  visibility: FolderVisibility;
  sortOrder: number;
  createdAt: number;
};

/** File type for uploaded documents. */
export type VaultFileType = "image" | "pdf";

/** A single document inside a folder. */
export type VaultDocument = {
  id: string;
  folderId: string;
  name: string;
  fileType: VaultFileType;
  base64Data: string;
  thumbnailBase64: string;
  expiryDate: string | null;
  uploadedAt: number;
};

/** Active OTP for vault access. */
export type VaultOTP = {
  code: string;
  generatedAt: number;
  expiresAt: number;
  used: boolean;
};

/** Access session status. */
export type VaultSessionStatus = "active" | "expired" | "revoked";

/** An employer's viewing session. */
export type VaultSession = {
  id: string;
  employerIdentifier: string;
  employerName: string;
  startedAt: number;
  expiresAt: number;
  visibleFolderIds: string[];
  status: VaultSessionStatus;
};

/** A log entry for the employee's access history. */
export type VaultAccessEntry = {
  id: string;
  employerName: string;
  employerIdentifier: string;
  accessedAt: number;
  expiredAt: number;
  visibleFolderIds: string[];
  status: VaultSessionStatus;
};