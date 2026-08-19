import { describe, expect, it } from "vitest";
import {
  pulseStorageKeyForScope,
  resolvePulsePersistScope,
} from "../pulseStorage.scope";

describe("pulse persist scope", () => {
  it("namespaces employee and employer keys separately", () => {
    expect(pulseStorageKeyForScope("employee")).toBe("wm_pulse_chain_state_v1_employee");
    expect(pulseStorageKeyForScope("employer")).toBe("wm_pulse_chain_state_v1_employer");
    expect(pulseStorageKeyForScope("employee")).not.toBe(pulseStorageKeyForScope("employer"));
  });

  it("resolves from activeMode before role", () => {
    expect(resolvePulsePersistScope({ activeMode: "employer", role: "employee" })).toBe(
      "employer",
    );
    expect(resolvePulsePersistScope({ role: "employee" })).toBe("employee");
    expect(resolvePulsePersistScope(null)).toBe("guest");
  });
});
