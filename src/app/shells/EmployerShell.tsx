/** Job Mitra | EmployerShell.tsx | C:\projects\WorkMitra_Enterprise_v2\src\app\shells\EmployerShell.tsx */

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { roleStorage, type AppRole } from "../storage/roleStorage";
import { logoutApp, postLogoutRoute } from "../../shared/auth/logoutApp";
import { ROUTE_PATHS } from "../router/routePaths";
import { employerNotificationsStorage } from "../../features/employer/notifications/storage/employerNotifications.storage";
import { initEmployerNotificationService } from "../../features/employer/notifications/helpers/employerNotificationService";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";
import { AccountMenuSheet } from "../../shared/components/AccountMenuSheet";
import { ConfirmModal, type ConfirmData } from "../../shared/components/ConfirmModal";
import { usePulseEventBridgeConsumer } from "../../features/pulse/pulseEventBridge";
import { showPhase2Features } from "../../shared/config/featureFlags";
import BottomNav from "../../components/layout/BottomNav/BottomNav";

type EmployerRouteState = {
  backTo?: string;
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h20v-1l-2-2Z"
      />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.58-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}

function useRole(): AppRole | null {
  return useSyncExternalStore(roleStorage.subscribe, roleStorage.get, roleStorage.get);
}

function useEmployerUnread(): number {
  return useSyncExternalStore(
    employerNotificationsStorage.subscribe,
    () => employerNotificationsStorage.getUnreadCount(),
    () => employerNotificationsStorage.getUnreadCount(),
  );
}

function safeCanGoBack(): boolean {
  try {
    return window.history.length > 1;
  } catch {
    return false;
  }
}

function getEmployerBackTarget(state: unknown): string | null {
  if (!state || typeof state !== "object") return null;

  const maybeBackTo = (state as Partial<EmployerRouteState>).backTo;

  if (typeof maybeBackTo !== "string") return null;
  if (!maybeBackTo.startsWith("/employer")) return null;

  return maybeBackTo;
}

