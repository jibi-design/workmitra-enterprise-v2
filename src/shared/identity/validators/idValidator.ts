// src/shared/identity/validators/idValidator.ts

import {
  ID_CHARSET,
  ID_PREFIX,
  ID_SEPARATOR,
  ID_BLOCK_LENGTH,
  ID_NAME_BLOCK_LENGTH,
  ID_DISPLAY_LENGTH,
} from "../constants/idConstants";
import type { IdValidationResult } from "../types/identityTypes";

/**
 * Recomputes the check character for validation.
 * Must mirror computeCheckChar in uniqueIdGenerator.ts exactly.
 */
function recomputeCheckChar(block1: string, nameBlock: string, block3Partial: string): string {
  const raw = block1 + nameBlock + block3Partial;
  let sum = 0;
  for (let i = 0; i < raw.length; i++) {
    const charIndex = ID_CHARSET.indexOf(raw[i]);
    const safeIndex = charIndex >= 0 ? charIndex : 0;
    sum += safeIndex * (i + 1);
  }
  return ID_CHARSET[sum % ID_CHARSET.length];
}

/**
 * Validates a WorkMitra unique ID.
 *
 * Checks:
 * 1. Correct total length (16 chars with separators)
 * 2. Correct prefix ("WM")
 * 3. Correct separator positions
 * 4. All characters in allowed charset
 * 5. Check digit is correct (typo detection)
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
    return { valid: false, reason: `ID must start with "${ID_PREFIX}".` };
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

 const LEGACY_CHARS = "IO";
  const allChars = block1 + nameBlock + block3;
  for (const ch of allChars) {
    if (!ID_CHARSET.includes(ch) && !LEGACY_CHARS.includes(ch)) {
      return { valid: false, reason: `Invalid character "${ch}" found in ID.` };
    }
  }

  const block3Partial = block3.slice(0, ID_BLOCK_LENGTH - 1);
  const providedCheck = block3[ID_BLOCK_LENGTH - 1];
  const expectedCheck = recomputeCheckChar(block1, nameBlock, block3Partial);

  const normalizedNameBlock = nameBlock.replace(/I/g, "J").replace(/O/g, "P");
  const normalizedBlock3Partial = block3Partial.replace(/I/g, "J").replace(/O/g, "P");
  const normalizedCheck = recomputeCheckChar(block1, normalizedNameBlock, normalizedBlock3Partial);

  if (providedCheck !== expectedCheck && providedCheck !== normalizedCheck) {
    return { valid: false, reason: "Check digit mismatch. Please verify the ID for typos." };
  }

  return { valid: true };
}

/**
 * Quick boolean check — useful for inline validation.
 */
export function isValidId(id: string): boolean {
  return validateId(id).valid;
}