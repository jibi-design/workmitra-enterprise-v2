/** Job Mitra | EmployerShell.tsx | C:\projects\WorkMitra_Enterprise_v2\src\app\shells\EmployerShell.tsx */

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logoutApp, postLogoutRoute } from "../../shared/auth/logoutApp";
import { ROUTE_PATHS } from "../router/routePaths";
import { filterLaunchVisibleEmployerNotifications } from "../../shared/components/notifications/notificationLaunchFilters";
import { initEmployerNotificationService } from "../../features/employer/notifications/helpers/employerNotificationService";
import { employerNotificationsStorage } from "../../features/employer/notifications/storage/employerNotifications.storage";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";
import { AccountMenuSheet } from "../../shared/components/AccountMenuSheet";
import { ConfirmModal, type ConfirmData } from "../../shared/components/ConfirmModal";
import { usePulseEventBridgeConsumer } from "../../features/pulse/pulseEventBridge";
import { useServerInboxPoll } from "../../features/notifications/services/useServerInboxPoll";
import { showPhase2Features } from "../../shared/config/featureFlags";
import BottomNav from "../../components/layout/BottomNav/BottomNav";
import { useThemeBundle } from "./useThemeBundle";
import {
  getEmployerBackTarget,
  getInitials,
  safeCanGoBack,
  useRole,
} from "./EmployerShell.helpers";
import { EmployerTopbar } from "./EmployerShell.parts";
import {
  CommandPalette,
  EnterpriseToastHost,
  useCommandPaletteHub,
} from "../../shared/components/enterprise";
import { AUTH_BACKEND_ENABLED } from "../../shared/config/authConfig";
import { RouteGuardLoading } from "../../shared/components/routes/RouteGuardStatus";
import { useActiveContextSwitch } from "../../shared/auth/useActiveContextSwitch";
import { useAuthStore } from "../../shared/store/authStore";

function useEmployerUnread(): number {
  const all = useSyncExternalStore(
    employerNotificationsStorage.subscribe,
    () => employerNotificationsStorage.getAll(),
    () => employerNotificationsStorage.getAll(),
  );
  return filterLaunchVisibleEmployerNotifications(all).filter((row) => !row.isRead).length;
}

export function EmployerShell() {
  const role = useRole();
  const unread = useEmployerUnread();
  const loc = useLocation();
  const nav = useNavigate();

  const [showSheet, setShowSheet] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState<ConfirmData | null>(null);
  const [topbarScrolled, setTopbarScrolled] = useState(false);
  const { open: commandOpen, close: closeCommandPalette } = useCommandPaletteHub();
  const activeOrgId = useAuthStore((s) => s.user?.activeOrgId ?? null);
  const { requestSwitch, switchConfirm, confirmSwitch, cancelSwitch } =
    useActiveContextSwitch("employer");

  useThemeBundle("employer-shell");

  useEffect(() => {
    if (role === "employer") return initEmployerNotificationService();
  }, [role]);

  useEffect(() => {
    function onScroll() {
      setTopbarScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  usePulseEventBridgeConsumer(role === "employer" ? "employer" : null);
  useServerInboxPoll(role === "employer" ? "employer" : null);

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

  if (role !== "employer") {
    if (AUTH_BACKEND_ENABLED && role === null) {
      return <RouteGuardLoading overlay label="Checking your session" />;
    }
    const target = role === "employee" ? ROUTE_PATHS.employeeHome : ROUTE_PATHS.landing;
    return <Navigate to={target} replace />;
  }

  const isHome = loc.pathname === ROUTE_PATHS.employerHome;
  const isPlannerSubdomain = loc.pathname.startsWith("/employer/planner");
  const shouldShowBack = !isHome;
  const explicitBackTarget = getEmployerBackTarget(loc.state);
  const profile = (() => {
    try {
      return employerSettingsStorage.get();
    } catch {
      return employerSettingsStorage.EMPTY_PROFILE;
    }
  })();
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
      <EmployerTopbar
        shouldShowBack={shouldShowBack}
        isHome={isHome}
        unread={unread}
        initials={initials}
        topbarScrolled={topbarScrolled}
        isPlannerSubdomain={isPlannerSubdomain}
        onBack={goBack}
        onHome={goHome}
        onOpenNotifications={handleOpenNotifications}
        onOpenSheet={() => setShowSheet(true)}
      />

      <div className="wm-container pb-safe-nav">
        <Outlet key={`employer:${activeOrgId ?? ""}`} />
      </div>

      <BottomNav />

      <AccountMenuSheet
        open={showSheet}
        onClose={() => setShowSheet(false)}
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
        onSwitchRole={() => {
          setShowSheet(false);
          requestSwitch();
        }}
        onLogout={handleLogoutRequest}
      />

      <ConfirmModal
        confirm={logoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutConfirm(null)}
      />

      <ConfirmModal confirm={switchConfirm} onConfirm={confirmSwitch} onCancel={cancelSwitch} />

      <CommandPalette
        open={commandOpen}
        onClose={closeCommandPalette}
        onNavigate={(path) => nav(path)}
      />

      <EnterpriseToastHost />
    </div>
  );
}
