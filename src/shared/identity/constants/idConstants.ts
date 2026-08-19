/** Job Mitra | idConstants.ts — Mitra Labs (ML) + Job Mitra (JB) UniCard identity */

/**
 * Character set for ID generation.
 * 32 characters: A-Z (excluding I, O) + 2-9 (excluding 0, 1).
 */
export const ID_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" as const;

/** Role types that can own an ID. */
/** Employer owner personal ID (auth/billing). Company/public ID uses `employer`. */
export type IdOwnerRole = "employee" | "employer" | "employer-owner";

/** Mitra Labs company prefix (first block). */
export const ID_PREFIX = "ML" as const;

/** Job Mitra app short code (leading half of the second block: JBXX). */
export const APP_SHORT_CODE = "JB" as const;

/** Length of the category/type suffix after JB (XX in JBXX). */
export const ID_TYPE_CODE_LENGTH = 2 as const;

/**
 * Role → two-character category/type code (XX in JBXX).
 * Uses ID_CHARSET only (no I/O): EM = employee, ER = employer, WN = owner.
 */
export const ID_TYPE_CODE_BY_ROLE: Record<IdOwnerRole, string> = {
  employee: "EM",
  employer: "ER",
  "employer-owner": "WN",
};

/** Lowercase app tag for local/entity record IDs (shift, staff, career, …). */
export const APP_LOCAL_ID_PREFIX = "jm" as const;

/** Parent company brand shown on identity cards. */
export const ID_BRAND_NAME = "Mitra Labs" as const;

/** UI hint — exact public format. */
export const ID_FORMAT_HINT = "ML-JBXX-ABC-XXXX" as const;

/** Second block length (JB + XX). */
export const ID_APP_TYPE_BLOCK_LENGTH = 4 as const;

/** Length of the name-derived center block (ABC). */
export const ID_NAME_BLOCK_LENGTH = 3 as const;

/** Length of the uniqueness trailing block (XXXX). */
export const ID_UNIQUE_BLOCK_LENGTH = 4 as const;

/** Padding character when name has fewer than 3 usable letters. */
export const ID_NAME_PAD_CHAR = "X" as const;

/** Separator between blocks. */
export const ID_SEPARATOR = "-" as const;

/**
 * Exact format: ML-JBXX-ABC-XXXX
 * Total: 2 + 1 + 4 + 1 + 3 + 1 + 4 = 16 characters.
 */
export const ID_DISPLAY_LENGTH = 16 as const;

/** Maximum retry attempts when a collision is detected. */
export const ID_MAX_COLLISION_RETRIES = 10 as const;

/** localStorage key for the central ID registry. */
export const ID_REGISTRY_KEY = "wm_id_registry_v1" as const;

/**
 * Scopes opaque local/entity ID prefixes with the Job Mitra app tag.
 * Examples: `shift` → `jm_shift`, `jm_stf` → unchanged.
 */
export function scopeAppLocalId(prefix: string): string {
  const trimmed = prefix.trim();
  if (!trimmed) return APP_LOCAL_ID_PREFIX;
  const lower = trimmed.toLowerCase();
  if (lower === APP_LOCAL_ID_PREFIX || lower.startsWith(`${APP_LOCAL_ID_PREFIX}_`)) {
    return trimmed;
  }
  return `${APP_LOCAL_ID_PREFIX}_${trimmed}`;
}

/** Resolves the XX type code for a role (always 2 charset chars). */
export function resolveIdTypeCode(role: IdOwnerRole): string {
  return ID_TYPE_CODE_BY_ROLE[role];
}
