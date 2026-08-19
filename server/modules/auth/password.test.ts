/** STEP 11 — MED-03: Argon2id password params meet OWASP minimums. */
import { describe, expect, it } from "vitest";
import { ARGON2_OPTIONS, hashPassword, verifyPassword } from "./password.js";

describe("password Argon2id (MED-03 / STEP 11)", () => {
  it("uses OWASP minimum memoryCost / timeCost / parallelism", () => {
    expect(ARGON2_OPTIONS.memoryCost).toBeGreaterThanOrEqual(65536);
    expect(ARGON2_OPTIONS.timeCost).toBeGreaterThanOrEqual(3);
    expect(ARGON2_OPTIONS.parallelism).toBe(1);
    expect(ARGON2_OPTIONS.algorithm).toBe(2); // argon2id
  });

  it("hashes and verifies a password (params embedded in PHC string)", async () => {
    const plain = "Step11-OWASP-test-password!";
    const encoded = await hashPassword(plain);
    expect(encoded.startsWith("$argon2id$")).toBe(true);
    // PHC: $argon2id$v=19$m=65536,t=3,p=1$...
    expect(encoded).toMatch(/m=65536/);
    expect(encoded).toMatch(/t=3/);
    expect(encoded).toMatch(/p=1/);
    expect(await verifyPassword(plain, encoded)).toBe(true);
    expect(await verifyPassword("wrong-password", encoded)).toBe(false);
  }, 30_000);
});
