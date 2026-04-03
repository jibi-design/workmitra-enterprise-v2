// src/shared/identity/constants/idConstants.ts

/**
 * Character set for ID generation.
 * 32 characters: A-Z (excluding I, O) + 2-9 (excluding 0, 1).
 * Avoids visual confusion (0/O, 1/I/l).
 */
export const ID_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" as const;

/** Fixed app-level prefix for all WorkMitra IDs. */
export const ID_PREFIX = "WM" as const;

/** Number of random characters per block (block 1 and block 3). */
export const ID_BLOCK_LENGTH = 4 as const;

/** Length of the name-derived center block. */
export const ID_NAME_BLOCK_LENGTH = 3 as const;

/** Padding character when name has fewer than 3 usable letters. */
export const ID_NAME_PAD_CHAR = "X" as const;

/** Separator between blocks. */
export const ID_SEPARATOR = "-" as const;

/**
 * Final format: WM-XXXX-ABC-XXXX
 * Total display length: 2 + 1 + 4 + 1 + 3 + 1 + 4 = 16 characters.
 */
export const ID_DISPLAY_LENGTH = 16 as const;

/** Maximum retry attempts when a collision is detected. */
export const ID_MAX_COLLISION_RETRIES = 10 as const;

/** localStorage key for the central ID registry. */
export const ID_REGISTRY_KEY = "wm_id_registry_v1" as const;

/** Role types that can own an ID. */
export type IdOwnerRole = "employee" | "employer";