// Job Mitra | PlannerEmployeeGigHub.tsx | Employee Gig Projects command home

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { PlannerShell } from "../../../../app/shells/PlannerShell";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import { formatPlannerPayRange } from "../../../shared/planner/plannerPublic";
import { readPlannerEmployeeApplications } from "../../../shared/planner/services/plannerApplications.reader";
import { groupApplicationsForMyWork } from "../../planner/helpers/plannerApplicationBundles";
import { employeeProjectDetailPath } from "../../planner/helpers/plannerEmployeeRoutes";
import { PlannerEmployeeCommandGrid } from "./PlannerEmployeeCommandGrid";
import { PlannerShiftHomeProjectStrip } from "./PlannerShiftHomeProjectStrip";

const APPS_CHANGED = "wm:employee-shift-apps-changed";

function getIndexSnapshot() {
  return plannerPublicIndex.getActiveEntries();
}

function getPlanBundleCount() {
  const apps = readPlannerEmployeeApplications();
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
    <PlannerShell audience="employee">
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

      {preview.length === 0 ? (
        <div className="wm-planner-card" data-testid="planner-gig-hub-empty">
          <div className="wm-planner-sectionLabel">Catalog</div>
          <div className="wm-planner-sectionTitle">Empty catalog</div>
          <p className="wm-typeHelper">
            No project plans listed yet. When an employer publishes a multi-day plan, it appears
            here. Use Browse Projects in the command center to check again.
          </p>
        </div>
      ) : (
        <>
          <PlannerShiftHomeProjectStrip />

          <div className="wm-planner-card">
            <div className="wm-planner-sectionLabel">Preview</div>
            <div className="wm-planner-sectionTitle">Open projects preview</div>
            {preview.map((entry) => (
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
            ))}
            <button
              type="button"
              className="wm-planner-btnPrimary"
              style={{ width: "100%", marginTop: 4 }}
              onClick={() => nav(ROUTE_PATHS.employeePlannerBrowse)}
            >
              Open project catalog →
            </button>
          </div>
        </>
      )}
    </PlannerShell>
  );
}
