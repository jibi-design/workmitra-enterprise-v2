/**
 * Pro-Level Employer Dashboard — Hiring/Operations + Event day tabs.
 * Canonical feature path. Alias: src/pages/employer/EmployerDashboard.tsx
 */

import { useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { EmployerDashMetricsCards } from "../components/employerDashboard/EmployerDashMetricsCards";
import { EmployerPipelineTracker } from "../components/employerDashboard/EmployerPipelineTracker";
import { EmployerMatchPanel } from "../components/employerDashboard/EmployerMatchPanel";
import { EmployerActiveJobsWidget } from "../components/employerDashboard/EmployerActiveJobsWidget";
import { EmployerInterviewActionsPanel } from "../components/employerDashboard/EmployerInterviewActionsPanel";
import { EmployerDashboardUtilitiesPanel } from "../components/employerDashboard/EmployerDashboardUtilitiesPanel";
import { useEmployerDashboardModel } from "../hooks/useEmployerDashboardModel";
import type { EmployerPipelineFilter } from "../helpers/employerDashboard.helpers";
import {
  parseEmployerDashboardTab,
  writeEmployerDashboardTabParam,
  type EmployerDashboardTab,
} from "../helpers/employerDashboard.tab";

export type EmployerDashboardProps = {
  readonly showBackToHome?: boolean;
};

export type { EmployerDashboardTab };

export function EmployerDashboard({ showBackToHome = true }: EmployerDashboardProps) {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<EmployerPipelineFilter>("Applied");
  const model = useEmployerDashboardModel(filter);
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
        {showBackToHome ? (
          <button
            type="button"
            className="wm-dashHero__back"
            onClick={() => nav(ROUTE_PATHS.employerHome)}
            aria-label="Back to home"
          >
            ← Home
          </button>
        ) : null}
        <div className="wm-dashHero__kicker">Employer Pro</div>
        <h1 className="wm-dashHero__title">Employer Dashboard</h1>
        <p className="wm-dashHero__sub">
          {companyName
            ? `${companyName} · hiring operations for your signed-in session`
            : "Career hiring operations bound to your signed-in employer session."}
        </p>
      </header>

      <div
        className="wm-erDashTabs"
        role="tablist"
        aria-label="Employer dashboard sections"
      >
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
        <div
          id="er-dash-panel-operations"
          role="tabpanel"
          aria-labelledby="er-dash-tab-operations"
        >
          <EmployerDashMetricsCards metrics={model.metrics} />

          <EmployerPipelineTracker
            rows={model.pipeline}
            stageCounts={model.stageCounts}
            filter={filter}
            onFilterChange={setFilter}
          />

          <div className="wm-erDashBento" data-testid="employer-jobs-matches-bento">
            <EmployerActiveJobsWidget jobs={model.activeJobs} />
            <EmployerMatchPanel items={model.matches} />
          </div>

          <EmployerInterviewActionsPanel interviews={model.interviews} />
        </div>
      ) : (
        <div
          id="er-dash-panel-event-day"
          role="tabpanel"
          aria-labelledby="er-dash-tab-event-day"
        >
          <EmployerDashboardUtilitiesPanel />
        </div>
      )}
    </div>
  );
}

export default EmployerDashboard;
