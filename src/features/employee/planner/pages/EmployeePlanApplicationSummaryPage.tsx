// Job Mitra | EmployeePlanApplicationSummaryPage.tsx | Section 7.12

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { plannerPublicIndex } from "../../../employer/planner/storage/plannerPublicIndex.storage";
import { formatPlannerPayPerDay } from "../../../employer/planner/helpers/plannerPayDisplay.helpers";
import { getEmployerShiftPosts } from "../../../employer/shiftJobs/storage/employerShift.postActions";
import { readEmployeeApplications } from "../../../employer/shiftJobs/storage/employerShift.employeeBridge";
import { fmtTimestamp, statusLabel } from "../../shiftJobs/helpers/shiftApplicationHelpers";
import { getPlannerStatusStyle } from "../helpers/plannerStatusStyles";
import {
  employeePlanApplicationSummaryPath,
  employeeProjectDetailPath,
} from "../../planner/helpers/plannerEmployeeRoutes";
import { shiftWorkspacesStorage } from "../../shiftJobs/storage/shiftWorkspaces.storage";

const APPS_CHANGED = "wm:employee-shift-apps-changed";

let planAppsCacheKey = "";
let planAppsCachePlanId = "";
let planAppsCacheSnapshot: ReturnType<typeof readEmployeeApplications> = [];

function getPlanAppsSnapshot(planId: string) {
  const all = readEmployeeApplications();
  const cacheKey = JSON.stringify(all);
  if (planId === planAppsCachePlanId && cacheKey === planAppsCacheKey && planAppsCacheKey !== "") {
    return planAppsCacheSnapshot;
  }
  planAppsCachePlanId = planId;
  planAppsCacheKey = cacheKey;
  planAppsCacheSnapshot = all.filter((app) => app.planId === planId);
  return planAppsCacheSnapshot;
}

function subscribeApps(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(APPS_CHANGED, handler);
  return () => window.removeEventListener(APPS_CHANGED, handler);
}

export function EmployeePlanApplicationSummaryPage() {
  const { planId = "" } = useParams();
  const nav = useNavigate();

  const entry = useSyncExternalStore(
    plannerPublicIndex.subscribe,
    () => plannerPublicIndex.getByPlanId(planId),
    () => plannerPublicIndex.getByPlanId(planId),
  );

  const apps = useSyncExternalStore(
    subscribeApps,
    () => getPlanAppsSnapshot(planId),
    () => getPlanAppsSnapshot(planId),
  );

  const workspaces = useSyncExternalStore(
    shiftWorkspacesStorage.subscribe,
    shiftWorkspacesStorage.getAll,
  );

  const rows = useMemo(() => {
    return apps.map((app) => {
      const post = getEmployerShiftPosts().find((p) => p.id === app.postId);
      const ws = workspaces.find((w) => w.postId === app.postId);
      const dateLabel = post?.planSlotDate
        ? post.planSlotDate
        : post?.startAt
          ? new Date(post.startAt).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          : "Day";

      const planCancelled =
        entry?.status === "cancelled" || app.notes?.planClosed === "plan_cancelled";

      return {
        app,
        post,
        ws,
        dateLabel,
        planCancelled,
      };
    });
  }, [apps, workspaces, entry?.status]);

  const statusCounts = rows.reduce<Record<string, number>>((acc, row) => {
    const key = row.planCancelled && row.app.status !== "confirmed" ? "cancelled" : row.app.status;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const openDaysRemain = entry?.openDayCount ?? 0;

  if (!entry && rows.length === 0) {
    return (
      <div className="wm-ee-vPlanner wm-planner-page">
        <div className="wm-planner-card">No plan applications found.</div>
      </div>
    );
  }

  const planName = entry?.planName ?? "Project Plan";

  return (
    <div className="wm-ee-vPlanner wm-planner-page">
      <section className="wm-planner-hero">
        <div className="wm-planner-badge">📋 Plan breakdown</div>
        <div className="wm-planner-heroTitle" style={{ marginTop: 8 }}>
          {planName}
        </div>
        <div className="wm-planner-heroSub">
          Applied {rows.length} day{rows.length !== 1 ? "s" : ""}
          {Object.entries(statusCounts).map(
            ([s, c]) => ` · ${c} ${statusLabel(s as (typeof rows)[0]["app"]["status"])}`,
          )}
        </div>
      </section>

      <div className="wm-planner-card" style={{ display: "grid", gap: 8 }}>
        {rows.map(({ app, post, ws, dateLabel, planCancelled }) => {
          const style = getPlannerStatusStyle(
            planCancelled && app.status !== "confirmed" ? "rejected" : app.status,
          );
          const displayStatus =
            planCancelled && app.status !== "confirmed"
              ? "Project cancelled"
              : statusLabel(app.status);

          return (
            <div
              key={app.id}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid var(--wm-planner-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{dateLabel}</div>
                <div style={{ fontSize: 11, color: "var(--wm-neutral-500)", marginTop: 4 }}>
                  Applied {fmtTimestamp(app.createdAt)}
                  {post?.payPerDay ? ` · ${formatPlannerPayPerDay(post.payPerDay)}` : ""}
                </div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 6,
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: style.badgeBg,
                    color: style.color,
                  }}
                >
                  {displayStatus}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {app.status === "confirmed" && ws ? (
                  <button
                    type="button"
                    className="wm-planner-btnPrimary"
                    style={{ fontSize: 11, padding: "8px 12px" }}
                    onClick={() =>
                      nav(ROUTE_PATHS.employeePlannerWorkspace.replace(":workspaceId", ws.id))
                    }
                  >
                    Open workspace
                  </button>
                ) : (
                  <button
                    type="button"
                    className="wm-planner-btnGhost"
                    style={{ fontSize: 11, padding: "8px 12px" }}
                    onClick={() => nav(employeePlanApplicationSummaryPath(planId))}
                  >
                    View shift
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="wm-planner-card" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {openDaysRemain > 0 && entry?.status === "active" ? (
          <button
            type="button"
            className="wm-planner-btnPrimary"
            onClick={() => nav(employeeProjectDetailPath(planId))}
          >
            Pick more days
          </button>
        ) : null}
        <button
          type="button"
          className="wm-planner-btnGhost"
          onClick={() => nav(ROUTE_PATHS.employeePlannerApplications)}
        >
          My applications
        </button>
      </div>
    </div>
  );
}
