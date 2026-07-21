// Job Mitra | PlannerMyWorkPlanBundle.tsx

import { useNavigate } from "react-router-dom";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import { formatPlannerPayPerDay } from "../../../shared/planner/plannerPublic";
import type {
  ShiftApplicationData,
  ShiftPostData,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { fmtTimestamp, statusLabel } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { getPlannerStatusStyle } from "../helpers/plannerStatusStyles";
import { employeePlanApplicationSummaryPath } from "../../planner/helpers/plannerEmployeeRoutes";

type Props = {
  planId: string;
  applications: ShiftApplicationData[];
  postMap: Map<string, ShiftPostData>;
  onOpenApplication: (application: ShiftApplicationData) => void;
};

export function PlannerMyWorkPlanBundle({
  planId,
  applications,
  postMap,
  onOpenApplication,
}: Props) {
  const nav = useNavigate();
  const indexEntry = plannerPublicIndex.getByPlanId(planId);
  const planName =
    indexEntry?.planName ?? postMap.get(applications[0]?.postId ?? "")?.jobName ?? "Project Plan";
  const companyName =
    indexEntry?.companyName ??
    postMap.get(applications[0]?.postId ?? "")?.companyName ??
    "Employer";

  const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  const dominantStatus =
    applications.find((a) => a.status === "confirmed")?.status ??
    applications.find((a) => a.status === "shortlisted")?.status ??
    applications.find((a) => a.status === "waiting")?.status ??
    applications[0]?.status ??
    "applied";

  const statusStyle = getPlannerStatusStyle(dominantStatus);

  return (
    <article
      className="wm-planner-megaCard"
      style={{ borderLeft: "5px solid var(--wm-planner-accent)" }}
    >
      <div className="wm-planner-megaCardHeader">
        <div className="wm-planner-badge">
          📋 Project Plan · {applications.length} day applications
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, marginTop: 8 }}>{planName}</div>
        <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 4 }}>
          {companyName}
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              padding: "5px 9px",
              borderRadius: 999,
              background: statusStyle.badgeBg,
              color: statusStyle.color,
            }}
          >
            {statusLabel(dominantStatus)} bundle
          </span>
          {Object.entries(statusCounts).map(([status, count]) => (
            <span
              key={status}
              style={{ fontSize: 10, fontWeight: 700, color: "var(--wm-neutral-500)" }}
            >
              {count} {statusLabel(status as ShiftApplicationData["status"])}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, display: "grid", gap: 8 }}>
        {applications.map((application) => {
          const post = postMap.get(application.postId);
          const dateLabel = post?.startAt
            ? new Date(post.startAt).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            : "Day";

          return (
            <button
              key={application.id}
              type="button"
              onClick={() => onOpenApplication(application)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--wm-planner-border)",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{dateLabel}</div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: getPlannerStatusStyle(application.status).color,
                  }}
                >
                  {statusLabel(application.status)}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--wm-neutral-500)", marginTop: 4 }}>
                Applied {fmtTimestamp(application.createdAt)}
                {post?.payPerDay ? ` · ${formatPlannerPayPerDay(post.payPerDay)}` : ""}
              </div>
            </button>
          );
        })}
        <button
          type="button"
          className="wm-planner-btnPrimary"
          style={{ width: "100%" }}
          onClick={() => nav(employeePlanApplicationSummaryPath(planId))}
        >
          View breakdown →
        </button>
      </div>
    </article>
  );
}
