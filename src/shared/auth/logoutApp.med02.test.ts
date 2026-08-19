/** MED-02 — logoutApp must call clearOtp before other teardown. */

import { beforeEach, describe, expect, it, vi } from "vitest";

const clearOtp = vi.fn();
const clearShiftOpsAuthSession = vi.fn(async () => undefined);
const purgeUserLocalStateOnLogout = vi.fn();
const clearAuth = vi.fn();
const logoutSession = vi.fn(async () => undefined);

vi.mock("../../features/employee/workVault/services/vaultOtpService", () => ({
  clearOtp: () => clearOtp(),
}));

vi.mock("../../features/shiftOps/services/authBridge.service", () => ({
  clearShiftOpsAuthSession: () => clearShiftOpsAuthSession(),
}));

vi.mock("./logoutLocalPurge", () => ({
  purgeUserLocalStateOnLogout: () => purgeUserLocalStateOnLogout(),
}));

vi.mock("../config/authConfig", () => ({
  AUTH_BACKEND_ENABLED: false,
}));

vi.mock("../store/authStore", () => ({
  useAuthStore: {
    getState: () => ({
      clearAuth,
      logoutSession,
    }),
  },
}));

vi.mock("../../app/storage/roleStorage", () => ({
  roleStorage: { clear: vi.fn() },
}));

import { logoutApp } from "./logoutApp";

describe("logoutApp (MED-02)", () => {
  beforeEach(() => {
    clearOtp.mockClear();
    clearShiftOpsAuthSession.mockClear();
    purgeUserLocalStateOnLogout.mockClear();
    clearAuth.mockClear();
  });

  it("calls clearOtp as the first logout teardown step", async () => {
    const order: string[] = [];
    clearOtp.mockImplementation(() => {
      order.push("clearOtp");
    });
    clearShiftOpsAuthSession.mockImplementation(async () => {
      order.push("clearShiftOps");
    });
    purgeUserLocalStateOnLogout.mockImplementation(() => {
      order.push("purge");
    });

    await logoutApp();

    expect(clearOtp).toHaveBeenCalledTimes(1);
    expect(order[0]).toBe("clearOtp");
    expect(order).toEqual(["clearOtp", "clearShiftOps", "purge"]);
  });
});
