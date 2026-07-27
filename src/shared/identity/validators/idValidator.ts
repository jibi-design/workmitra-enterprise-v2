/** Job Mitra | idValidator.ts — validates Mitra Labs ML IDs only */

import {
  ID_CHARSET,
  ID_PREFIX,
  ID_SEPARATOR,
  ID_BLOCK_LENGTH,
  ID_NAME_BLOCK_LENGTH,
  ID_DISPLAY_LENGTH,
} from "../constants/idConstants";
import type { IdValidationResult } from "../types/identityTypes";

function validateCharset(block: string, allowIo = false): string | null {
  const EXTRA = "IO";
  for (const ch of block) {
    if (!ID_CHARSET.includes(ch) && !(allowIo && EXTRA.includes(ch))) {
      return `Invalid character "${ch}" found in ID.`;
    }
  }
  return null;
}

/**
 * Validates a Mitra Labs unique ID.
 * Format: ML-XXXX-ABC-XXXX (legacy WM/JM prefixes are rejected).
 */
export function validateId(id: string): IdValidationResult {
  if (!id || typeof id !== "string") {
    return { valid: false, reason: "ID is empty or not a string." };
  }

  const trimmed = id.trim().toUpperCase();

  if (trimmed.length !== ID_DISPLAY_LENGTH) {
    return { valid: false, reason: `ID must be exactly ${ID_DISPLAY_LENGTH} characters.` };
  }

  const parts = trimmed.split(ID_SEPARATOR);

  if (parts.length !== 4) {
    return { valid: false, reason: "ID must have exactly 4 blocks separated by dashes." };
  }

  const [prefix, block1, nameBlock, block3] = parts;

  if (prefix !== ID_PREFIX) {
    return {
      valid: false,
      reason: `ID must start with "${ID_PREFIX}".`,
    };
  }

  if (block1.length !== ID_BLOCK_LENGTH) {
    return { valid: false, reason: `Block 1 must be ${ID_BLOCK_LENGTH} characters.` };
  }

  if (nameBlock.length !== ID_NAME_BLOCK_LENGTH) {
    return { valid: false, reason: `Name block must be ${ID_NAME_BLOCK_LENGTH} characters.` };
  }

  if (block3.length !== ID_BLOCK_LENGTH) {
    return { valid: false, reason: `Block 3 must be ${ID_BLOCK_LENGTH} characters.` };
  }

  const block1Error = validateCharset(block1);
  if (block1Error) {
    return { valid: false, reason: block1Error };
  }

  // Name block may contain I/O from real-name derivation (ML outer blocks stay strict).
  const nameBlockError = validateCharset(nameBlock, true);
  if (nameBlockError) {
    return { valid: false, reason: nameBlockError };
  }

  const block3Error = validateCharset(block3);
  if (block3Error) {
    return { valid: false, reason: block3Error };
  }

  return { valid: true };
}

export function isValidId(id: string): boolean {
  return validateId(id).valid;
}
