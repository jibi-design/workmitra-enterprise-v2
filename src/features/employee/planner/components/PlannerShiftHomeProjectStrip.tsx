// Job Mitra | PlannerShiftHomeProjectStrip.tsx | Section 7.10

import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { formatPlannerPayPerDay } from "../../../employer/planner/helpers/plannerPayDisplay.helpers";
import { plannerPublicIndex } from "../../../employer/planner/storage/plannerPublicIndex.storage";
import { employeePlanEngagementStorage } from "../storage/employeePlanEngagement.storage";

function getSnapshot() {
  return plannerPublicIndex.getActiveEntries();
}

export function PlannerShiftHomeProjectStrip() {
  const nav = useNavigate();
  const entries = useSyncExternalStore(plannerPublicIndex.subscribe, getSnapshot, getSnapshot);

  useSyncExternalStore(
    employeePlanEngagementStorage.subscribe,
    () => employeePlanEngagementStorage.getSnapshotKey(),
    () => employeePlanEngagementStorage.getSnapshotKey(),
  );

  const summary =
    entries.length === 0
      ? null
      : (() => {
          const recentIds = employeePlanEngagementStorage.getRecentlyViewedPlanIds(1);
          const prioritized =
            recentIds.length > 0
              ? (entries.find((e) => e.planId === recentIds[0]) ?? entries[0])
              : entries[0];
          const maxPay = Math.max(...entries.map((e) => e.payMax));
          return { count: entries.length, maxPay, highlight: prioritized?.planName };
        })();

  return (
    <section
      className="wm-planner-card"
      style={{
        borderLeft: "4px solid var(--wm-planner-accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-planner-accent-strong)" }}>
          📋 Project Plans near you
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 4 }}>
          {summary ? (
            <>
              {summary.count} multi-day project{summary.count !== 1 ? "s" : ""} open · up to{" "}
              {formatPlannerPayPerDay(summary.maxPay)}
              {summary.highlight ? ` · last viewed: ${summary.highlight}` : ""}
            </>
          ) : (
            <>No open projects right now — section stays visible so you know where to check.</>
          )}
        </div>
      </div>
      <button
        type="button"
        className="wm-planner-btnPrimary"
        onClick={() => nav(ROUTE_PATHS.employeePlannerBrowse)}
      >
        Browse Projects →
      </button>
    </section>
  );
}
