// src/shared/identity/__tests__/uniqueIdGenerator.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildAppTypeBlock, deriveNameBlock, generateRawId } from "../generators/uniqueIdGenerator";
import {
  APP_SHORT_CODE,
  ID_PREFIX,
  ID_SEPARATOR,
  ID_CHARSET,
  ID_DISPLAY_LENGTH,
  ID_TYPE_CODE_BY_ROLE,
} from "../constants/idConstants";

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
    expect(deriveNameBlock("Lal")).toBe("LAL");
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

describe("buildAppTypeBlock", () => {
  it("builds JB + type code", () => {
    expect(buildAppTypeBlock("EM")).toBe("JBEM");
    expect(buildAppTypeBlock("ER")).toBe("JBER");
    expect(buildAppTypeBlock("WN")).toBe("JBWN");
  });

  it("normalizes and pads short type codes", () => {
    expect(buildAppTypeBlock("e")).toBe("JBEX");
  });
});

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

  it("produces exact format: ML-JBXX-ABC-XXXX", () => {
    const id = generateRawId("Rahul", "employee");
    const parts = id.split(ID_SEPARATOR);

    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe(ID_PREFIX);
    expect(parts[1]).toBe(`JB${ID_TYPE_CODE_BY_ROLE.employee}`);
    expect(parts[1].startsWith(APP_SHORT_CODE)).toBe(true);
    expect(parts[1]).toHaveLength(4);
    expect(parts[2]).toBe("RAH");
    expect(parts[3]).toHaveLength(4);
    expect(id.length).toBe(ID_DISPLAY_LENGTH);
  });

  it("embeds role type codes in JBXX", () => {
    expect(generateRawId("Rahul", "employee").split(ID_SEPARATOR)[1]).toBe("JBEM");
    expect(generateRawId("Acme", "employer").split(ID_SEPARATOR)[1]).toBe("JBER");
    expect(generateRawId("Owner", "employer-owner").split(ID_SEPARATOR)[1]).toBe("JBWN");
  });

  it("embeds the name block as ABC", () => {
    const id = generateRawId("Rahul", "employee");
    expect(id.split(ID_SEPARATOR)[2]).toBe("RAH");
  });

  it("embeds Lal as LAL and starts with ML-JB", () => {
    const id = generateRawId("Lal", "employee");
    expect(id.split(ID_SEPARATOR)[2]).toBe("LAL");
    expect(id.startsWith(`${ID_PREFIX}-${APP_SHORT_CODE}`)).toBe(true);
  });

  it("preserves I and O in name block", () => {
    const id = generateRawId("Jibin", "employee");
    expect(id.split(ID_SEPARATOR)[2]).toBe("JIB");
  });

  it("uses only allowed charset in uniqueness block", () => {
    for (let i = 0; i < 20; i++) {
      const id = generateRawId("Test", "employee");
      const unique = id.split(ID_SEPARATOR)[3];
      for (const ch of unique) {
        expect(ID_CHARSET).toContain(ch);
      }
    }
  });

  it("generates unique IDs across multiple calls", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(generateRawId("Rahul", "employee"));
    }
    expect(ids.size).toBe(50);
  });

  it("accepts explicit XX type code string", () => {
    const id = generateRawId("Rahul", "7K");
    expect(id.split(ID_SEPARATOR)[1]).toBe("JB7K");
  });
});
