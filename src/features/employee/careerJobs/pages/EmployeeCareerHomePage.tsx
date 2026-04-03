// src/features/employee/careerJobs/pages/EmployeeCareerHomePage.tsx
//
// Career Jobs domain entry page for employees.
// Navigation cards: Search Jobs, My Applications, My Workspaces.
// Domain: Career Blue -- var(--wm-er-accent-career)

import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  getCareerSearchSnapshot,
  subscribeCareerSearch,
} from "../helpers/careerSearchHelpers";
import { EmployeeMyCurrentJobCard } from "../components/EmployeeMyCurrentJobCard";

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
    </svg>
  );
}

function IconApps() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Zm-3-7H9v-2h6v2Zm0 4H9v-2h6v2Z" />
    </svg>
  );
}

function IconWorkspace() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2Zm-6 0h-4V4h4v2Z" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Nav Card                                         */
/* ------------------------------------------------ */
function NavCard({ icon, title, subtitle, badge, onClick }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      style={{
        width: "100%", textAlign: "left", padding: 16,
        borderRadius: 14, border: "1px solid rgba(29,78,216,0.12)",
        background: "var(--wm-er-card, #fff)",
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 14,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(29,78,216,0.08)", color: "var(--wm-er-accent-career)",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--wm-er-text, #1e293b)" }}>
            {title}
          </div>
          {badge && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 8px",
              borderRadius: 999, background: "var(--wm-er-accent-career)", color: "#fff",
            }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ color: "var(--wm-er-muted, #64748b)", flexShrink: 0 }}>
        <IconChevron />
      </div>
    </button>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployeeCareerHomePage() {
  const nav = useNavigate();

  const posts = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerSearchSnapshot,
    getCareerSearchSnapshot,
  );

  const activeJobCount = posts.length;

  return (
    <div>
      {/* Page Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Career Jobs</div>
          <div className="wm-pageSub">Find permanent positions, track applications, manage workspaces.</div>
        </div>
      </div>

      {/* Summary Banner */}
      <div style={{
        marginTop: 12, padding: "14px 16px", borderRadius: 14,
        background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.12)",
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-accent-career)" }}>
          {activeJobCount > 0
            ? `${activeJobCount} career ${activeJobCount === 1 ? "job" : "jobs"} available now`
            : "No career jobs available right now"}
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted, #64748b)", marginTop: 2 }}>
          Employers post permanent positions here. Search, apply, and track your progress.
        </div>
      </div>

       {/* My Current Job */}
      <div style={{ marginTop: 14 }}>
        <EmployeeMyCurrentJobCard onOpen={() => nav(ROUTE_PATHS.employeeCareerApplications.replace("applications", "workspaces"))} />
      </div>

      {/* Navigation Cards */}
      <div style={{ marginTop: 14, display: "grid", gap: 10, marginBottom: 32 }}>
        <NavCard
          icon={<IconSearch />}
          title="Search Jobs"
          subtitle="Browse and filter available career positions"
          badge={activeJobCount > 0 ? String(activeJobCount) : undefined}
          onClick={() => nav(ROUTE_PATHS.employeeCareerSearch)}
        />
        <NavCard
          icon={<IconApps />}
          title="My Applications"
          subtitle="Track your submitted applications and interview progress"
          onClick={() => nav(ROUTE_PATHS.employeeCareerApplications)}
        />
        <NavCard
          icon={<IconWorkspace />}
          title="My Workspaces"
          subtitle="Onboarding and communication for hired positions"
          onClick={() => nav(ROUTE_PATHS.employeeCareerApplications.replace("applications", "workspaces"))}
        />
      </div>
    </div>
  );
}