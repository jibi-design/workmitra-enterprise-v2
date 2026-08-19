import { describe, expect, it } from "vitest";
import {
  BREATH_WAVE_WEIGHTS,
  breathIntensityAt,
  getBreathCssVars,
  getBreathProfile,
  hueDegFromHex,
  PULSE_BREATH_GAMMA_INV,
} from "../pulseBreathTokens";

describe("pulseBreathTokens (Phase 1)", () => {
  it("raised-cosine + gamma is 0 at trough and 1 at peak (normalized amp)", () => {
    expect(breathIntensityAt(0, 0, 1)).toBeCloseTo(0, 5);
    expect(breathIntensityAt(0.5, 0, 1)).toBeCloseTo(1, 5);
    expect(breathIntensityAt(1, 0, 1)).toBeCloseTo(0, 5);
  });

  it("mid-breath is lifted vs linear (gamma)", () => {
    const mid = breathIntensityAt(0.25, 0, 1);
    expect(mid).toBeGreaterThan(0.5);
    expect(mid).toBeCloseTo(BREATH_WAVE_WEIGHTS.t25, 3);
  });

  it("profiles map severity to period bands", () => {
    expect(getBreathProfile("info", "breathe").periodMs).toBe(4000);
    expect(getBreathProfile("warning", "breathe").periodMs).toBe(2500);
    expect(getBreathProfile("urgent", "breathe").periodMs).toBe(1000);
    expect(getBreathProfile("success", "arrival").periodMs).toBe(2500);
    expect(getBreathProfile("urgent", "destination").periodMs).toBe(1800);
    expect(getBreathProfile("info", "breathe").ampMin).toBeGreaterThanOrEqual(0.78);
    expect(getBreathProfile("urgent", "destination").ampMin).toBeGreaterThanOrEqual(0.78);
  });

  it("CSS vars expose period, hue, amp", () => {
    const vars = getBreathCssVars("urgent", "breathe", "#f87171");
    expect(vars["--wm-pulse-period"]).toBe("1000ms");
    expect(vars["--wm-pulse-amp"]).toBeTruthy();
    expect(vars["--wm-pulse-hue"]).toBeTruthy();
    expect(vars["--wm-pulse-gamma-inv"]).toBe(String(PULSE_BREATH_GAMMA_INV));
  });

  it("hueDegFromHex returns a degree for solid tones", () => {
    const h = hueDegFromHex("#22c55e");
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(360);
  });
});
