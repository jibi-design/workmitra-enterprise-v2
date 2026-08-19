import { describe, expect, it } from "vitest";
import {
  normalizeClientRbacRole,
  resolveClientAllowedRoles,
  roleMatchesGate,
} from "./rbacRoles";

describe("WAVE-5.1 Layer 2 rbacRoles", () => {
  it("maps Candidate alias to employee", () => {
    expect(normalizeClientRbacRole("Candidate")).toBe("employee");
    expect(normalizeClientRbacRole("candidate")).toBe("employee");
  });

  it("resolves mixed aliases without duplicates", () => {
    expect(resolveClientAllowedRoles(["Candidate", "employee", "Employer"])).toEqual([
      "employee",
      "employer",
    ]);
  });

  it("matches session role against allow-list", () => {
    expect(roleMatchesGate("admin", ["admin"])).toBe(true);
    expect(roleMatchesGate("employee", ["employer", "admin"])).toBe(false);
  });
});
