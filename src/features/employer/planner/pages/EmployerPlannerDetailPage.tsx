// Job Mitra | EmployerPlannerDetailPage.tsx — facade

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { plannerPublicIndex } from "../storage/plannerPublicIndex.storage";
import { employerShiftStorage } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { broadcastToPlanCrew } from "../services/planBroadcast.service";
import { cancelActivePlan } from "../services/plannerCancel.service";
import { planBroadcastGroupStorage } from "../storage/planBroadcastGroup.storage";
import {
  PlannerDetailBroadcastSection,
  PlannerDetailBudgetSection,
  PlannerDetailDaysSection,
} from "./EmployerPlannerDetailPage.parts";

export function EmployerPlannerDetailPage() {
  const { planId = "" } = useParams();
  const nav = useNavigate();
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const subscribe = useMemo(
    () => (cb: () => void) => {
      const u1 = demandPlannerStorage.subscribe(cb);
      const u2 = planBroadcastGroupStorage.subscribe(cb);
      return () => {
        u1();
        u2();
      };
    },
    [],
  );

  const plan = useSyncExternalStore(
    subscribe,
    () => demandPlannerStorage.getById(planId),
    () => demandPlannerStorage.getById(planId),
  );

  const crewCount = planBroadcastGroupStorage.getByPlanId(planId)?.memberWorkerMlIds.length ?? 0;
  const publicEntry = plannerPublicIndex.getByPlanId(planId);
  const estBudget = plan?.slots.reduce((sum, s) => sum + s.workers * s.payPerDay, 0) ?? 0;
  const firstOpenPostId = plan?.slots.find((s) => s.postId)?.postId;

  const fill = useMemo(() => {
    if (!plan) return { confirmed: 0, needed: 0, pct: 0 };
    let confirmed = 0;
    let needed = 0;
    for (const slot of plan.slots) {
      if (!slot.postId) continue;
      const post = employerShiftStorage.getPosts().find((p) => p.id === slot.postId);
      if (!post) continue;
      needed += post.vacancies;
      confirmed += post.confirmedIds.length;
    }
    return { confirmed, needed, pct: needed > 0 ? Math.round((confirmed / needed) * 100) : 0 };
  }, [plan]);

  if (!plan) {
    return (
      <div className="wm-er-vPlanner wm-planner-page">
        <div className="wm-planner-card">
          <div style={{ fontWeight: 800 }}>Plan not found</div>
          <button
            type="button"
            className="wm-planner-btnPrimary"
            style={{ marginTop: 12 }}
            onClick={() => nav(ROUTE_PATHS.employerPlannerHome)}
          >
            Back to Planner Home
          </button>
        </div>
      </div>
    );
  }

  function handleCancel() {
    if (
      !window.confirm(
        "Cancel this plan? Unfilled days will close and pending applications will be rejected.",
      )
    ) {
      return;
    }
    const result = cancelActivePlan(planId, "Cancelled by employer");
    if (!result.ok) return;
    nav(ROUTE_PATHS.employerPlannerHome);
  }

  function handleBroadcast() {
    const result = broadcastToPlanCrew(
      planId,
      broadcastTitle.trim() || "Project update",
      broadcastBody.trim(),
    );
    if (!result.ok) {
      setBroadcastMsg(
        result.reason === "no_members"
          ? "Confirm workers first before broadcasting to the project crew."
          : "Broadcast failed. Please try again.",
      );
      return;
    }
    setBroadcastMsg(`Broadcast sent to ${result.delivered} workspace(s).`);
  }

  return (
    <div className="wm-er-vPlanner wm-planner-page">
      <section className="wm-planner-hero">
        <div className="wm-planner-badge">{plan.status}</div>
        <div className="wm-planner-heroTitle" style={{ marginTop: 8 }}>
          {plan.name}
        </div>
        <div className="wm-planner-heroSub">
          {plan.startDate} → {plan.endDate} · {fill.pct}% filled · Crew {crewCount}
        </div>
        {publicEntry ? (
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              fontWeight: 700,
              color: "var(--wm-planner-accent-strong)",
            }}
          >
            Workers see this as 1 Mega Project Card · {publicEntry.openDayCount} open days
          </div>
        ) : plan.status === "active" ? (
          <div style={{ marginTop: 8, fontSize: 11, color: "#dc2626", fontWeight: 700 }}>
            Public index missing — republish or contact support
          </div>
        ) : null}
      </section>

      <div className="wm-planner-card">
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Plan actions</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 8,
          }}
        >
          <button
            type="button"
            className="wm-planner-btnGhost"
            onClick={() => nav(ROUTE_PATHS.employerShiftPosts)}
          >
            My Posts
          </button>
          <button
            type="button"
            className="wm-planner-btnGhost"
            onClick={() => nav(ROUTE_PATHS.employerShiftFavorites)}
          >
            Invite favorites
          </button>
          <button
            type="button"
            className="wm-planner-btnGhost"
            disabled={!firstOpenPostId}
            onClick={() =>
              firstOpenPostId
                ? nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", firstOpenPostId))
                : undefined
            }
          >
            Review applicants
          </button>
          <button
            type="button"
            className="wm-planner-btnGhost"
            onClick={() => nav(ROUTE_PATHS.employerShiftWorkspaces)}
          >
            Workspaces
          </button>
          <button
            type="button"
            className="wm-planner-btnGhost"
            onClick={() => nav(ROUTE_PATHS.employerPlannerFinance.replace(":planId", plan.id))}
          >
            Finance (preview)
          </button>
        </div>
      </div>

      <PlannerDetailBudgetSection estBudget={estBudget} />
      <PlannerDetailDaysSection plan={plan} onNavigate={nav} />
      <PlannerDetailBroadcastSection
        broadcastTitle={broadcastTitle}
        broadcastBody={broadcastBody}
        broadcastMsg={broadcastMsg}
        onBroadcastTitleChange={setBroadcastTitle}
        onBroadcastBodyChange={setBroadcastBody}
        onBroadcast={handleBroadcast}
      />

      <div className="wm-planner-card" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="wm-planner-btnGhost"
          onClick={() => nav(ROUTE_PATHS.employerPlannerFinance.replace(":planId", plan.id))}
        >
          Finance
        </button>
        {plan.status === "active" && (
          <button type="button" className="wm-planner-btnGhost" onClick={handleCancel}>
            Cancel plan
          </button>
        )}
        <button
          type="button"
          className="wm-planner-btnGhost"
          onClick={() => nav(ROUTE_PATHS.employerPlannerHome)}
        >
          Planner Home
        </button>
      </div>
    </div>
  );
}
