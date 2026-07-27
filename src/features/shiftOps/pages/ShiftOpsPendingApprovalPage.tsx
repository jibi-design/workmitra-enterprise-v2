/** Job Mitra | ShiftOpsPendingApprovalPage.tsx | Phase 1 — awaiting manager + 15s poll */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { checkMembershipStatus } from "../services/approval.service";

type Props = {
  membershipId?: string | null;
};

export function ShiftOpsPendingApprovalPage({ membershipId }: Props) {
  const nav = useNavigate();
  const [checking, setChecking] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);

  useEffect(() => {
    if (!membershipId || rejected) return;

    let cancelled = false;

    async function poll() {
      if (cancelled || !membershipId) return;
      setChecking(true);
      try {
        const status = await checkMembershipStatus(membershipId);
        if (cancelled) return;
        if (status === "ready_for_assignment") {
          nav(ROUTE_PATHS.employeeShiftOpsReady, { replace: true });
          return;
        }
        if (status === "rejected" || status === "revoked") {
          setRejected(true);
        }
        setPollError(null);
      } catch (err) {
        if (!cancelled) {
          /* TIER: ADVISORY */ console.warn("[PendingApproval] status poll failed", err);
          setPollError("Could not refresh approval status. Retrying…");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void poll();
    const timer = window.setInterval(() => void poll(), 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [membershipId, nav, rejected]);

  if (rejected) {
    return (
      <section
        className="wm-ee-card wm-ee-vShift"
        data-testid="shift-ops-pending-approval-rejected"
        style={{ maxWidth: 480 }}
      >
        <div className="wm-pageSub">Manager approval</div>
        <h1 className="wm-ee-cardTitle" style={{ fontSize: 18, marginTop: 4 }}>
          Access denied
        </h1>
        <p style={{ fontSize: 13, color: "var(--wm-neutral-500)", lineHeight: 1.45 }}>
          Your site manager rejected this group join request. Contact your manager if you believe
          this is a mistake.
        </p>
      </section>
    );
  }

  return (
    <section
      className="wm-ee-card wm-ee-vShift"
      data-testid="shift-ops-pending-approval"
      style={{ maxWidth: 480 }}
    >
      <div className="wm-pageSub">Manager approval</div>
      <h1 className="wm-ee-cardTitle" style={{ fontSize: 18, marginTop: 4 }}>
        Pending manager approval
      </h1>
      <p style={{ fontSize: 13, color: "var(--wm-neutral-500)", lineHeight: 1.45 }}>
        Your work channels are verified. You do not have project or shift access until a site
        manager approves you.
      </p>
      <p style={{ fontSize: 13, color: "var(--wm-neutral-500)", lineHeight: 1.45, marginTop: 8 }}>
        Group joined. Apply to individual shifts to be assigned to the crew.
      </p>
      <div
        data-testid="shift-ops-pending-approval-poll"
        style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}
      >
        <span
          className="wm-call-pulseDot"
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#16a34a",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 12, color: "var(--wm-neutral-500)" }}>
          {checking ? "Checking approval status…" : "Checking every 15 seconds…"}
        </span>
      </div>
      {pollError ? (
        <div
          role="status"
          style={{
            marginTop: 8,
            padding: "6px 12px",
            borderRadius: 10,
            background: "rgba(202,138,4,0.08)",
            border: "1px solid rgba(202,138,4,0.22)",
            fontSize: 12,
            color: "#a16207",
            fontWeight: 600,
          }}
        >
          {pollError}
        </div>
      ) : null}
    </section>
  );
}
