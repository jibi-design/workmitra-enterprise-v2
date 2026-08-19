/** Job Mitra | EmployeeShell.tsx | C:\projects\WorkMitra_Enterprise_v2\src\app\shells\EmployeeShell.tsx */

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logoutApp, postLogoutRoute } from "../../shared/auth/logoutApp";
import { ROUTE_PATHS } from "../router/routePaths";
import { filterLaunchVisibleEmployeeNotifications } from "../../shared/components/notifications/notificationLaunchFilters";
import { initEmployeeNotificationService } from "../../features/employee/notifications/helpers/employeeNotificationService";
import { employeeNotificationsStorage } from "../../features/employee/notifications/storage/employeeNotifications.storage";
import { employeeProfileStorage } from "../../features/employee/profile/storage/employeeProfile.storage";
import { AccountMenuSheet } from "../../shared/components/AccountMenuSheet";
import { jobAlertStorage } from "../../shared/utils/jobAlertStorage";
import { ConfirmModal, type ConfirmData } from "../../shared/components/ConfirmModal";
import { usePulseEventBridgeConsumer } from "../../features/pulse/pulseEventBridge";
import { useServerInboxPoll } from "../../features/notifications/services/useServerInboxPoll";
import { showPhase2Features } from "../../shared/config/featureFlags";
import BottomNav from "../../components/layout/BottomNav/BottomNav";
import { JobMitraBrandName } from "../../shared/components/brand/BrandName";
import { useThemeBundle } from "./useThemeBundle";
import { useAppRole } from "../router/guards/useAppRole";
import { AUTH_BACKEND_ENABLED } from "../../shared/config/authConfig";
import { RouteGuardLoading } from "../../shared/components/routes/RouteGuardStatus";
import { useActiveContextSwitch } from "../../shared/auth/useActiveContextSwitch";
import { useAuthStore } from "../../shared/store/authStore";
import {
  CommandPalette,
  EMPLOYEE_COMMAND_PALETTE_ITEMS,
  useCommandPaletteHub,
} from "../../shared/components/enterprise";

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

function useUnreadCount(): number {
  const all = useSyncExternalStore(
    employeeNotificationsStorage.subscribe,
    employeeNotificationsStorage.getAll,
    employeeNotificationsStorage.getAll,
  );
  return filterLaunchVisibleEmployeeNotifications(all).filter((row) => !row.isRead).length;
}

function safeCanGoBack(): boolean {
  try {
    return window.history.length > 1;
  } catch {
    return false;
  }
}

export function EmployeeShell() {
  const role = useAppRole();
  const unread = useUnreadCount();
  const loc = useLocation();
  const nav = useNavigate();

  const [showSheet, setShowSheet] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState<ConfirmData | null>(null);
  const [topbarScrolled, setTopbarScrolled] = useState(false);
  const { open: commandOpen, close: closeCommandPalette } = useCommandPaletteHub();
  const activeOrgId = useAuthStore((s) => s.user?.activeOrgId ?? null);
  const { requestSwitch, switchConfirm, confirmSwitch, cancelSwitch } =
    useActiveContextSwitch("employee");

  useThemeBundle("employee-shell");

  useEffect(() => {
    if (role === "employee") {
      void employeeNotificationsStorage.hydrateFromDb();
      return initEmployeeNotificationService();
    }
  }, [role]);

  useEffect(() => {
    function onScroll() {
      setTopbarScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  usePulseEventBridgeConsumer(role === "employee" ? "employee" : null);
  useServerInboxPoll(role === "employee" ? "employee" : null);

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
    if (AUTH_BACKEND_ENABLED && role === null) {
      return <RouteGuardLoading overlay label="Checking your session" />;
    }
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
      <div className={`wm-topbar${topbarScrolled ? " wm-topbarScrolled" : ""}`}>
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
            <JobMitraBrandName as="h1" />
            <p>Your career, your control.</p>
          </div>
        </div>

        <div className="wm-topbarActions" aria-label="Top actions">
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
                  key={unread}
                  className="wm-bellBadge wm-bellBadgeBounce"
                  aria-label={`${unread} unread`}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              ) : null}
            </div>
          </button>

          <button
            type="button"
            className="wm-avatarBtn"
            aria-label="Open account menu"
            title="Account menu"
            onClick={handleOpenSheet}
          >
            {userPhoto ? <img src={userPhoto} alt={displayName} /> : initials}
          </button>
        </div>
      </div>

      <div className="wm-container pb-safe-nav">
        <Outlet key={`employee:${activeOrgId ?? ""}`} />
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
        onSwitchRole={() => {
          setShowSheet(false);
          requestSwitch();
        }}
        onLogout={handleLogoutRequest}
      />

      <ConfirmModal
        confirm={logoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={handleCancelLogout}
      />

      <ConfirmModal confirm={switchConfirm} onConfirm={confirmSwitch} onCancel={cancelSwitch} />

      <CommandPalette
        open={commandOpen}
        onClose={closeCommandPalette}
        onNavigate={(path) => nav(path)}
        items={EMPLOYEE_COMMAND_PALETTE_ITEMS}
        searchPlaceholder="Search Shift, Career, Vault, Planner…"
        testId="wm-ent-command-palette-employee"
      />
    </div>
  );
}
