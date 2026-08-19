import { describe, expect, it } from "vitest";
import {
  clearScannerShiftUnlock,
  isScannerShiftUnlocked,
  markScannerShiftUnlocked,
} from "./eventDayScanner.session";

describe("eventDayScanner.session", () => {
  it("unlocks only for the matching issuer and event folder", () => {
    clearScannerShiftUnlock();
    expect(isScannerShiftUnlocked("issuer_a", "gf-a-open")).toBe(false);
    markScannerShiftUnlocked("issuer_a", "gf-a-open");
    expect(isScannerShiftUnlocked("issuer_a", "gf-a-open")).toBe(true);
    expect(isScannerShiftUnlocked("issuer_a", "gf-a-gala")).toBe(false);
    expect(isScannerShiftUnlocked("issuer_b", "gf-a-open")).toBe(false);
    clearScannerShiftUnlock();
    expect(isScannerShiftUnlocked("issuer_a", "gf-a-open")).toBe(false);
  });
});
