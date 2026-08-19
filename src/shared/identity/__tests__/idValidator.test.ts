// src/shared/identity/__tests__/idValidator.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateId, isValidId } from "../validators/idValidator";
import { generateRawId } from "../generators/uniqueIdGenerator";
import { APP_SHORT_CODE, ID_PREFIX } from "../constants/idConstants";

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
  it("validates a freshly generated ML-JBXX-ABC-XXXX ID", () => {
    const id = generateRawId("Rahul", "employee");
    expect(validateId(id)).toEqual({ valid: true });
  });

  it("validates IDs for names with I and O", () => {
    for (const name of ["Jibin", "Oliver", "Irfan", "Omkar"]) {
      expect(validateId(generateRawId(name, "employee"))).toEqual({ valid: true });
    }
  });

  it("validates IDs for short names with padding", () => {
    expect(validateId(generateRawId("Al", "employee"))).toEqual({ valid: true });
  });

  it("accepts lowercase input (auto-uppercases)", () => {
    const id = generateRawId("Rahul", "employee");
    expect(validateId(id.toLowerCase())).toEqual({ valid: true });
  });

  it("accepts IDs with leading/trailing whitespace", () => {
    const id = generateRawId("Rahul", "employee");
    expect(validateId(`  ${id}  `)).toEqual({ valid: true });
  });

  it("validates known good examples", () => {
    expect(validateId("ML-JBEM-RAH-9T2N")).toEqual({ valid: true });
    expect(validateId("ML-JBER-ACM-4K7P")).toEqual({ valid: true });
    expect(validateId("ML-JBWN-OWN-8H3M")).toEqual({ valid: true });
    expect(validateId("ML-JB7K-TES-2N9R")).toEqual({ valid: true });
  });

  it("allows I/O in name block from real-name derivation", () => {
    expect(validateId("ML-JBEM-OLI-EFGH")).toEqual({ valid: true });
  });

  it("validates 50 randomly generated IDs", () => {
    const names = ["Rahul", "Jibin", "Al", "X", "Oliver", "Priya"];
    const roles = ["employee", "employer", "employer-owner"] as const;
    for (let i = 0; i < 50; i++) {
      const id = generateRawId(names[i % names.length], roles[i % roles.length]);
      expect(validateId(id).valid).toBe(true);
    }
  });
});

describe("validateId — invalid IDs", () => {
  it("rejects empty string", () => {
    expect(validateId("")).toEqual({
      valid: false,
      reason: "ID is empty or not a string.",
    });
  });

  it("rejects null and undefined", () => {
    expect(validateId(null as unknown as string).valid).toBe(false);
    expect(validateId(undefined as unknown as string).valid).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(validateId("ML-JBEM-RAH").valid).toBe(false);
  });

  it("rejects wrong company prefix", () => {
    expect(validateId("XX-JBEM-RAH-EFGH").valid).toBe(false);
  });

  it("rejects missing Job Mitra JB in second block", () => {
    expect(validateId("ML-EMXX-RAH-EFGH").valid).toBe(false);
    expect(validateId("ML-ABCD-RAH-EFGH").valid).toBe(false);
  });

  it("rejects legacy WM / bare JM prefixes", () => {
    expect(validateId("WM-ABCD-RAH-EFGH").valid).toBe(false);
    expect(validateId("JM-ABCD-RAH-EFGH").valid).toBe(false);
    expect(validateId("JM-ML-ABCD-RAH-EFGH").valid).toBe(false);
  });

  it("rejects missing separators", () => {
    expect(validateId("MLJBEMRAHEFGH12").valid).toBe(false);
  });

  it("rejects invalid characters in type or unique blocks", () => {
    expect(validateId("ML-JB00-RAH-EFGH").valid).toBe(false);
    expect(validateId("ML-JBEM-RAH-1111").valid).toBe(false);
  });

  it("rejects I/O in uniqueness block", () => {
    expect(validateId("ML-JBEM-RAH-EFGI").valid).toBe(false);
  });
});

describe("isValidId", () => {
  it("returns true for generated IDs", () => {
    expect(isValidId(generateRawId("Rahul", "employee"))).toBe(true);
  });

  it("returns false for invalid IDs", () => {
    expect(isValidId("nope")).toBe(false);
  });

  it("new IDs match ML-JB… structure", () => {
    const id = generateRawId("Test", "employee");
    expect(id.startsWith(`${ID_PREFIX}-${APP_SHORT_CODE}`)).toBe(true);
    expect(id).toMatch(/^ML-JB[A-Z2-9]{2}-[A-Z]{3}-[A-Z2-9]{4}$/);
  });
});
