/**
 * Employee — initiate peer-to-peer shift swap (Zod validated).
 */

import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shuffle } from "lucide-react";
import { useAuthStore } from "../../../shared/store/authStore";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { useShiftPlannerStore } from "../storage/shiftSwap.storage";
import { CreateSwapRequestSchema } from "../validation/shiftSwap.schemas";
import {
  buildDemoWeekShifts,
  buildRollingSevenDays,
  canSwapRoles,
  collectApprovedOverrides,
  hasExceededMonthlyLimit,
  isShiftLockedForSwap,
} from "../helpers/shiftPlanner.helpers";

const DEMO_PEERS = [
  { id: "worker_b", name: "Worker B", roleTag: "floor", siteId: "site_main" },
  { id: "worker_c", name: "Worker C", roleTag: "floor", siteId: "site_main" },
  { id: "worker_d", name: "Worker D", roleTag: "bar", siteId: "site_other" },
] as const;

type DemoPeer = (typeof DEMO_PEERS)[number];
/** Demo peers are DEV-only — production shows empty until live roster SoT lands. */
const ELIGIBLE_PEERS: readonly DemoPeer[] = import.meta.env.DEV ? DEMO_PEERS : [];

export function EmployeeSwapRequest() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const myId = user?.id ?? "worker_a";
  const swapRequests = useShiftPlannerStore((s) => s.swapRequests);
  const addSwapRequest = useShiftPlannerStore((s) => s.addSwapRequest);
  const updateSwapStatus = useShiftPlannerStore((s) => s.updateSwapStatus);
  const pendingForMe = useMemo(
    () => swapRequests.filter((r) => r.peerId === myId && r.status === "requested"),
    [swapRequests, myId],
  );

  const shifts = useMemo(() => {
    if (!import.meta.env.DEV) return [];
    const days = buildRollingSevenDays();
    return buildDemoWeekShifts(days, collectApprovedOverrides(swapRequests));
  }, [swapRequests]);

  const preselect = params.get("instanceId");
  const [instanceId, setInstanceId] = useState(preselect ?? shifts[0]?.instanceId ?? "");
  const [peerId, setPeerId] = useState<string>(ELIGIBLE_PEERS[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const selected = shifts.find((s) => s.instanceId === instanceId) ?? shifts[0];
  const peer = ELIGIBLE_PEERS.find((p) => p.id === peerId) ?? ELIGIBLE_PEERS[0];

  function submit() {
    setError(null);
    setOkMsg(null);
    if (!selected || !user?.id) {
      setError("Sign in and select a shift instance.");
      return;
    }
    if (!peer) {
      setError("No eligible peers available yet.");
      return;
    }
    if (isShiftLockedForSwap(selected.startAt)) {
      setError("This shift is locked for swaps (under 24 hours).");
      return;
    }
    if (
      !canSwapRoles(selected.roleTag, peer.roleTag, selected.siteId, peer.siteId)
    ) {
      setError("Peer must share the same site and a compatible role tag.");
      return;
    }
    if (hasExceededMonthlyLimit(user.id, swapRequests, selected.date)) {
      setError("Monthly swap limit (3) reached for this month.");
      return;
    }

    const payload = {
      weekId: selected.weekId,
      shiftInstanceId: selected.instanceId,
      initiatorId: user.id,
      peerId: peer.id,
      siteId: selected.siteId,
      roleTag: selected.roleTag,
      date: selected.date,
      startAt: selected.startAt,
    };

    const parsed = CreateSwapRequestSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }

    addSwapRequest({ ...parsed.data, peerRoleTag: peer.roleTag });
    setOkMsg("Swap requested — waiting for peer acceptance.");
  }

  return (
    <div className="wm-dashPage wm-spPage" data-testid="employee-swap-request">
      <header className="wm-dashHero">
        <button
          type="button"
          className="wm-dashHero__back"
          onClick={() => nav(ROUTE_PATHS.employeeShiftPlanner)}
        >
          ← Weekly planner
        </button>
        <div className="wm-dashHero__kicker">
          <Shuffle size={12} aria-hidden="true" /> Peer swap
        </div>
        <h1 className="wm-dashHero__title">Request a shift swap</h1>
        <p className="wm-dashWidget__sub">
          One-time instance swap. Baseline schedule stays unchanged. Manager approves after peer
          accepts.
        </p>
      </header>

      <section className="wm-dashWidget">
        <label className="wm-label" htmlFor="sp-instance">
          Your shift instance
        </label>
        <select
          id="sp-instance"
          className="wm-input"
          value={selected?.instanceId ?? ""}
          onChange={(e) => setInstanceId(e.target.value)}
        >
          {shifts.map((s) => (
            <option key={s.instanceId} value={s.instanceId}>
              {s.date} · {s.roleTag} · {s.assigneeName}
              {isShiftLockedForSwap(s.startAt) ? " (locked)" : ""}
            </option>
          ))}
        </select>

        <label className="wm-label" htmlFor="sp-peer" style={{ marginTop: 12 }}>
          Eligible peer
        </label>
        <select
          id="sp-peer"
          className="wm-input"
          value={peerId}
          onChange={(e) => setPeerId(e.target.value)}
        >
          {ELIGIBLE_PEERS.length === 0 ? (
            <option value="">No eligible peers yet</option>
          ) : (
            ELIGIBLE_PEERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.roleTag} · {p.siteId}
              </option>
            ))
          )}
        </select>

        {error ? <div className="wm-spError">{error}</div> : null}
        {okMsg ? <div className="wm-spOk">{okMsg}</div> : null}

        <button type="button" className="wm-primarybtn" style={{ marginTop: 12 }} onClick={submit}>
          Submit swap request
        </button>
      </section>

      <section className="wm-dashWidget">
        <div className="wm-dashWidget__kicker">Incoming for you</div>
        <h2 className="wm-dashWidget__title">Peer requests</h2>
        {pendingForMe.length === 0 ? (
          <div className="wm-spEmpty">No pending requests.</div>
        ) : (
          <ul className="wm-spShiftList">
            {pendingForMe.map((r) => (
              <li key={r.id} className="wm-spIncoming">
                <div>
                  <div className="wm-spShiftChip__title">{r.date}</div>
                  <div className="wm-spShiftChip__meta">
                    From {r.initiatorId} · {r.roleTag}
                  </div>
                </div>
                <button
                  type="button"
                  className="wm-primarybtn"
                  style={{ fontSize: 12, padding: "6px 10px" }}
                  onClick={() => updateSwapStatus(r.id, "peer_accepted")}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="wm-outlineBtn"
                  style={{ fontSize: 12, padding: "6px 10px" }}
                  onClick={() => updateSwapStatus(r.id, "rejected")}
                >
                  Decline
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default EmployeeSwapRequest;
