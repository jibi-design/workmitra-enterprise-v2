/** Job Mitra | uniqueIdGenerator.ts — ML-JBXX-ABC-XXXX identity generator */

import {
  APP_SHORT_CODE,
  ID_CHARSET,
  ID_PREFIX,
  ID_APP_TYPE_BLOCK_LENGTH,
  ID_NAME_BLOCK_LENGTH,
  ID_NAME_PAD_CHAR,
  ID_SEPARATOR,
  ID_TYPE_CODE_LENGTH,
  ID_UNIQUE_BLOCK_LENGTH,
  resolveIdTypeCode,
  type IdOwnerRole,
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
 * Derives the 3-character center block from a name (ABC).
 */
export function deriveNameBlock(name: string): string {
  const letters = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, ID_NAME_BLOCK_LENGTH);

  return letters.padEnd(ID_NAME_BLOCK_LENGTH, ID_NAME_PAD_CHAR);
}

/**
 * Builds the JBXX app+type block.
 * JB = Job Mitra, XX = two category/type characters.
 */
export function buildAppTypeBlock(typeCode: string): string {
  const normalized = typeCode
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, ID_TYPE_CODE_LENGTH)
    .padEnd(ID_TYPE_CODE_LENGTH, "X");

  const block = `${APP_SHORT_CODE}${normalized}`;
  if (block.length !== ID_APP_TYPE_BLOCK_LENGTH) {
    return `${APP_SHORT_CODE}${"X".repeat(ID_TYPE_CODE_LENGTH)}`;
  }
  return block;
}

/**
 * Generates a Mitra Labs + Job Mitra unique ID.
 *
 * Exact format: ML-JBXX-ABC-XXXX
 *   - ML   = Mitra Labs company prefix
 *   - JB   = Job Mitra app short code
 *   - XX   = two category/type letters (from role, or explicit typeCode)
 *   - ABC  = first 3 letters of name (padded)
 *   - XXXX = 4 random alphanumeric characters for uniqueness
 *
 * @param name - Person or company name for the ABC block
 * @param roleOrTypeCode - Owner role (maps to XX) or an explicit 2-char type code
 */
export function generateRawId(name: string, roleOrTypeCode: IdOwnerRole | string = "employee"): string {
  const typeCode =
    roleOrTypeCode === "employee" ||
    roleOrTypeCode === "employer" ||
    roleOrTypeCode === "employer-owner"
      ? resolveIdTypeCode(roleOrTypeCode)
      : roleOrTypeCode;

  const appTypeBlock = buildAppTypeBlock(typeCode);
  const nameBlock = deriveNameBlock(name);
  const uniqueBlock = randomBlock(ID_UNIQUE_BLOCK_LENGTH);

  return [ID_PREFIX, appTypeBlock, nameBlock, uniqueBlock].join(ID_SEPARATOR);
}
