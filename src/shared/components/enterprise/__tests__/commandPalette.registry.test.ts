/** Job Mitra | commandPalette.registry.test.ts | Luxury L1 — domain registry coverage */

import { describe, expect, it } from "vitest";
import {
  EMPLOYER_COMMAND_PALETTE_ITEMS,
  commandPaletteDomainCounts,
  filterCommandPaletteItems,
} from "../commandPalette.registry";

describe("EMPLOYER_COMMAND_PALETTE_ITEMS", () => {
  it("includes Planner, Shift, and Career commands", () => {
    const counts = commandPaletteDomainCounts();
    expect(counts.planner).toBeGreaterThan(0);
    expect(counts.shift).toBeGreaterThan(0);
    expect(counts.career).toBeGreaterThan(0);
    expect(counts.general).toBeGreaterThan(0);
  });

  it("only uses static paths without route params", () => {
    for (const item of EMPLOYER_COMMAND_PALETTE_ITEMS) {
      expect(item.path.includes(":")).toBe(false);
      expect(item.path.startsWith("/employer")).toBe(true);
    }
  });
});

describe("filterCommandPaletteItems", () => {
  it("filters by label and keywords", () => {
    const byLabel = filterCommandPaletteItems("demand plan");
    expect(byLabel.some((i) => i.id === "planner-plans" || i.id === "planner-new")).toBe(true);

    const byKeyword = filterCommandPaletteItems("hire again");
    expect(byKeyword.some((i) => i.id === "shift-favorites")).toBe(true);

    const byDomain = filterCommandPaletteItems("career");
    expect(
      byDomain.every((i) => i.domain === "career" || i.label.toLowerCase().includes("career")),
    ).toBe(true);
  });

  it("returns full list for empty query", () => {
    expect(filterCommandPaletteItems("").length).toBe(EMPLOYER_COMMAND_PALETTE_ITEMS.length);
  });
});
