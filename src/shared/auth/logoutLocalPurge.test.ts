import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LOGOUT_MED01_SENSITIVE_KEYS,
  purgeUserLocalStateOnLogout,
} from "./logoutLocalPurge";
import { piiSecureStorage } from "../security/piiSecureStorage";

describe("purgeUserLocalStateOnLogout (MED-01)", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    piiSecureStorage.clearMemoryMirror();
    vi.restoreAllMocks();
  });

  it("removes vault/profile/PII/application keys and preserves theme preference", () => {
    for (const key of LOGOUT_MED01_SENSITIVE_KEYS) {
      localStorage.setItem(key, JSON.stringify({ leak: true, key }));
    }
    localStorage.setItem("wm_mitra_labs_passes_v1", JSON.stringify([{ guestName: "Secret" }]));
    localStorage.setItem("wm_theme_preference", "dark");
    localStorage.setItem("wm_last_sync", "123");

    const mirrorSpy = vi.spyOn(piiSecureStorage, "clearMemoryMirror");

    purgeUserLocalStateOnLogout();

    for (const key of LOGOUT_MED01_SENSITIVE_KEYS) {
      expect(localStorage.getItem(key), key).toBeNull();
    }
    expect(localStorage.getItem("wm_mitra_labs_passes_v1")).toBeNull();
    expect(localStorage.getItem("wm_theme_preference")).toBe("dark");
    expect(localStorage.getItem("wm_last_sync")).toBe("123");
    expect(mirrorSpy).toHaveBeenCalledTimes(1);
  });
});
