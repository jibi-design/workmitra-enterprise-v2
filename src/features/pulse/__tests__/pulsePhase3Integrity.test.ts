import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ARRIVAL_ENVELOPE } from "../pulseBreathTokens";
import { usePulseStore } from "../pulseStore";

describe("Breathing Light Pro — Phase 3 arrival + integrity", () => {
  it("arrival envelope matches 2.5s resolve lock", () => {
    expect(ARRIVAL_ENVELOPE.periodMs).toBe(2500);
    expect(ARRIVAL_ENVELOPE.attackEnd).toBeLessThan(ARRIVAL_ENVELOPE.holdEnd);
    expect(ARRIVAL_ENVELOPE.holdEnd).toBeLessThan(ARRIVAL_ENVELOPE.releaseEnd);
  });

  it("CSS arrival + destination keyframes are LED-only (no layout props)", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/app/theme/components/pulse-engine.css"),
      "utf8",
    );
    expect(css).toContain("@keyframes wm-led-arrival-pro");
    expect(css).toContain("@keyframes wm-led-destination-pro");
    expect(css).toContain(".wm-led-destination");
    expect(css).toMatch(/4%/);
    expect(css).toMatch(/14%/);
    expect(css).toMatch(/68%/);
    expect(css).toMatch(/95%/);
    expect(css).not.toMatch(/@keyframes[\s\S]*?\b(left|width|height)\s*:/);
  });

  it("shouldDimNode never dims siblings", () => {
    expect(usePulseStore.getState().shouldDimNode("any-node")).toBe(false);
  });
});
