// Job Mitra | EmployerPlannerDetailPage.tsx | P1 minimum plan detail

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { fmtPlanDate, demandPlannerStorage } from "../storage/demandPlannerStorage";
import {
  formatPlannerPayPerDay,
  formatPlannerPayTotal,
} from "../helpers/plannerPayDisplay.helpers";
import { plannerPublicIndex } from "../storage/plannerPublicIndex.storage";
import { employerShiftStorage } from "../../shiftJobs/storage/employerShift.storage";
import { broadcastToPlanCrew } from "../services/planBroadcast.service";
import { cancelActivePlan } from "../services/plannerCancel.service";
import { planBroadcastGroupStorage } from "../storage/planBroadcastGroup.storage";

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

  const crewCount = planBroadcastGroupStorage.getByPlanId(planId)?.memberWorkerWmIds.length ?? 0;
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

      <div className="wm-planner-card">
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Budget snapshot</div>
        <div style={{ fontSize: 12, color: "var(--wm-neutral-500)" }}>
          Estimated plan budget:{" "}
          <strong style={{ color: "var(--wm-planner-accent-strong)" }}>
            {formatPlannerPayTotal(estBudget)}
          </strong>
          {" · "}Full ledger in Finance tab (P3)
        </div>
      </div>

      <div className="wm-planner-card">
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Plan days</div>
        {plan.slots.map((slot) => {
          const post = slot.postId
            ? employerShiftStorage.getPosts().find((p) => p.id === slot.postId)
            : null;
          const confirmed = post?.confirmedIds.length ?? 0;
          const vacancies = post?.vacancies ?? slot.workers;
          return (
            <div
              key={slot.date}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid var(--wm-neutral-100)",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtPlanDate(slot.date)}</div>
                <div style={{ fontSize: 11, color: "var(--wm-neutral-500)" }}>
                  {confirmed}/{vacancies} filled · {formatPlannerPayPerDay(slot.payPerDay)}
                </div>
              </div>
              {slot.postId && (
                <button
                  type="button"
                  className="wm-planner-btnGhost"
                  onClick={() =>
                    nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", slot.postId!))
                  }
                >
                  View Post
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="wm-planner-card">
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
          Broadcast to Project Crew
        </div>
        <p style={{ fontSize: 11, color: "var(--wm-neutral-500)", marginBottom: 8 }}>
          BCC model — each worker receives your message privately. Workers cannot see or message
          each other.
        </p>
        <input
          value={broadcastTitle}
          onChange={(e) => setBroadcastTitle(e.target.value)}
          placeholder="Title"
          style={{
            width: "100%",
            marginBottom: 8,
            padding: 10,
            borderRadius: 10,
            border: "1px solid var(--wm-planner-border)",
          }}
        />
        <textarea
          value={broadcastBody}
          onChange={(e) => setBroadcastBody(e.target.value)}
          placeholder="Message to entire project crew"
          rows={3}
          style={{
            width: "100%",
            marginBottom: 8,
            padding: 10,
            borderRadius: 10,
            border: "1px solid var(--wm-planner-border)",
          }}
        />
        <button type="button" className="wm-planner-btnPrimary" onClick={handleBroadcast}>
          Send crew broadcast
        </button>
        {broadcastMsg && <div style={{ marginTop: 8, fontSize: 12 }}>{broadcastMsg}</div>}
      </div>

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
