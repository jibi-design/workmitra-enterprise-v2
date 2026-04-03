// src/shared/identity/types/identityTypes.ts

import type { IdOwnerRole } from "../constants/idConstants";

/** A single entry in the central ID registry. */
export type IdRegistryEntry = {
  /** The generated unique ID (e.g., "WM-7K4R-RAH-9T2N"). */
  id: string;

  /** Role that owns this ID. */
  role: IdOwnerRole;

  /** Name used to derive the center block. */
  name: string;

  /** Timestamp (ms) when the ID was created. */
  createdAt: number;
};

/** Shape of the full registry stored in localStorage. */
export type IdRegistry = {
  entries: IdRegistryEntry[];
};

/** Result of an ID generation attempt. */
export type IdGenerationResult =
  | { success: true; id: string }
  | { success: false; reason: string };

/** Result of an ID validation check. */
export type IdValidationResult =
  | { valid: true }
  | { valid: false; reason: string };