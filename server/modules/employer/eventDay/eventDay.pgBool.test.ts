import { describe, expect, it } from "vitest";
import { pgBool } from "./eventDay.pgBool.js";

describe("pgBool", () => {
  it("treats Postgres false forms as unused", () => {
    expect(pgBool(false)).toBe(false);
    expect(pgBool("f")).toBe(false);
    expect(pgBool("false")).toBe(false);
    expect(pgBool(0)).toBe(false);
    expect(pgBool(null)).toBe(false);
  });

  it("treats Postgres true forms as entered", () => {
    expect(pgBool(true)).toBe(true);
    expect(pgBool("t")).toBe(true);
    expect(pgBool("true")).toBe(true);
    expect(pgBool(1)).toBe(true);
  });
});
