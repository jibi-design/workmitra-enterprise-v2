// Job Mitra | PlannerEmployeeGigHub.tsx | Employee Gig Projects command home

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import { formatPlannerPayRange } from "../../../shared/planner/plannerPublic";
import { readEmployeeApplicationsPublic as readEmployeeApplications } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { groupApplicationsForMyWork } from "../../planner/helpers/plannerApplicationBundles";
import { employeeProjectDetailPath } from "../../planner/helpers/plannerEmployeeRoutes";
import { PlannerEmployeeCommandGrid } from "./PlannerEmployeeCommandGrid";
import { PlannerShiftHomeProjectStrip } from "./PlannerShiftHomeProjectStrip";

const APPS_CHANGED = "wm:employee-shift-apps-changed";

function getIndexSnapshot() {
  return plannerPublicIndex.getActiveEntries();
}

function getPlanBundleCount() {
  const apps = readEmployeeApplications();
  return groupApplicationsForMyWork(apps).filter((e) => e.kind === "plan").length;
}

function subscribeApps(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(APPS_CHANGED, handler);
  return () => window.removeEventListener(APPS_CHANGED, handler);
}

export function PlannerEmployeeGigHub() {
  const nav = useNavigate();
  const entries = useSyncExternalStore(
    plannerPublicIndex.subscribe,
    getIndexSnapshot,
    getIndexSnapshot,
  );
  const planBundleCount = useSyncExternalStore(
    subscribeApps,
    getPlanBundleCount,
    getPlanBundleCount,
  );

  const preview = useMemo(
    () => [...entries].sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 3),
    [entries],
  );

  const openDays = entries.reduce((sum, e) => sum + e.openDayCount, 0);

  return (
    <div className="wm-ee-vPlanner wm-planner-page wm-stackGrid">
      <DomainHero
        variant="planner"
        audience="employee"
        eyebrow="Gig Projects"
        title="Multi-Day Project Plans"
        subtitle="Browse agency plans, apply as a bundle, and track your gig workspaces."
      >
        <div className="wm-planner-kpiStrip" style={{ marginTop: 0 }}>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Open projects</div>
            <div className="wm-planner-kpiValue">{entries.length}</div>
          </div>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Open days</div>
            <div className="wm-planner-kpiValue">{openDays}</div>
          </div>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">My plan bundles</div>
            <div className="wm-planner-kpiValue">{planBundleCount}</div>
          </div>
        </div>
      </DomainHero>

      <PlannerEmployeeCommandGrid />

      <PlannerShiftHomeProjectStrip />

      <div className="wm-planner-card">
        <div className="wm-typeSectionTitle" style={{ marginBottom: "var(--wm-stack-gap)" }}>
          Open projects preview
        </div>
        {preview.length === 0 ? (
          <div className="wm-typeHelper">
            No project plans near you yet. When an employer publishes a plan, it appears here and on
            Gig Home.
          </div>
        ) : (
          preview.map((entry) => (
            <button
              key={entry.planId}
              type="button"
              className="wm-planner-btnGhost"
              style={{
                width: "100%",
                marginBottom: "var(--wm-stack-gap)",
                justifyContent: "space-between",
              }}
              onClick={() => nav(employeeProjectDetailPath(entry.planId))}
            >
              <span>{entry.planName}</span>
              <span className="wm-planner-badge">
                {formatPlannerPayRange(entry.payMin, entry.payMax)}
              </span>
            </button>
          ))
        )}
        <button
          type="button"
          className="wm-planner-btnPrimary"
          style={{ width: "100%", marginTop: 4 }}
          onClick={() => nav(ROUTE_PATHS.employeePlannerBrowse)}
        >
          Browse all Gig Projects →
        </button>
      </div>
    </div>
  );
}
