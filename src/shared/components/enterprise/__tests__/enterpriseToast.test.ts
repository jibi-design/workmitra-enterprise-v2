/** Job Mitra | enterpriseToast.test.ts | Luxury L3 toast bus */

import { afterEach, describe, expect, it } from "vitest";
import {
  __resetEnterpriseToastForTests,
  dismissEnterpriseToast,
  getEnterpriseToastSnapshot,
  showEnterpriseToast,
  subscribeEnterpriseToast,
} from "../enterpriseToast";

afterEach(() => {
  __resetEnterpriseToastForTests();
});

describe("enterpriseToast bus", () => {
  it("shows and replaces toast payload", () => {
    const id1 = showEnterpriseToast({ message: "Saved", tone: "success" });
    expect(getEnterpriseToastSnapshot()?.message).toBe("Saved");
    expect(getEnterpriseToastSnapshot()?.tone).toBe("success");
    expect(id1).toBeTruthy();

    showEnterpriseToast({ message: "Failed", tone: "error" });
    expect(getEnterpriseToastSnapshot()?.message).toBe("Failed");
    expect(getEnterpriseToastSnapshot()?.tone).toBe("error");
  });

  it("notifies subscribers and dismisses", () => {
    const seen: Array<string | null> = [];
    const unsub = subscribeEnterpriseToast((toast) => {
      seen.push(toast?.message ?? null);
    });

    showEnterpriseToast({ message: "Hello", tone: "info" });
    dismissEnterpriseToast();
    unsub();

    expect(seen).toContain("Hello");
    expect(seen[seen.length - 1]).toBeNull();
    expect(getEnterpriseToastSnapshot()).toBeNull();
  });

  it("defaults tone to info", () => {
    showEnterpriseToast({ message: "Ping" });
    expect(getEnterpriseToastSnapshot()?.tone).toBe("info");
  });
});
