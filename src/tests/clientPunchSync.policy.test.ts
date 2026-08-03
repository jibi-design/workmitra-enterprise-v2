/**
 * Wave-2 client punch sync policy — device punches are not server SoT.
 * Vitest — npm test -- src/tests/clientPunchSync.policy.test.ts
 */

import { describe, expect, it } from "vitest";
import {
  CLIENT_PUNCH_AUTHORITATIVE,
  isClientPunchAuthoritative,
  rejectClientPunchServerSync,
} from "../shared/shift/clientPunchSync.policy";

describe("clientPunchSync.policy", () => {
  it("never treats client punches as authoritative", () => {
    expect(CLIENT_PUNCH_AUTHORITATIVE).toBe(false);
    expect(isClientPunchAuthoritative()).toBe(false);
  });

  it("rejects naive client→server punch sync", () => {
    const result = rejectClientPunchServerSync("test_harness");
    expect(result.ok).toBe(false);
    expect(result.code).toBe("CLIENT_PUNCH_NOT_AUTHORITATIVE");
    expect(result.message).toContain("test_harness");
  });
});
