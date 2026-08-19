/**
 * Dual-context switcher — confirm → API (or lab roleStorage) → air-gap purge → remount home.
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/routePaths";
import { roleStorage } from "../../app/storage/roleStorage";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { authService } from "../../features/auth/services/authService";
import { useAuthStore, type ActiveMode, type UserProfile } from "../store/authStore";
import { purgeOppositeWorkspaceLocalState } from "../auth/purgeOppositeWorkspaceLocalState";
import { ensureEmployerLocalTenantIdentity } from "../auth/ensureEmployerLocalTenantIdentity";
import type { ConfirmData } from "../components/ConfirmModal";
import { applyPulseStoreFromStorage } from "../../features/pulse/pulseStore";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";

function homeForMode(mode: ActiveMode): string {
  return mode === "employee" ? ROUTE_PATHS.employeeHome : ROUTE_PATHS.employerHome;
}

function oppositeMode(mode: ActiveMode): ActiveMode {
  return mode === "employee" ? "employer" : "employee";
}

export function useActiveContextSwitch(currentShellMode: ActiveMode) {
  const nav = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const authUser = useAuthStore((s) => s.user);
  const [switchConfirm, setSwitchConfirm] = useState<ConfirmData | null>(null);
  const [switching, setSwitching] = useState(false);

  const targetMode = oppositeMode(currentShellMode);

  const requestSwitch = useCallback(() => {
    setSwitchConfirm({
      title: `Switch to ${targetMode === "employee" ? "Employee" : "Employer"}?`,
      message: `You will leave the ${currentShellMode} workspace and open the ${targetMode} home. Local caches for the workspace you leave will be cleared (air-gap).`,
      warning: "Unsaved drafts in the current workspace may be lost. Auth session stays signed in.",
      tone: "warn",
      confirmLabel: `Switch to ${targetMode === "employee" ? "Employee" : "Employer"}`,
      cancelLabel: "Stay",
    });
  }, [currentShellMode, targetMode]);

  const cancelSwitch = useCallback(() => {
    setSwitchConfirm(null);
  }, []);

  const confirmSwitch = useCallback(() => {
    // Error acknowledgment dialog (no re-attempt)
    if (switchConfirm?.tone === "danger" && switchConfirm.confirmLabel === "OK") {
      setSwitchConfirm(null);
      return;
    }

    setSwitchConfirm(null);
    setSwitching(true);

    void (async () => {
      try {
        if (AUTH_BACKEND_ENABLED) {
          const orgId =
            targetMode === "employer"
              ? (ensureEmployerLocalTenantIdentity(authUser) ??
                employerSettingsStorage.get().employerOrgId ??
                employerSettingsStorage.get().uniqueId ??
                null)
              : null;
          const user = await authService.switchContext({ mode: targetMode, orgId });
          if (targetMode === "employer") {
            ensureEmployerLocalTenantIdentity(user);
          }
          setAuth(user, null);
        } else {
          roleStorage.set(targetMode);
          if (authUser) {
            const seededOrg =
              targetMode === "employer" ? ensureEmployerLocalTenantIdentity(authUser) : null;
            const nextUser: UserProfile = {
              id: authUser.id,
              fullName: authUser.fullName,
              email: authUser.email,
              role: targetMode,
              activeMode: targetMode,
              activeOrgId: targetMode === "employer" ? seededOrg : null,
              entitlements: [
                { mode: "employee", status: "verified" },
                { mode: "employer", status: "verified" },
              ],
              avatarUrl: authUser.avatarUrl,
            };
            setAuth(nextUser, null);
          }
        }

        purgeOppositeWorkspaceLocalState(targetMode);
        applyPulseStoreFromStorage();
        nav(homeForMode(targetMode), { replace: true });
      } catch (err) {
        console.error("[switch-context]", err);
        setSwitchConfirm({
          title: "Could not switch workspace",
          message:
            err instanceof Error
              ? err.message
              : "Switch failed. Stay in the current workspace and try again.",
          tone: "danger",
          confirmLabel: "OK",
          cancelLabel: "Dismiss",
        });
      } finally {
        setSwitching(false);
      }
    })();
  }, [authUser, nav, setAuth, switchConfirm, targetMode]);

  return {
    requestSwitch,
    switchConfirm,
    confirmSwitch,
    cancelSwitch,
    switching,
    targetMode,
  };
}
