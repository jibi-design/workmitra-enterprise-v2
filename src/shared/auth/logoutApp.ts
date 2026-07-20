import { roleStorage } from "../../app/storage/roleStorage";
import { ROUTE_PATHS } from "../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { useAuthStore } from "../store/authStore";

/** Central logout — server session when backend auth enabled, else Phase-0 role pick. */
export async function logoutApp(): Promise<void> {
  if (AUTH_BACKEND_ENABLED) {
    await useAuthStore.getState().logoutSession();
    return;
  }
  roleStorage.clear();
  useAuthStore.getState().clearAuth();
}

export function postLogoutRoute(): string {
  return AUTH_BACKEND_ENABLED ? ROUTE_PATHS.login : ROUTE_PATHS.landing;
}
