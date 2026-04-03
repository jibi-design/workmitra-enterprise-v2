// src/app/shells/EmployeeShell.tsx
// Session 7: DEMO removed, Home icon removed, header aligned to Root Map,
// Gear → QuickSettingsSheet. All hooks BEFORE early return.
// Session 15: Bell filled cyan + subtitle italic removed + code quality audit.

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { roleStorage, type AppRole } from "../storage/roleStorage";
import { ROUTE_PATHS } from "../router/routePaths";
import { employeeNotificationsStorage } from "../../features/employee/notifications/storage/employeeNotifications.storage";
import { initEmployeeNotificationService } from "../../features/employee/notifications/helpers/employeeNotificationService";
import { QuickSettingsSheet } from "../../shared/components/QuickSettingsSheet";
import { jobAlertStorage } from "../../shared/utils/jobAlertStorage";
import { ConfirmModal, type ConfirmData } from "../../shared/components/ConfirmModal";

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
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
      <path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h20v-1l-2-2Z" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.2 7.2 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.24-1.12.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.39 1.05.7 1.63.94l.36 2.54c.04.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.24 1.12-.55 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Hooks                                            */
/* ------------------------------------------------ */
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
  try { return window.history.length > 1; } catch { return false; }
}

/* ------------------------------------------------ */
/* Shell                                            */
/* ------------------------------------------------ */
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

  useEffect(() => {
    if (role === "employee") jobAlertStorage.checkAlerts();
  }, [role]);

  /* --- ALL useCallback hooks BEFORE early return --- */
  const handleOpenSettings = useCallback(() => {
    nav(ROUTE_PATHS.employeeSettings);
  }, [nav]);

  const handleOpenProfile = useCallback(() => {
    nav(ROUTE_PATHS.employeeProfile);
  }, [nav]);

  const handleSwitchRole = useCallback(() => {
    roleStorage.set("employer");
  }, []);

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
    roleStorage.clear();
    nav(ROUTE_PATHS.landing, { replace: true });
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

  /* --- Early return AFTER all hooks --- */
  if (role !== "employee") {
    const target = role === "employer" ? ROUTE_PATHS.employerHome : ROUTE_PATHS.landing;
    return <Navigate to={target} replace />;
  }

  const isHome = loc.pathname === ROUTE_PATHS.employeeHome;

  function goHome() { nav(ROUTE_PATHS.employeeHome); }
  function goBack() { if (safeCanGoBack()) nav(-1); else goHome(); }

  return (
    <div className="wm-shellRoot wm-shellEmployee">
      <div className="wm-topbar">
        {/* Left section — matches Root Map header pattern */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isHome && (
            <button className="wm-iconbtn" type="button" aria-label="Back" title="Back" onClick={goBack}>
              <IconBack />
            </button>
          )}
          <div
            className="wm-title"
            style={{ marginLeft: isHome ? 0 : 4, cursor: isHome ? "default" : "pointer" }}
            onClick={isHome ? undefined : goHome}
            onKeyDown={isHome ? undefined : (e) => { if (e.key === "Enter") goHome(); }}
            role={isHome ? undefined : "button"}
            tabIndex={isHome ? undefined : 0}
          >
            <h1>WorkMitra</h1>
            <p style={{ color: "var(--wm-text-muted, #64748b)" }}>Your career, your control.</p>
          </div>
        </div>

        {/* Right section — Bell + Settings only */}
        <div className="wm-topbarActions" aria-label="Top actions" style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
                    position: "absolute", top: -6, right: -6,
                    minWidth: 16, height: 16, borderRadius: 999,
                    padding: "0 5px", display: "inline-flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    background: "var(--wm-error)", color: "#fff",
                    border: "2px solid var(--wm-er-bg, #fff)",
                  }}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              ) : null}
            </div>
          </button>

          <button
            className="wm-iconbtn"
            type="button"
            aria-label="Settings"
            title="Settings"
            onClick={handleOpenSheet}
          >
            <IconSettings />
          </button>
        </div>
      </div>

      <div className="wm-container">
        <Outlet />
      </div>

      <QuickSettingsSheet
        open={showSheet}
        onClose={handleCloseSheet}
        currentRole="employee"
        userName="Employee"
        uniqueId=""
        onOpenProfile={handleOpenProfile}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogoutRequest}
        onOpenSettings={handleOpenSettings}
      />

      <ConfirmModal
        confirm={logoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={handleCancelLogout}
      />
    </div>
  );
}