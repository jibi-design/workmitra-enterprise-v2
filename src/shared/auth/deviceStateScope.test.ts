import { describe, expect, it } from "vitest";
import { resolveDeviceStateRole, resolveDeviceStateUserId } from "./deviceStateScope";

describe("deviceStateScope", () => {
  it("keeps employer and employee keys apart", () => {
    expect(resolveDeviceStateRole({ activeMode: "employer", role: "employee" })).toBe("employer");
    expect(resolveDeviceStateRole({ role: "employee" })).toBe("employee");
    expect(resolveDeviceStateUserId({ id: "u_1" })).toBe("u_1");
    expect(resolveDeviceStateUserId(null)).toBe("anon");
  });
});
