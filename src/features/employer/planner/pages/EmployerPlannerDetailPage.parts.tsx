import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { fmtPlanDate, type DemandPlan } from "../storage/demandPlannerStorage";
import {
  formatPlannerPayPerDay,
  formatPlannerPayTotal,
} from "../helpers/plannerPayDisplay.helpers";
import { employerShiftStorage } from "../../../shared/planner/ports/plannerLegacyShiftBridge";

type PlannerDetailSectionsProps = {
  plan: DemandPlan;
  estBudget: number;
  broadcastTitle: string;
  broadcastBody: string;
  broadcastMsg: string;
  onBroadcastTitleChange: (value: string) => void;
  onBroadcastBodyChange: (value: string) => void;
  onBroadcast: () => void;
  onNavigate: (path: string) => void;
};

export function PlannerDetailBudgetSection({ estBudget }: { estBudget: number }) {
  return (
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
  );
}

export function PlannerDetailDaysSection({
  plan,
  onNavigate,
}: {
  plan: DemandPlan;
  onNavigate: (path: string) => void;
}) {
  return (
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
                  onNavigate(
                    ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", slot.postId!),
                  )
                }
              >
                View Post
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PlannerDetailBroadcastSection({
  broadcastTitle,
  broadcastBody,
  broadcastMsg,
  onBroadcastTitleChange,
  onBroadcastBodyChange,
  onBroadcast,
}: Omit<PlannerDetailSectionsProps, "plan" | "estBudget" | "onNavigate">) {
  return (
    <div className="wm-planner-card">
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
        Broadcast to Project Crew
      </div>
      <p style={{ fontSize: 11, color: "var(--wm-neutral-500)", marginBottom: 8 }}>
        BCC model — each worker receives your message privately. Workers cannot see or message each
        other.
      </p>
      <input
        value={broadcastTitle}
        onChange={(e) => onBroadcastTitleChange(e.target.value)}
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
        onChange={(e) => onBroadcastBodyChange(e.target.value)}
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
      <button type="button" className="wm-planner-btnPrimary" onClick={onBroadcast}>
        Send crew broadcast
      </button>
      {broadcastMsg && <div style={{ marginTop: 8, fontSize: 12 }}>{broadcastMsg}</div>}
    </div>
  );
}
