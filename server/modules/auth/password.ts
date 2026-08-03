import { hash, verify } from "@node-rs/argon2";

/** MED-5 — OWASP Password Storage Cheat Sheet (2023) Argon2id minimums. */
const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
  algorithm: 2 as const, // argon2id
};

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(plain: string, passwordHash: string): Promise<boolean> {
  try {
    // Params are embedded in the encoded hash — legacy hashes still verify.
    return await verify(passwordHash, plain);
  } catch {
    return false;
  }
}
