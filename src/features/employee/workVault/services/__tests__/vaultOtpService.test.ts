/** STEP 2 — vault OTP auth-off stores hash only; never plaintext. */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../shared/config/authConfig", () => ({
  AUTH_BACKEND_ENABLED: false,
}));

import { VAULT_STORAGE_KEYS } from "../../constants/vaultConstants";
import { clearOtp, generateOtp, getCurrentOtp, verifyOtp } from "../vaultOtpService";
import {
  setFolderVisibility,
  getAllFolders,
  initializeDefaultFolders,
} from "../vaultFolderService";

describe("vaultOtpService (auth off)", () => {
  beforeEach(() => {
    localStorage.clear();
    initializeDefaultFolders();
    const folders = getAllFolders();
    if (folders[0]) setFolderVisibility(folders[0].id, "visible");
  });

  it("generateOtp stores hash only (never plaintext code)", async () => {
    const result = await generateOtp();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.otp.code).toMatch(/^\d{6}$/);
    const stored = localStorage.getItem(VAULT_STORAGE_KEYS.otp);
    expect(stored).toBeTruthy();
    expect(stored).not.toContain(result.otp.code);
    expect(stored).toContain("codeHash");
    expect(getCurrentOtp()?.code).toBe(result.otp.code);
  });

  it("verifyOtp consumes code once", async () => {
    const result = await generateOtp();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(await verifyOtp(result.otp.code)).toBe(true);
    expect(await verifyOtp(result.otp.code)).toBe(false);
    clearOtp();
    expect(getCurrentOtp()).toBeNull();
  });
});
