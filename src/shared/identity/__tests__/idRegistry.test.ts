// src/shared/identity/__tests__/idRegistry.test.ts
// Phase A — ID Registry + Generator + Validator: generation, lookup, validation, edge cases.

import { describe, it, expect, beforeEach } from "vitest";
import {
  generateAndRegisterId,
  lookupById,
  lookupByRole,
  removeFromRegistry,
  clearRegistry,
} from "../registry/idRegistry";
import { deriveNameBlock } from "../generators/uniqueIdGenerator";
import { validateId, isValidId } from "../validators/idValidator";
import { ID_REGISTRY_KEY, ID_DISPLAY_LENGTH } from "../constants/idConstants";

/* ── Setup ── */
beforeEach(() => {
  localStorage.clear();
});

/* ══════════════════════════════════════════════ */
/* ID GENERATION & REGISTRY                      */
/* ══════════════════════════════════════════════ */

describe("generateAndRegisterId", () => {
  it("generates a valid ID for normal name", () => {
    const result = generateAndRegisterId("Rahul", "employee");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.id).toMatch(/^WM-[A-Z2-9]{4}-RAH-[A-Z2-9]{4}$/);
      expect(result.id.length).toBe(ID_DISPLAY_LENGTH);
    }
  });

  it("stores entry in registry", () => {
    const result = generateAndRegisterId("Jibin", "employee");
    if (!result.success) throw new Error("Generation failed");

    const entry = lookupById(result.id);
    expect(entry).not.toBeNull();
    expect(entry!.name).toBe("Jibin");
    expect(entry!.role).toBe("employee");
    expect(entry!.createdAt).toBeTypeOf("number");
  });

  it("works for employer role", () => {
    const result = generateAndRegisterId("TechCorp", "employer");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.id).toContain("-TEC-");
    }
  });

  it("rejects empty name", () => {
    const result = generateAndRegisterId("", "employee");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toContain("required");
  });

  it("rejects whitespace-only name", () => {
    const result = generateAndRegisterId("   ", "employee");
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const result = generateAndRegisterId("  Rahul  ", "employee");
    expect(result.success).toBe(true);
    if (result.success) {
      const entry = lookupById(result.id);
      expect(entry!.name).toBe("Rahul");
    }
  });

  it("generates unique IDs across multiple calls", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const result = generateAndRegisterId("Test", "employee");
      if (result.success) ids.add(result.id);
    }
    expect(ids.size).toBe(20);
  });
});

/* ── Lookup ── */
describe("lookupById", () => {
  it("returns null for non-existent ID", () => {
    expect(lookupById("WM-FAKE-XXX-1234")).toBeNull();
  });

  it("finds registered ID", () => {
    const result = generateAndRegisterId("Ali", "employee");
    if (!result.success) throw new Error("Failed");
    expect(lookupById(result.id)).not.toBeNull();
  });
});

describe("lookupByRole", () => {
  it("filters by role correctly", () => {
    generateAndRegisterId("Worker1", "employee");
    generateAndRegisterId("Worker2", "employee");
    generateAndRegisterId("Company1", "employer");

    expect(lookupByRole("employee")).toHaveLength(2);
    expect(lookupByRole("employer")).toHaveLength(1);
  });

  it("returns empty for no matches", () => {
    expect(lookupByRole("employee")).toHaveLength(0);
  });
});

/* ── Remove & Clear ── */
describe("removeFromRegistry", () => {
  it("removes existing entry", () => {
    const result = generateAndRegisterId("Test", "employee");
    if (!result.success) throw new Error("Failed");

    expect(removeFromRegistry(result.id)).toBe(true);
    expect(lookupById(result.id)).toBeNull();
  });

  it("returns false for non-existent ID", () => {
    expect(removeFromRegistry("WM-FAKE-XXX-1234")).toBe(false);
  });
});

describe("clearRegistry", () => {
  it("removes all entries", () => {
    generateAndRegisterId("A", "employee");
    generateAndRegisterId("B", "employer");
    clearRegistry();

    expect(localStorage.getItem(ID_REGISTRY_KEY)).toBeNull();
    expect(lookupByRole("employee")).toHaveLength(0);
  });
});

/* ── Corrupted Storage ── */
describe("corrupted registry storage", () => {
  it("returns empty registry for invalid JSON", () => {
    localStorage.setItem(ID_REGISTRY_KEY, "BROKEN");
    expect(lookupByRole("employee")).toEqual([]);
  });

  it("returns empty entries for missing entries field", () => {
    localStorage.setItem(ID_REGISTRY_KEY, '{"other":"data"}');
    expect(lookupByRole("employee")).toEqual([]);
  });
});

