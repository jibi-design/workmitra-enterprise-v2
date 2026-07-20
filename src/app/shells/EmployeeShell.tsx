/** Job Mitra | EmployeeShell.tsx | C:\projects\WorkMitra_Enterprise_v2\src\app\shells\EmployeeShell.tsx */

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { roleStorage, type AppRole } from "../storage/roleStorage";
import { logoutApp, postLogoutRoute } from "../../shared/auth/logoutApp";
import { ROUTE_PATHS } from "../router/routePaths";
import { employeeNotificationsStorage } from "../../features/employee/notifications/storage/employeeNotifications.storage";
import { initEmployeeNotificationService } from "../../features/employee/notifications/helpers/employeeNotificationService";
import { employeeProfileStorage } from "../../features/employee/profile/storage/employeeProfile.storage";
import { AccountMenuSheet } from "../../shared/components/AccountMenuSheet";
import { jobAlertStorage } from "../../shared/utils/jobAlertStorage";
import { ConfirmModal, type ConfirmData } from "../../shared/components/ConfirmModal";
import { usePulseEventBridgeConsumer } from "../../features/pulse/pulseEventBridge";
import { showPhase2Features } from "../../shared/config/featureFlags";
import BottomNav from "../../components/layout/BottomNav/BottomNav";

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.58-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
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

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function useRole(): AppRole | null {
  return useSyncExternalStore(roleStorage.subscribe, roleStorage.get, roleStorage.get);
}

function useUnreadCount(): number {
  return useSyncExternalStore(
    employeeNotificationsStorage.subscribe,
    employeeNotificationsStorage.getUnreadCount,
    employeeNotificationsStorage.getUnreadCount,
  );
}

function safeCanGoBack(): boolean {
  try {
    return window.history.length > 1;
  } catch {
    return false;
  }
}

export function EmployeeShell() {
  const role = useRole();
  const unread = useUnreadCount();
  const loc = useLocation();
  const nav = useNavigate();

  const [showSheet, setShowSheet] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState<ConfirmData | null>(null);

  useEffect(() => {
    if (role === "employee") return initEmployeeNotificationService();
  }, [role]);

  usePulseEventBridgeConsumer(role === "employee" ? "employee" : null);

  useEffect(() => {
    if (role === "employee") jobAlertStorage.checkAlerts();
  }, [role]);

  const handleOpenSettings = useCallback(() => {
    setShowSheet(false);
    nav(ROUTE_PATHS.employeeSettings);
  }, [nav]);

  const handleOpenProfile = useCallback(() => {
    setShowSheet(false);
    nav(ROUTE_PATHS.employeeProfile);
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
    nav(ROUTE_PATHS.employeeNotifications);
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

  if (role !== "employee") {
    const target = role === "employer" ? ROUTE_PATHS.employerHome : ROUTE_PATHS.landing;
    return <Navigate to={target} replace />;
  }

  const profile = employeeProfileStorage.get();
  const displayName = profile.fullName || "Employee";
  const userPhoto = profile.photoDataUrl;
  const initials = getInitials(displayName);

  const isHome = loc.pathname === ROUTE_PATHS.employeeHome;

  function goHome() {
    nav(ROUTE_PATHS.employeeHome);
  }

  function goBack() {
    if (safeCanGoBack()) nav(-1);
    else goHome();
  }

  return (
    <div className="wm-shellRoot wm-shellEmployee">
      <div className="wm-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isHome && (
            <button
              className="wm-iconbtn"
              type="button"
              aria-label="Back"
              title="Back"
              onClick={goBack}
            >
              <IconBack />
            </button>
          )}
          <div
            className="wm-title"
            style={{ marginLeft: isHome ? 0 : 4, cursor: isHome ? "default" : "pointer" }}
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
            <p style={{ color: "var(--wm-text-muted, #64748b)" }}>Your career, your control.</p>
          </div>
        </div>

        <div
          className="wm-topbarActions"
          aria-label="Top actions"
          style={{ display: "flex", gap: 10, alignItems: "center" }}
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
              border: "2px solid rgba(22,163,74,0.22)",
              cursor: "pointer",
              background: "rgba(22,163,74,0.10)",
              color: "#16a34a",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: -0.5,
              flexShrink: 0,
              overflow: "hidden",
              padding: 0,
            }}
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={displayName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
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
        currentRole="employee"
        userName={displayName}
        userPhoto={userPhoto}
        uniqueId={employeeProfileStorage.get().uniqueId}
        onOpenProfile={handleOpenProfile}
        onOpenSettings={handleOpenSettings}
        onOpenGigProjects={() => nav(ROUTE_PATHS.employeePlannerHome)}
        onOpenWorkforce={
          showPhase2Features ? () => nav(ROUTE_PATHS.employeeWorkforceHome) : undefined
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
