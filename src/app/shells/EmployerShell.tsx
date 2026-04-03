// src/app/shells/EmployerShell.tsx
// Session 7: Gear → QuickSettingsSheet bottom sheet. Logout confirm added.
// All hooks BEFORE early return (React rules-of-hooks).
// Session 15: Bell cyan + subtitle italic removed + code quality audit.

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { roleStorage, type AppRole } from "../storage/roleStorage";
import { ROUTE_PATHS } from "../router/routePaths";
import { employerNotificationsStorage } from "../../features/employer/notifications/storage/employerNotifications.storage";
import { initEmployerNotificationService } from "../../features/employer/notifications/helpers/employerNotificationService";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";
import { QuickSettingsSheet } from "../../shared/components/QuickSettingsSheet";
import { ConfirmModal, type ConfirmData } from "../../shared/components/ConfirmModal";

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.2 7.2 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.24-1.12.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.39 1.05.7 1.63.94l.36 2.54c.04.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.24 1.12-.55 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
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

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.58-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Hooks                                            */
/* ------------------------------------------------ */
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
  try { return window.history.length > 1; } catch { return false; }
}

/* ------------------------------------------------ */
/* Shell                                            */
/* ------------------------------------------------ */
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

  /* --- ALL useCallback hooks BEFORE early return --- */
  const handleOpenSettings = useCallback(() => {
    nav(ROUTE_PATHS.employerSettings);
  }, [nav]);

  const handleOpenCompany = useCallback(() => {
    nav(ROUTE_PATHS.employerSettings, { state: { scrollTo: "company-profile" } });
  }, [nav]);

  const handleSwitchRole = useCallback(() => {
    roleStorage.set("employee");
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

  /* --- Early return AFTER all hooks --- */
  if (role !== "employer") {
    const target = role === "employee" ? ROUTE_PATHS.employeeHome : ROUTE_PATHS.landing;
    return <Navigate to={target} replace />;
  }

  const isHome = loc.pathname === ROUTE_PATHS.employerHome;
  const profile = employerSettingsStorage.get();
  const displayName = profile.companyName || profile.fullName || "Employer";

  function goHome() { nav(ROUTE_PATHS.employerHome); }
  function goBack() { if (safeCanGoBack()) nav(-1); else goHome(); }

  return (
    <div className="wm-shellRoot wm-shellEmployer">
      <div className="wm-topbar wm-er-topbar">
        {/* Left section */}
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
            <p style={{ color: "var(--wm-text-muted, #64748b)" }}>Smart hiring starts with the right tools.</p>
          </div>
        </div>

        {/* Right section */}
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
        currentRole="employer"
        userName={displayName}
        uniqueId=""
        onOpenCompany={handleOpenCompany}
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