/* ══════════════════════════════════════════════ */
/* NAME BLOCK DERIVATION                         */
/* ══════════════════════════════════════════════ */

describe("deriveNameBlock", () => {
  it("normal name → first 3 uppercase letters", () => {
    expect(deriveNameBlock("Rahul")).toBe("RAH");
  });

  it("preserves I and O (Session 18 fix)", () => {
    expect(deriveNameBlock("Jibin")).toBe("JIB");
    expect(deriveNameBlock("Oscar")).toBe("OSC");
  });

  it("short name padded with X", () => {
    expect(deriveNameBlock("Al")).toBe("ALX");
  });

  it("single character padded", () => {
    expect(deriveNameBlock("X")).toBe("XXX");
  });

  it("strips numbers", () => {
    expect(deriveNameBlock("John3")).toBe("JOH");
  });

  it("strips special characters", () => {
    expect(deriveNameBlock("O'Brien")).toBe("OBR");
  });

  it("handles accented characters by stripping them", () => {
    expect(deriveNameBlock("José")).toBe("JOS");
  });

  it("handles all-number input", () => {
    expect(deriveNameBlock("123")).toBe("XXX");
  });

  it("handles empty string", () => {
    expect(deriveNameBlock("")).toBe("XXX");
  });
});

/* ══════════════════════════════════════════════ */
/* ID VALIDATION                                 */
/* ══════════════════════════════════════════════ */

describe("validateId", () => {
  it("validates a freshly generated ID", () => {
    const result = generateAndRegisterId("Rahul", "employee");
    if (!result.success) throw new Error("Failed");

    const validation = validateId(result.id);
    expect(validation.valid).toBe(true);
  });

  it("rejects empty input", () => {
    expect(validateId("").valid).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(validateId("WM-AB-C-D").valid).toBe(false);
  });

  it("rejects wrong prefix", () => {
    expect(validateId("XX-ABCD-RAH-1234").valid).toBe(false);
  });

  it("rejects wrong separator count", () => {
    expect(validateId("WM-ABCD-RAH1234X").valid).toBe(false);
  });

  it("rejects invalid characters (0, 1, lowercase)", () => {
    const r = validateId("WM-0000-RAH-1111");
    expect(r.valid).toBe(false);
  });

  it("accepts case-insensitive input (auto uppercases)", () => {
    const result = generateAndRegisterId("Test", "employee");
    if (!result.success) throw new Error("Failed");
    const lower = result.id.toLowerCase();
    expect(validateId(lower).valid).toBe(true);
  });

  it("trims whitespace before validation", () => {
    const result = generateAndRegisterId("Test", "employee");
    if (!result.success) throw new Error("Failed");
    expect(validateId(`  ${result.id}  `).valid).toBe(true);
  });

  it("detects check digit tampering", () => {
    const result = generateAndRegisterId("Test", "employee");
    if (!result.success) throw new Error("Failed");
    // Flip the last character
    const parts = result.id.split("-");
    const block3 = parts[3];
    const lastChar = block3[3];
    const flipped = lastChar === "A" ? "B" : "A";
    parts[3] = block3.slice(0, 3) + flipped;
    const tampered = parts.join("-");

    expect(validateId(tampered).valid).toBe(false);
  });
});

describe("isValidId (quick boolean)", () => {
  it("returns true for valid ID", () => {
    const result = generateAndRegisterId("Quick", "employee");
    if (!result.success) throw new Error("Failed");
    expect(isValidId(result.id)).toBe(true);
  });

  it("returns false for garbage input", () => {
    expect(isValidId("garbage")).toBe(false);
  });

  it("handles null/undefined gracefully", () => {
    expect(isValidId(null as unknown as string)).toBe(false);
    expect(isValidId(undefined as unknown as string)).toBe(false);
  });
});

/* ── Legacy I/O Compatibility (Session 18) ── */
describe("legacy I/O backward compatibility", () => {
  it("validator accepts I and O in name block (legacy IDs)", () => {
    // Legacy IDs had I→J, O→P mapping. New IDs preserve I/O.
    // Validator must accept BOTH formats.
    const newResult = generateAndRegisterId("Jibin", "employee");
    if (!newResult.success) throw new Error("Failed");

    // New format should have "JIB" in name block
    expect(newResult.id).toContain("-JIB-");
    expect(validateId(newResult.id).valid).toBe(true);
  });
});