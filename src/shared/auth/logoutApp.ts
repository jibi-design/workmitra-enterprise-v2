import { roleStorage } from "../../app/storage/roleStorage";
import { ROUTE_PATHS } from "../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { useAuthStore } from "../store/authStore";
import { clearShiftOpsAuthSession } from "../../features/shiftOps/services/authBridge.service";
import { clearOtp } from "../../features/employee/workVault/services/vaultOtpService";
import { purgeUserLocalStateOnLogout } from "./logoutLocalPurge";

/** Central logout — server session when backend auth enabled, else Phase-0 role pick. */
export async function logoutApp(): Promise<void> {
  // MED-02 — drop same-tab vault OTP plaintext before any other teardown
  clearOtp();
  await clearShiftOpsAuthSession();
  if (AUTH_BACKEND_ENABLED) {
    await useAuthStore.getState().logoutSession();
    roleStorage.clear();
    purgeUserLocalStateOnLogout();
    return;
  }
  roleStorage.clear();
  useAuthStore.getState().clearAuth();
  purgeUserLocalStateOnLogout();
}

export function postLogoutRoute(): string {
  return AUTH_BACKEND_ENABLED ? ROUTE_PATHS.login : ROUTE_PATHS.landing;
}
