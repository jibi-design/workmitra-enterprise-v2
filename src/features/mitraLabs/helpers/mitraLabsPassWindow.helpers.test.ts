import { describe, expect, it } from "vitest";
import {
  applyPassDurationPreset,
  isOutsidePassWindow,
  OUTSIDE_PASS_WINDOW_COPY,
  PASS_DURATION_PRESETS,
  toLocalInputValue,
} from "./mitraLabsPassWindow.helpers";

describe("mitraLabsPassWindow.helpers", () => {
  it("exposes multi-day presets", () => {
    expect(PASS_DURATION_PRESETS.map((p) => p.id)).toEqual([
      "single_shift",
      "three_day",
      "one_week",
    ]);
  });

  it("applies preset windows from anchor", () => {
    const anchor = new Date("2026-08-17T09:00:00");
    const window = applyPassDurationPreset("three_day", anchor);
    expect(window.validFrom).toBe(toLocalInputValue(anchor));
    const until = new Date(window.validUntil);
    expect(until.getTime() - anchor.getTime()).toBe(3 * 24 * 60 * 60 * 1000);
  });

  it("detects outside pass window", () => {
    const futurePass = {
      status: "active" as const,
      validFrom: new Date(Date.now() + 60_000).toISOString(),
      validUntil: new Date(Date.now() + 3600_000).toISOString(),
    };
    expect(isOutsidePassWindow(futurePass)).toBe(true);
    expect(OUTSIDE_PASS_WINDOW_COPY).toContain("Outside Event Shift Timing");
  });
});
