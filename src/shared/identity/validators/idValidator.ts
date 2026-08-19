/** Job Mitra | idValidator.ts — validates exact ML-JBXX-ABC-XXXX UniCard IDs */

import {
  APP_SHORT_CODE,
  ID_CHARSET,
  ID_PREFIX,
  ID_SEPARATOR,
  ID_APP_TYPE_BLOCK_LENGTH,
  ID_NAME_BLOCK_LENGTH,
  ID_UNIQUE_BLOCK_LENGTH,
  ID_DISPLAY_LENGTH,
  ID_TYPE_CODE_LENGTH,
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
 * Validates a Job Mitra unique ID.
 * Exact format only: ML-JBXX-ABC-XXXX
 *   - ML   = Mitra Labs
 *   - JBXX = Job Mitra (JB) + two type/category chars (XX)
 *   - ABC  = name block
 *   - XXXX = uniqueness block
 */
export function validateId(id: string): IdValidationResult {
  if (!id || typeof id !== "string") {
    return { valid: false, reason: "ID is empty or not a string." };
  }

  const trimmed = id.trim().toUpperCase();

  if (trimmed.length !== ID_DISPLAY_LENGTH) {
    return {
      valid: false,
      reason: `ID must be exactly ${ID_DISPLAY_LENGTH} characters (ML-JBXX-ABC-XXXX).`,
    };
  }

  const parts = trimmed.split(ID_SEPARATOR);
  if (parts.length !== 4) {
    return {
      valid: false,
      reason: "ID must have exactly 4 blocks separated by dashes (ML-JBXX-ABC-XXXX).",
    };
  }

  const [labsPrefix, appTypeBlock, nameBlock, uniqueBlock] = parts;

  if (labsPrefix !== ID_PREFIX) {
    return { valid: false, reason: `ID must start with "${ID_PREFIX}".` };
  }

  if (appTypeBlock.length !== ID_APP_TYPE_BLOCK_LENGTH) {
    return {
      valid: false,
      reason: `App/type block must be ${ID_APP_TYPE_BLOCK_LENGTH} characters (JBXX).`,
    };
  }

  if (!appTypeBlock.startsWith(APP_SHORT_CODE)) {
    return {
      valid: false,
      reason: `App/type block must start with "${APP_SHORT_CODE}" (Job Mitra).`,
    };
  }

  const typeCode = appTypeBlock.slice(APP_SHORT_CODE.length);
  if (typeCode.length !== ID_TYPE_CODE_LENGTH) {
    return {
      valid: false,
      reason: `Type code (XX) must be ${ID_TYPE_CODE_LENGTH} characters after "${APP_SHORT_CODE}".`,
    };
  }

  const typeError = validateCharset(typeCode);
  if (typeError) {
    return { valid: false, reason: typeError };
  }

  if (nameBlock.length !== ID_NAME_BLOCK_LENGTH) {
    return { valid: false, reason: `Name block must be ${ID_NAME_BLOCK_LENGTH} characters.` };
  }

  // Name block may contain I/O from real-name derivation.
  const nameBlockError = validateCharset(nameBlock, true);
  if (nameBlockError) {
    return { valid: false, reason: nameBlockError };
  }

  if (uniqueBlock.length !== ID_UNIQUE_BLOCK_LENGTH) {
    return {
      valid: false,
      reason: `Uniqueness block must be ${ID_UNIQUE_BLOCK_LENGTH} characters.`,
    };
  }

  const uniqueError = validateCharset(uniqueBlock);
  if (uniqueError) {
    return { valid: false, reason: uniqueError };
  }

  return { valid: true };
}

export function isValidId(id: string): boolean {
  return validateId(id).valid;
}
