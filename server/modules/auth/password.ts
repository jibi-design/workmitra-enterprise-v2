import { hash, verify } from "@node-rs/argon2";

/**
 * MED-03 / STEP 11 — OWASP Password Storage Cheat Sheet Argon2id floors:
 * memoryCost ≥ 65536 (64 MiB), timeCost ≥ 3, parallelism = 1.
 * Encoded hash embeds these params — legacy weaker hashes still verify().
 */
export const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 1,
  algorithm: 2 as const, // argon2id
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, { ...ARGON2_OPTIONS });
}

export async function verifyPassword(plain: string, passwordHash: string): Promise<boolean> {
  try {
    // Params are embedded in the encoded hash — legacy hashes still verify.
    return await verify(passwordHash, plain);
  } catch {
    return false;
  }
}
