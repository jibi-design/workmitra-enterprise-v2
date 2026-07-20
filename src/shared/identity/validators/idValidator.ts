/** Job Mitra | idValidator.ts — validates ML / legacy JM / WM IDs */

import {
  ID_CHARSET,
  ID_PREFIX,
  LEGACY_ID_PREFIXES,
  ID_SEPARATOR,
  ID_BLOCK_LENGTH,
  ID_NAME_BLOCK_LENGTH,
  ID_DISPLAY_LENGTH,
} from "../constants/idConstants";
import type { IdValidationResult } from "../types/identityTypes";

function recomputeLegacyCheckChar(
  block1: string,
  nameBlock: string,
  block3Partial: string,
): string {
  const raw = block1 + nameBlock + block3Partial;
  let sum = 0;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i] === "I" ? "J" : raw[i] === "O" ? "P" : raw[i];
    const charIndex = ID_CHARSET.indexOf(ch);
    const safeIndex = charIndex >= 0 ? charIndex : 0;
    sum += safeIndex * (i + 1);
  }
  return ID_CHARSET[sum % ID_CHARSET.length];
}

function validateCharset(block: string, allowLegacyIo = false): string | null {
  const LEGACY_CHARS = "IO";
  for (const ch of block) {
    if (!ID_CHARSET.includes(ch) && !(allowLegacyIo && LEGACY_CHARS.includes(ch))) {
      return `Invalid character "${ch}" found in ID.`;
    }
  }
  return null;
}

/**
 * Validates a Mitra Labs unique ID.
 * ML IDs use fully random outer blocks; JM/WM legacy IDs retain check-digit block 3.
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

  if (
    prefix !== ID_PREFIX &&
    !LEGACY_ID_PREFIXES.includes(prefix as (typeof LEGACY_ID_PREFIXES)[number])
  ) {
    return {
      valid: false,
      reason: `ID must start with "${ID_PREFIX}" or a legacy prefix (${LEGACY_ID_PREFIXES.join(", ")}).`,
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

  const isLegacy = prefix !== ID_PREFIX;

  const block1Error = validateCharset(block1);
  if (block1Error) {
    return { valid: false, reason: block1Error };
  }

  const nameBlockError = validateCharset(nameBlock, true);
  if (nameBlockError) {
    return { valid: false, reason: nameBlockError };
  }

  const block3Error = validateCharset(block3, isLegacy);
  if (block3Error) {
    return { valid: false, reason: block3Error };
  }

  if (isLegacy) {
    const block3Partial = block3.slice(0, ID_BLOCK_LENGTH - 1);
    const providedCheck = block3[ID_BLOCK_LENGTH - 1];
    const expectedCheck = recomputeLegacyCheckChar(block1, nameBlock, block3Partial);
    const normalizedNameBlock = nameBlock.replace(/I/g, "J").replace(/O/g, "P");
    const normalizedBlock3Partial = block3Partial.replace(/I/g, "J").replace(/O/g, "P");
    const normalizedCheck = recomputeLegacyCheckChar(
      block1,
      normalizedNameBlock,
      normalizedBlock3Partial,
    );

    if (providedCheck !== expectedCheck && providedCheck !== normalizedCheck) {
      return { valid: false, reason: "Check digit mismatch. Please verify the ID for typos." };
    }
  }

  return { valid: true };
}

export function isValidId(id: string): boolean {
  return validateId(id).valid;
}
