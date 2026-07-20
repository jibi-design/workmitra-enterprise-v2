/** Job Mitra | uniqueIdGenerator.ts — Mitra Labs ML identity generator */

import {
  ID_CHARSET,
  ID_PREFIX,
  ID_BLOCK_LENGTH,
  ID_NAME_BLOCK_LENGTH,
  ID_NAME_PAD_CHAR,
  ID_SEPARATOR,
} from "../constants/idConstants";

function randomChar(): string {
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  return ID_CHARSET[array[0] % ID_CHARSET.length];
}

function randomBlock(length: number): string {
  let block = "";
  for (let i = 0; i < length; i++) {
    block += randomChar();
  }
  return block;
}

/**
 * Derives the 3-character center block from a name.
 */
export function deriveNameBlock(name: string): string {
  const letters = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, ID_NAME_BLOCK_LENGTH);

  return letters.padEnd(ID_NAME_BLOCK_LENGTH, ID_NAME_PAD_CHAR);
}

/**
 * Generates a single Mitra Labs unique ID.
 *
 * Format: ML-XXXX-ABC-XXXX
 *   - ML   = Mitra Labs prefix
 *   - XXXX = 4 random alphanumeric characters
 *   - ABC  = first 3 letters of name (padded)
 *   - XXXX = 4 random alphanumeric characters
 */
export function generateRawId(name: string): string {
  const block1 = randomBlock(ID_BLOCK_LENGTH);
  const nameBlock = deriveNameBlock(name);
  const block3 = randomBlock(ID_BLOCK_LENGTH);

  return [ID_PREFIX, block1, nameBlock, block3].join(ID_SEPARATOR);
}
