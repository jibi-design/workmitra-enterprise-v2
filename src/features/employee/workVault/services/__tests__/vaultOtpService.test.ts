/** STEP 9 — DEC-012 / MIG-008: Vault OTP is server-only (no client hash / memoryPlain). */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../shared/config/authConfig", () => ({
  AUTH_BACKEND_ENABLED: true,
}));

const generateOtpApi = vi.fn();
const verifyOtpApi = vi.fn();

vi.mock("../vaultGateApi.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../vaultGateApi.service")>();
  return {
    ...actual,
    isVaultApiSyncEnabled: () => true,
    resolveEmployeeAuthUserId: () => "00000000-0000-4000-8000-000000000001",
    vaultGateApi: {
      generateOtp: (...args: unknown[]) => generateOtpApi(...args),
      verifyOtp: (...args: unknown[]) => verifyOtpApi(...args),
    },
  };
});

import { VAULT_STORAGE_KEYS } from "../../constants/vaultConstants";
import {
  clearOtp,
  generateOtp,
  getCurrentOtp,
  verifyOtp,
  verifyOtpViaApi,
} from "../vaultOtpService";
import {
  setFolderVisibility,
  getAllFolders,
  initializeDefaultFolders,
} from "../vaultFolderService";

describe("vaultOtpService (server-only)", () => {
  beforeEach(() => {
    localStorage.clear();
    generateOtpApi.mockReset();
    verifyOtpApi.mockReset();
    initializeDefaultFolders();
    const folders = getAllFolders();
    if (folders[0]) setFolderVisibility(folders[0].id, "visible");
  });

  it("generateOtp stores otpId meta only — never plaintext code in localStorage", async () => {
    generateOtpApi.mockResolvedValue({
      otpId: "otp_server_1",
      code: "123456",
      expiresAt: Date.now() + 60_000,
      expiresInSeconds: 60,
    });

    const result = await generateOtp();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.otp.code).toBe("123456");
    expect(result.otp.otpId).toBe("otp_server_1");

    expect(localStorage.getItem(VAULT_STORAGE_KEYS.otp)).toBeNull();

    const pendingRaw = localStorage.getItem(VAULT_STORAGE_KEYS.otpPending);
    expect(pendingRaw).toBeTruthy();
    expect(pendingRaw).not.toContain("123456");
    expect(pendingRaw).toContain("otp_server_1");

    // Code is one-shot in generate response; getCurrentOtp never rehydrates plaintext.
    expect(getCurrentOtp()?.code).toBe("");
    expect(getCurrentOtp()?.otpId).toBe("otp_server_1");
  });

  it("generateOtp fails when no folders are visible", async () => {
    const folders = getAllFolders();
    for (const f of folders) setFolderVisibility(f.id, "hidden");
    const result = await generateOtp();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("no_visible_folders");
    expect(generateOtpApi).not.toHaveBeenCalled();
  });

  it("local verifyOtp always returns false (DEC-012)", async () => {
    expect(await verifyOtp("123456")).toBe(false);
  });

  it("MED-02: clearOtp wipes pending otpId so next user cannot reuse prior challenge", async () => {
    generateOtpApi.mockResolvedValue({
      otpId: "otp_a",
      code: "654321",
      expiresAt: Date.now() + 60_000,
      expiresInSeconds: 60,
    });

    const result = await generateOtp();
    expect(result.ok).toBe(true);
    expect(getCurrentOtp()?.otpId).toBe("otp_a");

    clearOtp();

    expect(getCurrentOtp()).toBeNull();
    expect(localStorage.getItem(VAULT_STORAGE_KEYS.otp)).toBeNull();
    expect(localStorage.getItem(VAULT_STORAGE_KEYS.otpPending)).toBeNull();
  });

  it("verifyOtpViaApi clears pending on success", async () => {
    generateOtpApi.mockResolvedValue({
      otpId: "otp_v",
      code: "111222",
      expiresAt: Date.now() + 60_000,
      expiresInSeconds: 60,
    });
    await generateOtp();

    verifyOtpApi.mockResolvedValue({
      sessionId: "sess_1",
      visibleFolderIds: ["f1"],
      expiresAt: Date.now() + 300_000,
      expiresInSeconds: 300,
    });

    const verified = await verifyOtpViaApi({
      code: "111222",
      employeeRouteId: "WM-EE-1",
      employerName: "Acme",
      employerMlId: "ML-ER-1",
    });

    expect(verified.ok).toBe(true);
    expect(localStorage.getItem(VAULT_STORAGE_KEYS.otpPending)).toBeNull();
  });
});
