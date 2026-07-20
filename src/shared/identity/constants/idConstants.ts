/** Job Mitra | idConstants.ts — Mitra Labs universal identity (ML prefix) */

/**
 * Character set for ID generation.
 * 32 characters: A-Z (excluding I, O) + 2-9 (excluding 0, 1).
 */
export const ID_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" as const;

/** Canonical Mitra Labs prefix for all newly generated IDs. */
export const ID_PREFIX = "ML" as const;

/** Legacy prefixes kept for backward compatibility with stored demo IDs. */
export const LEGACY_ID_PREFIX = "JM" as const;
export const LEGACY_WM_PREFIX = "WM" as const;
export const LEGACY_ID_PREFIXES = [LEGACY_ID_PREFIX, LEGACY_WM_PREFIX] as const;

/** Parent company brand shown on identity cards. */
export const ID_BRAND_NAME = "Mitra Labs" as const;

/** UI hint for the hardware-grade ID format. */
export const ID_FORMAT_HINT = "ML-XXXX-ABC-XXXX" as const;

/** Number of random characters per outer block. */
export const ID_BLOCK_LENGTH = 4 as const;

/** Length of the name-derived center block. */
export const ID_NAME_BLOCK_LENGTH = 3 as const;

/** Padding character when name has fewer than 3 usable letters. */
export const ID_NAME_PAD_CHAR = "X" as const;

/** Separator between blocks. */
export const ID_SEPARATOR = "-" as const;

/**
 * Final format: ML-XXXX-ABC-XXXX
 * Total display length: 2 + 1 + 4 + 1 + 3 + 1 + 4 = 16 characters.
 */
export const ID_DISPLAY_LENGTH = 16 as const;

/** Maximum retry attempts when a collision is detected. */
export const ID_MAX_COLLISION_RETRIES = 10 as const;

/** localStorage key for the central ID registry. */
export const ID_REGISTRY_KEY = "wm_id_registry_v1" as const;

/** Role types that can own an ID. */
/** Employer owner personal ID (auth/billing). Company/public ID uses `employer`. */
export type IdOwnerRole = "employee" | "employer" | "employer-owner";
