/** Job Mitra | ShiftOpsManagerApprovalsPage.tsx | Manager queue + group access + live roster */

import { useCallback, useEffect, useState } from "react";
import { ShiftOpsActiveRosterCard } from "../components/ShiftOpsActiveRosterCard";
import { ShiftOpsGroupAccessCard } from "../components/ShiftOpsGroupAccessCard";
import { ShiftOpsManagerExecutiveHeader } from "../components/ShiftOpsManagerExecutiveHeader";
import {
  isShiftOpsAuthConfigNoise,
  shiftOpsAuthNoiseCopy,
} from "../helpers/shiftOpsAuthNoise.helpers";
import {
  listPendingMembershipsForManager,
  managerDecideMembership,
} from "../services/approval.service";
import type { SiteMembershipRow } from "../types";

export function ShiftOpsManagerApprovalsPage() {
  const [rows, setRows] = useState<SiteMembershipRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authNoise, setAuthNoise] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await listPendingMembershipsForManager();
    setRows(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await refresh();
      } catch (err) {
        if (cancelled) return;
        const raw =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Failed to load queue";
        if (isShiftOpsAuthConfigNoise(raw)) {
          setAuthNoise(true);
          setError(null);
          return;
        }
        setError(raw);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  async function decide(id: string, approve: boolean) {
    setBusyId(id);
    setError(null);
    try {
      await managerDecideMembership(id, approve);
      await refresh();
      setBusyId(null);
    } catch (err) {
      setBusyId(null);
      const raw =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Decision failed";
      if (isShiftOpsAuthConfigNoise(raw)) {
        setAuthNoise(true);
      } else {
        setError(raw);
      }
    }
  }

  return (
    <div
      className="wm-er-vShift wm-shiftHomePage wm-stackGrid"
      style={{ gap: "var(--wm-stack-gap)" }}
      data-testid="shift-ops-manager-page"
    >
      <ShiftOpsManagerExecutiveHeader pendingApprovalsCount={rows.length} />

      <ShiftOpsGroupAccessCard />
      <ShiftOpsActiveRosterCard />

      <section className="wm-shiftOpsSectionCard" data-testid="shift-ops-manager-approvals">
        <header className="wm-shiftOpsSectionHead">
          <div>
            <div className="wm-shiftOpsSectionEyebrow">Site manager</div>
            <h2 className="wm-shiftOpsSectionTitle">Pending worker approvals</h2>
          </div>
          {rows.length > 0 ? (
            <span className="wm-shiftOpsManagerStatBadge wm-shiftOpsManagerStatBadge--action">
              {rows.length} waiting
            </span>
          ) : null}
        </header>

        <p className="wm-shiftOpsSectionCopy">
          Approve or reject incoming workers requesting group access.
        </p>

        {authNoise ? <p className="wm-shiftOpsAuthNote">{shiftOpsAuthNoiseCopy()}</p> : null}

        {error ? (
          <div role="alert" className="wm-shiftOpsErrorNote">
            {error}
          </div>
        ) : null}

        {rows.length === 0 ? (
          <div className="wm-shiftOpsEmptyState">
            <div className="wm-shiftOpsEmptyTitle">No pending requests</div>
            <p className="wm-shiftOpsEmptySubtitle">New join requests will appear here.</p>
          </div>
        ) : (
          <ul className="wm-shiftOpsApprovalList">
            {rows.map((row) => (
              <li
                key={row.id}
                className="wm-shiftOpsApprovalItem"
                data-testid={`shift-ops-membership-${row.id}`}
              >
                <div className="wm-shiftOpsApprovalMeta">
                  <div className="wm-shiftOpsWorkerName">
                    Worker {row.worker_user_id.slice(0, 8)}…
                  </div>
                  <div className="wm-shiftOpsWorkerZone">Group {row.site_id.slice(0, 8)}…</div>
                </div>
                <div className="wm-shiftOpsActionPillRow">
                  <button
                    type="button"
                    className="wm-shiftOpsActionPill wm-shiftOpsActionPill--primary"
                    disabled={busyId === row.id}
                    onClick={() => void decide(row.id, true)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="wm-shiftOpsActionPill wm-shiftOpsActionPill--danger"
                    disabled={busyId === row.id}
                    onClick={() => void decide(row.id, false)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
