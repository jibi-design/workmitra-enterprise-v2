// src/app/shells/AdminShell.tsx
//
// Admin shell — clean dark premium. Top nav tabs for all admin pages.
// Tabs: Overview | Users | Audit | Analytics | Alerts | Settings
// Mobile-first, horizontal scroll on narrow screens.

import { useSyncExternalStore } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { roleStorage, type AppRole } from "../storage/roleStorage";
import { ROUTE_PATHS } from "../router/routePaths";

// ─────────────────────────────────────────────────────────────────────────────
// Icons (inline SVG — zero dependencies)
// ─────────────────────────────────────────────────────────────────────────────

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.58-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8Z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2H5Zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5l-5 5Z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab Configuration
// ─────────────────────────────────────────────────────────────────────────────

type TabDef = {
  label: string;
  path: string;
  enabled: boolean;
};

const ADMIN_TABS: TabDef[] = [
  { label: "Overview", path: ROUTE_PATHS.adminHome, enabled: true },
  { label: "Users", path: ROUTE_PATHS.adminUsers, enabled: true },
  { label: "Audit", path: ROUTE_PATHS.adminAlerts, enabled: true },
  { label: "Analytics", path: ROUTE_PATHS.adminAnalytics, enabled: true },
  { label: "Alerts", path: ROUTE_PATHS.adminNotifications, enabled: true },
  { label: "Settings", path: ROUTE_PATHS.adminSettings, enabled: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function useRole(): AppRole | null {
  return useSyncExternalStore(roleStorage.subscribe, roleStorage.get, roleStorage.get);
}

function safeCanGoBack(): boolean {
  try {
    return window.history.length > 1;
  } catch {
    return false;
  }
}

function isTabActive(tabPath: string, currentHash: string): boolean {
  const currentPath = currentHash.replace(/^#/, "") || "/";
  if (tabPath === ROUTE_PATHS.adminHome) {
    return currentPath === "/admin" || currentPath === "/admin/";
  }
  return currentPath.startsWith(tabPath);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdminShell() {
  const role = useRole();
  const loc = useLocation();
  const nav = useNavigate();

  if (role !== "admin") {
    return <Navigate to={ROUTE_PATHS.landing} state={{ from: loc.pathname }} replace />;
  }

  function goHome() {
    nav(ROUTE_PATHS.adminHome);
  }

  function goBack() {
    if (safeCanGoBack()) nav(-1);
    else goHome();
  }

  function handleLogout() {
    roleStorage.clear();
    nav(ROUTE_PATHS.landing, { replace: true });
  }

  const currentHash = window.location.hash;

  return (
    <div className="wm-shellRoot wm-shellAdmin">
      {/* ── Top Bar ── */}
      <div className="wm-topbar wm-admin-topbar">
        <div className="wm-topbarActions" aria-label="Left navigation" style={{ display: "flex", gap: 10 }}>
          <button className="wm-iconbtn" type="button" aria-label="Back" title="Back" onClick={goBack}>
            <IconBack />
          </button>
        </div>

        <div className="wm-title">
          <h1>WorkMitra</h1>
          <p>
            Admin Control{" "}
            <span className="wm-roleBadge wm-roleBadgeAdmin" aria-label="Demo workspace badge">
              DEMO
            </span>
          </p>
        </div>

        <div className="wm-topbarActions" aria-label="Top actions" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="wm-iconbtn" type="button" aria-label="Home" title="Home" onClick={goHome}>
            <IconHome />
          </button>
          <button className="wm-iconbtn" type="button" aria-label="Logout" title="Logout" onClick={handleLogout}>
            <IconLogout />
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="wm-ad-tabs" role="tablist" aria-label="Admin navigation">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.path}
            type="button"
            role="tab"
            className="wm-ad-tab"
            data-active={isTabActive(tab.path, currentHash)}
            data-disabled={!tab.enabled}
            aria-selected={isTabActive(tab.path, currentHash)}
            aria-disabled={!tab.enabled}
            onClick={() => {
              if (tab.enabled) nav(tab.path);
            }}
          >
            {tab.label}
            {!tab.enabled && (
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  marginLeft: 4,
                  opacity: 0.5,
                  verticalAlign: "super",
                }}
              >
                SOON
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="wm-ad-tabDivider" />

      {/* ── Page Content ── */}
      <div className="wm-container" style={{ padding: "16px 16px 32px" }}>
        <Outlet />
      </div>
    </div>
  );
}