export function EmployerShell() {
  const role = useRole();
  const unread = useEmployerUnread();
  const loc = useLocation();
  const nav = useNavigate();

  const [showSheet, setShowSheet] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState<ConfirmData | null>(null);

  useEffect(() => {
    if (role === "employer") return initEmployerNotificationService();
  }, [role]);

  usePulseEventBridgeConsumer(role === "employer" ? "employer" : null);

  const handleOpenSettings = useCallback(() => {
    setShowSheet(false);
    nav(ROUTE_PATHS.employerSettings);
  }, [nav]);

  const handleOpenProfile = useCallback(() => {
    setShowSheet(false);
    nav(ROUTE_PATHS.employerProfile);
  }, [nav]);

  const handleLogoutRequest = useCallback(() => {
    setShowSheet(false);
    setLogoutConfirm({
      title: "Log Out",
      message: "You will be returned to the landing page. Any unsaved changes will be lost.",
      tone: "warn",
      confirmLabel: "Log Out",
      cancelLabel: "Stay",
    });
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    setLogoutConfirm(null);
    void logoutApp().then(() => {
      nav(postLogoutRoute(), { replace: true });
    });
  }, [nav]);

  const handleOpenNotifications = useCallback(() => {
    nav(ROUTE_PATHS.employerNotifications);
  }, [nav]);

  const handleOpenSheet = useCallback(() => {
    setShowSheet(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setShowSheet(false);
  }, []);

  const handleCancelLogout = useCallback(() => {
    setLogoutConfirm(null);
  }, []);

  if (role !== "employer") {
    const target = role === "employee" ? ROUTE_PATHS.employeeHome : ROUTE_PATHS.landing;
    return <Navigate to={target} replace />;
  }

  const isHome = loc.pathname === ROUTE_PATHS.employerHome;
  const isPlannerSubdomain = loc.pathname.startsWith("/employer/planner");
  const shouldShowBack = !isHome;
  const explicitBackTarget = getEmployerBackTarget(loc.state);
  const profile = employerSettingsStorage.get();
  const displayName = profile.companyName || profile.fullName || "Employer";
  const initials = getInitials(displayName);

  function goHome() {
    nav(ROUTE_PATHS.employerHome);
  }

  function goBack() {
    if (safeCanGoBack()) {
      nav(-1);
      return;
    }

    if (explicitBackTarget) {
      nav(explicitBackTarget, { replace: true });
      return;
    }

    goHome();
  }

  return (
    <div
      className={`wm-shellRoot wm-shellEmployer${isPlannerSubdomain ? " wm-er-shellPlanner" : ""}`}
    >
      <div className={`wm-topbar wm-er-topbar${isPlannerSubdomain ? " wm-er-topbarPlanner" : ""}`}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: shouldShowBack ? 10 : 0,
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          <button
            className="wm-iconbtn"
            type="button"
            aria-label="Back"
            title="Back"
            aria-hidden={!shouldShowBack}
            disabled={!shouldShowBack}
            tabIndex={shouldShowBack ? 0 : -1}
            onClick={shouldShowBack ? goBack : undefined}
            style={{
              flex: shouldShowBack ? "0 0 40px" : "0 0 0px",
              width: shouldShowBack ? 40 : 0,
              minWidth: shouldShowBack ? 40 : 0,
              height: 40,
              padding: shouldShowBack ? undefined : 0,
              opacity: shouldShowBack ? 1 : 0,
              visibility: shouldShowBack ? "visible" : "hidden",
              pointerEvents: shouldShowBack ? "auto" : "none",
              borderColor: shouldShowBack ? undefined : "transparent",
              background: shouldShowBack ? undefined : "transparent",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            <IconBack />
          </button>

          <div
            className="wm-title"
            style={{
              marginLeft: isHome ? 0 : 4,
              cursor: isHome ? "default" : "pointer",
              minWidth: 0,
              flex: "1 1 auto",
              overflow: "hidden",
            }}
            onClick={isHome ? undefined : goHome}
            onKeyDown={
              isHome
                ? undefined
                : (event) => {
                    if (event.key === "Enter") goHome();
                  }
            }
            role={isHome ? undefined : "button"}
            tabIndex={isHome ? undefined : 0}
          >
            <h1>Job Mitra</h1>
            <p style={{ color: "var(--wm-text-muted, #64748b)" }}>
              Smart hiring starts with the right tools.
            </p>
          </div>
        </div>

        <div
          className="wm-topbarActions"
          aria-label="Top actions"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flex: "0 0 auto",
          }}
        >
          <button
            className="wm-iconbtn wm-iconbtnBadgeWrap"
            type="button"
            aria-label="Notifications"
            title="Notifications"
            onClick={handleOpenNotifications}
            style={{ color: "var(--wm-notification-accent, #0891b2)" }}
          >
            <div style={{ position: "relative", display: "inline-flex" }}>
              <IconBell />
              {unread > 0 ? (
                <span
                  aria-label={`${unread} unread`}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 999,
                    padding: "0 5px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    background: "var(--wm-error)",
                    color: "#fff",
                    border: "2px solid var(--wm-er-bg, #fff)",
                  }}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              ) : null}
            </div>
          </button>

          <button
            type="button"
            aria-label="Open account menu"
            title="Account menu"
            onClick={handleOpenSheet}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "2px solid rgba(124,58,237,0.22)",
              cursor: "pointer",
              background: "rgba(124,58,237,0.10)",
              color: "#7c3aed",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: -0.5,
              flexShrink: 0,
              padding: 0,
            }}
          >
            {initials}
          </button>
        </div>
      </div>

      <div className="wm-container pb-safe-nav">
        <Outlet />
      </div>

      <BottomNav />

      <AccountMenuSheet
        open={showSheet}
        onClose={handleCloseSheet}
        currentRole="employer"
        userName={displayName}
        userPhoto={profile.companyLogo}
        onOpenProfile={handleOpenProfile}
        onOpenSettings={handleOpenSettings}
        onOpenGigProjects={() => nav(ROUTE_PATHS.employerPlannerHome)}
        onOpenWorkforce={
          showPhase2Features ? () => nav(ROUTE_PATHS.employerWorkforceHome) : undefined
        }
        onOpenHrManagement={
          showPhase2Features ? () => nav(ROUTE_PATHS.employerHRManagement) : undefined
        }
        onOpenManagerConsole={
          showPhase2Features ? () => nav(ROUTE_PATHS.employerConsole) : undefined
        }
        onLogout={handleLogoutRequest}
      />

      <ConfirmModal
        confirm={logoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={handleCancelLogout}
      />
    </div>
  );
}
