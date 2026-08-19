/** STEP 9 — auth-off path must fail closed (no client OTP mint). */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../shared/config/authConfig", () => ({
  AUTH_BACKEND_ENABLED: false,
}));

vi.mock("../vaultGateApi.service", () => ({
  isVaultApiSyncEnabled: () => false,
  resolveEmployeeAuthUserId: () => null,
  vaultGateApi: {
    generateOtp: vi.fn(),
    verifyOtp: vi.fn(),
  },
}));

import { generateOtp, getCurrentOtp, verifyOtp, verifyOtpViaApi } from "../vaultOtpService";
import {
  setFolderVisibility,
  getAllFolders,
  initializeDefaultFolders,
} from "../vaultFolderService";

describe("vaultOtpService (auth off — fail closed)", () => {
  beforeEach(() => {
    localStorage.clear();
    initializeDefaultFolders();
    const folders = getAllFolders();
    if (folders[0]) setFolderVisibility(folders[0].id, "visible");
  });

  it("generateOtp returns auth_required", async () => {
    const result = await generateOtp();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("auth_required");
    expect(getCurrentOtp()).toBeNull();
  });

  it("verifyOtp and verifyOtpViaApi fail closed", async () => {
    expect(await verifyOtp("123456")).toBe(false);
    const viaApi = await verifyOtpViaApi({
      code: "123456",
      employeeRouteId: "WM-EE-1",
      employerName: "Acme",
      employerMlId: "ML-ER-1",
    });
    expect(viaApi.ok).toBe(false);
    if (viaApi.ok) return;
    expect(viaApi.reason).toBe("auth_required");
  });
});
