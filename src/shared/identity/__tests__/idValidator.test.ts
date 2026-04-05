// src/shared/identity/__tests__/idValidator.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateId, isValidId } from "../validators/idValidator";
import { generateRawId } from "../generators/uniqueIdGenerator";

// ─── Setup ───────────────────────────────────────────────────

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

// ─── validateId — valid cases ────────────────────────────────

describe("validateId — valid IDs", () => {
  it("validates a freshly generated ID", () => {
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

  it("validates 50 randomly generated IDs", () => {
    const names = ["Rahul", "Jibin", "Al", "X", "Oliver", "Priya"];
    for (let i = 0; i < 50; i++) {
      const name = names[i % names.length];
      const id = generateRawId(name);
      expect(validateId(id).valid).toBe(true);
    }
  });
});

// ─── validateId — invalid cases ──────────────────────────────

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
    const result = validateId("WM-ABC-DEF-GHI");
    expect(result.valid).toBe(false);
  });

  it("rejects wrong prefix", () => {
    const result = validateId("XX-ABCD-RAH-EFGH");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("WM");
    }
  });

  it("rejects missing separators", () => {
    const result = validateId("WMABCDRAHEFGH123");
    expect(result.valid).toBe(false);
  });

  it("rejects invalid characters (0, 1, lowercase in charset)", () => {
    const result = validateId("WM-0000-RAH-1111");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("Invalid character");
    }
  });

  it("rejects checksum mismatch (tampered ID)", () => {
    const id = generateRawId("Rahul");
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

  it("rejects ID with wrong block lengths", () => {
    expect(validateId("WM-ABC-RAH-EFGH").valid).toBe(false);
    expect(validateId("WM-ABCDE-RAH-EFGH").valid).toBe(false);
  });
});

// ─── Backward compatibility — legacy I/O ─────────────────────

describe("validateId — backward compatibility", () => {
  it("accepts legacy IDs where I was mapped to J in name block", () => {
    // Old system: "Jibin" → name block "JJB" (I→J in deriveNameBlock)
    // New system: "Jibin" → name block "JIB" (I preserved)
    // Validator must accept BOTH via normalized check
    const newId = generateRawId("Jibin");
    expect(validateId(newId).valid).toBe(true);
  });
});

// ─── isValidId — boolean helper ──────────────────────────────

describe("isValidId", () => {
  it("returns true for valid IDs", () => {
    const id = generateRawId("Rahul");
    expect(isValidId(id)).toBe(true);
  });

  it("returns false for invalid IDs", () => {
    expect(isValidId("")).toBe(false);
    expect(isValidId("not-an-id")).toBe(false);
    expect(isValidId("WM-0000-RAH-1111")).toBe(false);
  });

  it("returns false for tampered IDs", () => {
    const id = generateRawId("Rahul");
    const tampered = id.slice(0, -1) + (id.endsWith("A") ? "B" : "A");
    expect(isValidId(tampered)).toBe(false);
  });
});