// src/shared/identity/generators/uniqueIdGenerator.ts

import {
  ID_CHARSET,
  ID_PREFIX,
  ID_BLOCK_LENGTH,
  ID_NAME_BLOCK_LENGTH,
  ID_NAME_PAD_CHAR,
  ID_SEPARATOR,
} from "../constants/idConstants";

/**
 * Generates a cryptographically random character from ID_CHARSET.
 */
function randomChar(): string {
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  return ID_CHARSET[array[0] % ID_CHARSET.length];
}

/**
 * Generates a random block of specified length.
 */
function randomBlock(length: number): string {
  let block = "";
  for (let i = 0; i < length; i++) {
    block += randomChar();
  }
  return block;
}

/**
 * Derives the 3-character center block from a name.
 * - Strips non-A-Z characters.
 * - Takes first 3 uppercase letters.
 * - Pads with "X" if fewer than 3 letters.
 *
 * Examples:
 *   "Rahul"   → "RAH"
 *   "Al"      → "ALX"
 *   "X"       → "XXX"
 *   "José"    → "JOS"
 */
export function deriveNameBlock(name: string): string {
  const letters = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, ID_NAME_BLOCK_LENGTH);

  return letters.padEnd(ID_NAME_BLOCK_LENGTH, ID_NAME_PAD_CHAR);
}

/**
 * Computes a single check character from the raw ID characters.
 * Uses a weighted sum mod 32 mapped back to ID_CHARSET.
 */
function charToChecksumSafe(ch: string): string {
  if (ch === "I") return "J";
  if (ch === "O") return "P";
  return ch;
}

function computeCheckChar(block1: string, nameBlock: string, block3Partial: string): string {
  const raw = block1 + nameBlock + block3Partial;
  let sum = 0;
  for (let i = 0; i < raw.length; i++) {
    const safeCh = charToChecksumSafe(raw[i]);
    const charIndex = ID_CHARSET.indexOf(safeCh);
    const safeIndex = charIndex >= 0 ? charIndex : 0;
    sum += safeIndex * (i + 1);
  }
  return ID_CHARSET[sum % ID_CHARSET.length];
}

/**
 * Generates a single WorkMitra unique ID.
 *
  * Format: WM-XXXX-ABC-XXXX
 *   - WM      = fixed prefix
 *   - XXXX    = 4 random characters (block 1)
 *   - ABC     = first 3 letters of name
 *   - XXX+C   = 3 random characters + 1 check character (block 3)
 *
 * @param name - The name to embed (employee name or company name).
 * @returns The generated ID string.
 */
export function generateRawId(name: string): string {
  const block1 = randomBlock(ID_BLOCK_LENGTH);
  const nameBlock = deriveNameBlock(name);
  const block3Partial = randomBlock(ID_BLOCK_LENGTH - 1);
  const checkChar = computeCheckChar(block1, nameBlock, block3Partial);
  const block3 = block3Partial + checkChar;

  return [ID_PREFIX, block1, nameBlock, block3].join(ID_SEPARATOR);
}