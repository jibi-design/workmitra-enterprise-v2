import { describe, expect, it } from "vitest";
import {
  maskGuestSensitiveText,
  toGuestPublicBody,
  toGuestPublicPlace,
} from "./guestSensitiveMask";

describe("guest sensitive mask", () => {
  it("strips scripts then emails", () => {
    const out = maskGuestSensitiveText("<script>alert(1)</script> Call me at a@b.co");
    expect(out.toLowerCase()).not.toContain("script");
    expect(out.toLowerCase()).not.toContain("a@b.co");
    expect(out).toContain("contact hidden");
  });

  it("masks phone-like strings", () => {
    expect(maskGuestSensitiveText("Reach +44 7700 900123")).toContain("••••");
  });

  it("coarsens street numbers for guests", () => {
    expect(toGuestPublicPlace("12 High Street, Canal Quarter")).toBe("High Street Canal Quarter");
  });

  it("falls back when only a door number remains", () => {
    expect(toGuestPublicPlace("14B")).toBe("Area shown after sign-in");
  });

  it("sanitizes job body HTML", () => {
    expect(toGuestPublicBody("<img src=x onerror=alert(1)>Warehouse")).toBe("Warehouse");
  });
});
