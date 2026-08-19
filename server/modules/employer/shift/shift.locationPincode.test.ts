import { describe, expect, it } from "vitest";
import {
  missingLocationPincodeError,
  readLocationPincode,
  withLocationPincode,
} from "./shift.locationPincode.js";

describe("shift.locationPincode", () => {
  it("reads a 6-digit job-site pincode from details", () => {
    expect(readLocationPincode({ locationPincode: "670001" })).toBe("670001");
  });

  it("fail-closes when pincode is missing or invalid", () => {
    expect(readLocationPincode({})).toBeNull();
    expect(readLocationPincode({ locationPincode: "123" })).toBeNull();
    expect(missingLocationPincodeError().httpStatus).toBe(400);
  });

  it("writes locationPincode back onto details", () => {
    expect(withLocationPincode({ locationName: "Kannur" }, "670001")).toEqual({
      locationName: "Kannur",
      locationPincode: "670001",
    });
  });
});
