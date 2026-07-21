// Job Mitra | PlannerProjectContextBanner.tsx | Plan day context — shift-safe or planner variant

import { useNavigate } from "react-router-dom";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import { employeePlanApplicationSummaryPath } from "../../planner/helpers/plannerEmployeeRoutes";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

type Props = {
  planId: string;
  planSlotDate?: string;
  variant?: "planner" | "shift";
};

export function PlannerProjectContextBanner({ planId, planSlotDate, variant = "planner" }: Props) {
  const nav = useNavigate();
  const entry = plannerPublicIndex.getByPlanId(planId);

  if (!entry) return null;

  if (variant === "shift") {
    return (
      <section
        style={{
          marginBottom: 12,
          padding: "12px 14px",
          borderRadius: 16,
          borderLeft: "4px solid #16a34a",
          border: "1px solid rgba(22,163,74,0.2)",
          background: "linear-gradient(180deg, rgba(240,253,244,0.9), rgba(255,255,255,0.98))",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, color: "#15803d" }}>
          📋 Gig project day (separate domain)
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, marginTop: 6 }}>{entry.planName}</div>
        <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 4 }}>
          This day belongs to a multi-day Gig plan{planSlotDate ? ` · ${planSlotDate}` : ""}.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <button
            type="button"
            className="wm-outlineBtn"
            style={{ fontSize: 12 }}
            onClick={() => nav(employeePlanApplicationSummaryPath(planId))}
          >
            Plan breakdown →
          </button>
          <button
            type="button"
            className="wm-primarybtn"
            style={{ fontSize: 12 }}
            onClick={() => nav(ROUTE_PATHS.employeePlannerHome)}
          >
            Open Gig Projects →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="wm-planner-card"
      style={{
        marginBottom: 12,
        borderLeft: "4px solid var(--wm-planner-accent)",
        padding: "12px 14px",
      }}
    >
      <div className="wm-planner-badge">📋 Project Plan day</div>
      <div style={{ fontSize: 14, fontWeight: 800, marginTop: 6 }}>{entry.planName}</div>
      <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 4 }}>
        {entry.companyName} · {entry.dayCount} days
        {planSlotDate ? ` · This day: ${planSlotDate}` : ""}
      </div>
      <button
        type="button"
        className="wm-planner-btnGhost"
        style={{ marginTop: 10, fontSize: 12 }}
        onClick={() => nav(employeePlanApplicationSummaryPath(planId))}
      >
        View plan breakdown →
      </button>
    </section>
  );
}
