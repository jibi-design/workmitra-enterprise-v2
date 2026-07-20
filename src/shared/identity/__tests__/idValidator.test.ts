// src/shared/identity/__tests__/idValidator.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateId, isValidId } from "../validators/idValidator";
import { generateRawId } from "../generators/uniqueIdGenerator";
import { ID_CHARSET, ID_PREFIX } from "../constants/idConstants";

function legacyCheckChar(block1: string, nameBlock: string, block3Partial: string): string {
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

function buildLegacyWmId(block1: string, nameBlock: string, block3Partial: string): string {
  const check = legacyCheckChar(block1, nameBlock, block3Partial);
  return `WM-${block1}-${nameBlock}-${block3Partial}${check}`;
}

beforeEach(() => {
  vi.stubGlobal("crypto", {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  });
});

describe("validateId — valid IDs", () => {
  it("validates a freshly generated ML ID", () => {
    const id = generateRawId("Rahul");
    const result = validateId(id);
    expect(result).toEqual({ valid: true });
  });

  it("validates IDs for names with I and O (Session 18)", () => {
    const names = ["Jibin", "Oliver", "Irfan", "Omkar"];
    for (const name of names) {
      const id = generateRawId(name);
      expect(validateId(id)).toEqual({ valid: true });
    }
  });

  it("validates IDs for short names with padding", () => {
    const id = generateRawId("Al");
    expect(validateId(id)).toEqual({ valid: true });
  });

  it("validates IDs for special character names", () => {
    const id = generateRawId("José");
    expect(validateId(id)).toEqual({ valid: true });
  });

  it("accepts lowercase input (auto-uppercases)", () => {
    const id = generateRawId("Rahul");
    const result = validateId(id.toLowerCase());
    expect(result).toEqual({ valid: true });
  });

  it("accepts IDs with leading/trailing whitespace", () => {
    const id = generateRawId("Rahul");
    const result = validateId(`  ${id}  `);
    expect(result).toEqual({ valid: true });
  });

  it("validates 50 randomly generated ML IDs", () => {
    const names = ["Rahul", "Jibin", "Al", "X", "Oliver", "Priya"];
    for (let i = 0; i < 50; i++) {
      const name = names[i % names.length];
      const id = generateRawId(name);
      expect(validateId(id).valid).toBe(true);
    }
  });

  it("validates legacy WM IDs with check digit", () => {
    const legacyId = buildLegacyWmId("ABCD", "RAH", "EFG");
    expect(validateId(legacyId)).toEqual({ valid: true });
  });
});

describe("validateId — invalid IDs", () => {
  it("rejects empty string", () => {
    const result = validateId("");
    expect(result).toEqual({
      valid: false,
      reason: "ID is empty or not a string.",
    });
  });

  it("rejects null and undefined", () => {
    expect(validateId(null as unknown as string).valid).toBe(false);
    expect(validateId(undefined as unknown as string).valid).toBe(false);
  });

  it("rejects wrong length", () => {
    const result = validateId("ML-ABC-DEF-GHI");
    expect(result.valid).toBe(false);
  });

  it("rejects wrong prefix", () => {
    const result = validateId("XX-ABCD-RAH-EFGH");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain(ID_PREFIX);
    }
  });

  it("rejects missing separators", () => {
    const result = validateId("MLABCDRAHEFGH123");
    expect(result.valid).toBe(false);
  });

  it("rejects invalid characters (0, 1, lowercase in charset)", () => {
    const result = validateId("ML-0000-RAH-1111");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("Invalid character");
    }
  });

  it("rejects legacy checksum mismatch (tampered WM ID)", () => {
    const id = buildLegacyWmId("ABCD", "RAH", "EFG");
    const parts = id.split("-");
    const block3 = parts[3];
    const lastChar = block3[3];
    const tamperedChar = lastChar === "A" ? "B" : "A";
    parts[3] = block3.slice(0, 3) + tamperedChar;
    const tampered = parts.join("-");

    const result = validateId(tampered);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("Check digit");
    }
  });

  it("does not enforce check digit on ML IDs", () => {
    const id = generateRawId("Rahul");
    const parts = id.split("-");
    const block3 = parts[3];
    const lastChar = block3[3];
    const tamperedChar = lastChar === "A" ? "B" : "A";
    parts[3] = block3.slice(0, 3) + tamperedChar;
    const tampered = parts.join("-");

    expect(validateId(tampered)).toEqual({ valid: true });
  });

  it("rejects ID with wrong block lengths", () => {
    expect(validateId("ML-ABC-RAH-EFGH").valid).toBe(false);
    expect(validateId("ML-ABCDE-RAH-EFGH").valid).toBe(false);
  });
});

describe("validateId — backward compatibility", () => {
  it("accepts legacy IDs where I was mapped to J in name block", () => {
    const newId = generateRawId("Jibin");
    expect(validateId(newId).valid).toBe(true);
  });
});

describe("isValidId", () => {
  it("returns true for valid ML IDs", () => {
    const id = generateRawId("Rahul");
    expect(isValidId(id)).toBe(true);
  });

  it("returns false for invalid IDs", () => {
    expect(isValidId("")).toBe(false);
    expect(isValidId("not-an-id")).toBe(false);
    expect(isValidId("ML-0000-RAH-1111")).toBe(false);
  });

  it("returns false for tampered legacy WM IDs", () => {
    const id = buildLegacyWmId("ABCD", "RAH", "EFG");
    const tampered = id.slice(0, -1) + (id.endsWith("A") ? "B" : "A");
    expect(isValidId(tampered)).toBe(false);
  });
});
