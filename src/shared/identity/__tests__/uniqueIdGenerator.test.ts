// src/shared/identity/__tests__/uniqueIdGenerator.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { deriveNameBlock, generateRawId } from "../generators/uniqueIdGenerator";
import {
  ID_PREFIX,
  ID_SEPARATOR,
  ID_CHARSET,
  ID_DISPLAY_LENGTH,
} from "../constants/idConstants";

// ─── deriveNameBlock ─────────────────────────────────────────

describe("deriveNameBlock", () => {
  it("extracts first 3 uppercase letters from a normal name", () => {
    expect(deriveNameBlock("Rahul")).toBe("RAH");
    expect(deriveNameBlock("Suresh")).toBe("SUR");
    expect(deriveNameBlock("Priya")).toBe("PRI");
  });

  it("preserves I and O in names (Session 18 fix)", () => {
    expect(deriveNameBlock("Jibin")).toBe("JIB");
    expect(deriveNameBlock("Oliver")).toBe("OLI");
    expect(deriveNameBlock("Irfan")).toBe("IRF");
  });

  it("pads short names with X", () => {
    expect(deriveNameBlock("Al")).toBe("ALX");
    expect(deriveNameBlock("X")).toBe("XXX");
  });

  it("strips non-A-Z characters", () => {
    expect(deriveNameBlock("José")).toBe("JOS");
    expect(deriveNameBlock("O'Brien")).toBe("OBR");
    expect(deriveNameBlock("John3")).toBe("JOH");
    expect(deriveNameBlock("A-B-C")).toBe("ABC");
  });

  it("handles leading/trailing spaces", () => {
    expect(deriveNameBlock("  Rahul  ")).toBe("RAH");
  });

  it("handles all-numeric or all-special input", () => {
    expect(deriveNameBlock("123")).toBe("XXX");
    expect(deriveNameBlock("@#$")).toBe("XXX");
  });

  it("is case-insensitive", () => {
    expect(deriveNameBlock("rahul")).toBe("RAH");
    expect(deriveNameBlock("RAHUL")).toBe("RAH");
    expect(deriveNameBlock("rAhUl")).toBe("RAH");
  });

  it("takes only first 3 letters regardless of name length", () => {
    expect(deriveNameBlock("Alexandros")).toBe("ALE");
    expect(deriveNameBlock("Bartholomew")).toBe("BAR");
  });
});

// ─── generateRawId ───────────────────────────────────────────

describe("generateRawId", () => {
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

  it("produces correct format: WM-XXXX-XXX-XXXX", () => {
    const id = generateRawId("Rahul");
    const parts = id.split(ID_SEPARATOR);

    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe(ID_PREFIX);
    expect(parts[1]).toHaveLength(4);
    expect(parts[2]).toHaveLength(3);
    expect(parts[3]).toHaveLength(4);
  });

  it("has correct display length of 16 characters", () => {
    const id = generateRawId("Suresh");
    expect(id.length).toBe(ID_DISPLAY_LENGTH);
  });

  it("embeds the name block in the center position", () => {
    const id = generateRawId("Rahul");
    const nameBlock = id.split(ID_SEPARATOR)[2];
    expect(nameBlock).toBe("RAH");
  });

  it("preserves I and O in name block", () => {
    const id = generateRawId("Jibin");
    const nameBlock = id.split(ID_SEPARATOR)[2];
    expect(nameBlock).toBe("JIB");
  });

  it("uses only allowed charset in random blocks", () => {
    for (let i = 0; i < 20; i++) {
      const id = generateRawId("Test");
      const parts = id.split(ID_SEPARATOR);
      const block1 = parts[1];
      const block3 = parts[3];

      for (const ch of block1 + block3) {
        expect(ID_CHARSET).toContain(ch);
      }
    }
  });

  it("generates unique IDs across multiple calls", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(generateRawId("Rahul"));
    }
    expect(ids.size).toBe(50);
  });

  it("produces valid prefix for all names", () => {
    const names = ["Al", "X", "José", "O'Brien", "Alexandros"];
    for (const name of names) {
      const id = generateRawId(name);
      expect(id.startsWith(`${ID_PREFIX}${ID_SEPARATOR}`)).toBe(true);
    }
  });
});