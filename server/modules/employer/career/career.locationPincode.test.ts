import { describe, expect, it } from "vitest";
import {
  readCareerLocationPincode,
  resolveCareerPostLocation,
  withCareerLocationPincode,
} from "./career.locationPincode.js";

describe("career.locationPincode", () => {
  it("reads work area code from details or body", () => {
    expect(readCareerLocationPincode({ locationPincode: "670001" })).toBe("670001");
    expect(readCareerLocationPincode({}, { locationPincode: "560001" })).toBe("560001");
  });

  it("fail-closes when the work area code is missing", () => {
    const result = resolveCareerPostLocation({}, {});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.httpStatus).toBe(400);
      expect(result.message).toContain("Work area code");
    }
  });

  it("writes locationPincode onto details without extra location names", () => {
    expect(withCareerLocationPincode({ role: "helper" }, "670001")).toEqual({
      role: "helper",
      locationPincode: "670001",
    });
  });
});
