import { describe, expect, it } from "vitest";
import {
  DEFAULT_GATE_PIN,
  formatPassVerifyHeadline,
  isValidGatePinFormat,
  normalizeGatePinInput,
  passVerifyBadgeTone,
  verifyGatePin,
} from "./mitraLabsGate.helpers";

describe("mitraLabsGate.helpers", () => {
  it("formats public verify headlines", () => {
    expect(formatPassVerifyHeadline("VALID")).toBe("VALID PASS");
    expect(formatPassVerifyHeadline("EXPIRED")).toBe("EXPIRED");
    expect(formatPassVerifyHeadline("INVALID")).toBe("INVALID");
    expect(formatPassVerifyHeadline("USED")).toBe("ALREADY USED");
    expect(formatPassVerifyHeadline("REVOKED")).toBe("INVALID");
  });

  it("shows outside window copy for inactive passes", () => {
    const pass = {
      status: "active" as const,
      validFrom: new Date(Date.now() + 60_000).toISOString(),
      validUntil: new Date(Date.now() + 3600_000).toISOString(),
    };
    expect(formatPassVerifyHeadline("INVALID", pass)).toContain("Outside Event Shift Timing");
  });

  it("maps badge tone for styling", () => {
    expect(passVerifyBadgeTone("VALID")).toBe("valid");
    expect(passVerifyBadgeTone("USED")).toBe("fail");
    expect(passVerifyBadgeTone("EXPIRED")).toBe("fail");
  });

  it("normalizes gate pin input", () => {
    expect(normalizeGatePinInput("12ab34")).toBe("1234");
    expect(isValidGatePinFormat("1234")).toBe(true);
    expect(isValidGatePinFormat("12")).toBe(false);
  });

  it("verifies gate pin against expected value", () => {
    expect(verifyGatePin("1234", "1234")).toBe(true);
    expect(verifyGatePin("1234", DEFAULT_GATE_PIN)).toBe(false);
  });
});
