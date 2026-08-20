/**
 * Pro-Level Employer Dashboard — Hiring/Operations + Event day tabs.
 * Canonical feature path. Alias: src/pages/employer/EmployerDashboard.tsx
 */

import { useMemo, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { EmployerDashboardOperations } from "../components/employerDashboard/EmployerDashboardOperations";
import { EmployerDashboardUtilitiesPanel } from "../components/employerDashboard/EmployerDashboardUtilitiesPanel";
import {
  parseEmployerDashboardTab,
  writeEmployerDashboardTabParam,
  type EmployerDashboardTab,
} from "../helpers/employerDashboard.tab";

export type { EmployerDashboardTab };

export function EmployerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  let companyName = "";
  try {
    companyName = employerSettingsStorage.get()?.companyName?.trim() || "";
  } catch {
    companyName = "";
  }

  const activeTab = useMemo(
    () => parseEmployerDashboardTab(searchParams.get("tab")),
    [searchParams],
  );

  function setTab(tab: EmployerDashboardTab) {
    setSearchParams(writeEmployerDashboardTabParam(searchParams, tab), { replace: true });
  }

  return (
    <div
      className="wm-dashPage wm-erDash wm-erDash--dashboard"
      data-testid="employer-dashboard"
      style={
        {
          "--wm-card-domain-accent": "var(--wm-dashboard-accent, #0f766e)",
        } as CSSProperties
      }
    >
      <header className="wm-dashHero">
        <div className="wm-dashHero__kicker">Employer Pro</div>
        <h1 className="wm-dashHero__title">Employer Dashboard</h1>
        <p className="wm-dashHero__sub">
          {companyName
            ? `${companyName} · Shift, Career, Planner, gate, and vault in one glance`
            : "Shift, Career, Planner, workspaces, gate, and vault — one operations hub."}
        </p>
      </header>

      <div className="wm-erDashTabs" role="tablist" aria-label="Employer dashboard sections">
        <button
          type="button"
          role="tab"
          id="er-dash-tab-operations"
          aria-selected={activeTab === "operations"}
          aria-controls="er-dash-panel-operations"
          className={`wm-erDashTabs__btn${activeTab === "operations" ? " isActive" : ""}`}
          onClick={() => setTab("operations")}
        >
          Hiring / Operations
        </button>
        <button
          type="button"
          role="tab"
          id="er-dash-tab-event-day"
          aria-selected={activeTab === "event-day"}
          aria-controls="er-dash-panel-event-day"
          aria-label="Event day — event passes and venue QR codes"
          className={`wm-erDashTabs__btn${activeTab === "event-day" ? " isActive" : ""}`}
          onClick={() => setTab("event-day")}
        >
          Event day
        </button>
      </div>

      {activeTab === "operations" ? (
        <div id="er-dash-panel-operations" role="tabpanel" aria-labelledby="er-dash-tab-operations">
          <EmployerDashboardOperations />
        </div>
      ) : (
        <div id="er-dash-panel-event-day" role="tabpanel" aria-labelledby="er-dash-tab-event-day">
          <EmployerDashboardUtilitiesPanel />
        </div>
      )}
    </div>
  );
}

export default EmployerDashboard;
