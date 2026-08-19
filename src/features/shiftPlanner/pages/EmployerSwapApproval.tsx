/**
 * Employer — manager review for peer-accepted swap requests.
 */

import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuthStore } from "../../../shared/store/authStore";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { useShiftPlannerStore } from "../storage/shiftSwap.storage";
import { isShiftLockedForSwap } from "../helpers/shiftPlanner.helpers";

export function EmployerSwapApproval() {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const pending = useShiftPlannerStore((s) =>
    s.swapRequests.filter((r) => r.status === "peer_accepted"),
  );
  const updateSwapStatus = useShiftPlannerStore((s) => s.updateSwapStatus);
  const all = useShiftPlannerStore((s) => s.swapRequests);

  return (
    <div className="wm-dashPage wm-spPage" data-testid="employer-swap-approval">
      <header className="wm-dashHero">
        <button
          type="button"
          className="wm-dashHero__back"
          onClick={() => nav(ROUTE_PATHS.employerShiftPlanner)}
        >
          ← Weekly planner
        </button>
        <div className="wm-dashHero__kicker">Manager approvals</div>
        <h1 className="wm-dashHero__title">Shift swap review</h1>
        <p className="wm-dashHero__sub">
          {[user?.fullName?.trim(), "Approve peer-accepted swaps for this week only"]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      <section className="wm-dashWidget">
        <div className="wm-dashWidget__kicker">Needs approval</div>
        <h2 className="wm-dashWidget__title">Peer-accepted requests</h2>
        {pending.length === 0 ? (
          <div className="wm-spEmpty">No swaps awaiting manager approval.</div>
        ) : (
          <ul className="wm-spShiftList">
            {pending.map((r) => {
              const locked = isShiftLockedForSwap(r.startAt);
              return (
                <li key={r.id} className="wm-spIncoming">
                  <div style={{ flex: 1 }}>
                    <div className="wm-spShiftChip__title">
                      {r.date} · {r.roleTag}
                    </div>
                    <div className="wm-spShiftChip__meta">
                      {r.initiatorId} → {r.peerId} · site {r.siteId}
                      {locked ? " · locked (<24h)" : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="wm-primarybtn"
                    style={{ fontSize: 12, padding: "6px 10px" }}
                    disabled={locked}
                    onClick={() => updateSwapStatus(r.id, "manager_approved")}
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    type="button"
                    className="wm-outlineBtn"
                    style={{ fontSize: 12, padding: "6px 10px" }}
                    onClick={() => updateSwapStatus(r.id, "rejected")}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="wm-dashWidget">
        <div className="wm-dashWidget__kicker">History</div>
        <h2 className="wm-dashWidget__title">Recent swap activity</h2>
        {all.length === 0 ? (
          <div className="wm-spEmpty">No swap history yet.</div>
        ) : (
          <ul className="wm-spShiftList">
            {all.slice(0, 12).map((r) => (
              <li key={r.id} className="wm-spShiftChip" style={{ cursor: "default" }}>
                <div className="wm-spShiftChip__title">
                  {r.date} · {r.status}
                </div>
                <div className="wm-spShiftChip__meta">
                  {r.initiatorId} → {r.peerId}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default EmployerSwapApproval;
