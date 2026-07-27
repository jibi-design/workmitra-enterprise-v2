/** Job Mitra | ShiftOpsPostApprovalGate.tsx | Phase 1 — zero-dead-end router shell */

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePostApprovalRouting } from "../hooks/usePostApprovalRouting";
import { ShiftOpsAcceptDeclinePage } from "./ShiftOpsAcceptDeclinePage";
import { ShiftOpsPendingApprovalPage } from "./ShiftOpsPendingApprovalPage";
import { ShiftOpsReadyStatePage } from "./ShiftOpsReadyStatePage";

type Props = {
  siteId?: string | null;
};

export function ShiftOpsPostApprovalGate({ siteId: siteIdProp }: Props) {
  const [params] = useSearchParams();
  const siteId = siteIdProp ?? params.get("siteId");
  const { result, busy, error, awaitingApproval, authOffline, resolve } =
    usePostApprovalRouting(siteId);

  useEffect(() => {
    void resolve();
  }, [resolve]);

  if (busy && !result && !authOffline) {
    return (
      <section className="wm-ee-card wm-ee-vShift" style={{ maxWidth: 480 }}>
        <p style={{ fontSize: 13 }}>Checking your ready state…</p>
      </section>
    );
  }

  if (awaitingApproval) {
    return <ShiftOpsPendingApprovalPage />;
  }

  // Auth / bridge failures soft-open Ready UI — no orange/red worker-facing banners.
  if (error && !authOffline) {
    const isAuthNoise = /anonymous|sign-in|signin|auth bridge|not authenticated|jwt/i.test(error);
    if (!isAuthNoise) {
      return (
        <section className="wm-ee-card wm-ee-vShift" style={{ maxWidth: 480 }}>
          <div
            role="alert"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "rgba(185,28,28,0.06)",
              border: "1px solid rgba(185,28,28,0.18)",
              color: "#b91c1c",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
          <button
            type="button"
            className="wm-outlineBtn"
            style={{ marginTop: 10 }}
            onClick={() => void resolve()}
          >
            Retry
          </button>
        </section>
      );
    }
  }

  if (result?.route === "accept_decline" && result.pending_assignment_id) {
    return (
      <ShiftOpsAcceptDeclinePage
        assignmentId={result.pending_assignment_id}
        onDone={() => void resolve()}
      />
    );
  }

  return (
    <div className="wm-ee-vShift wm-stackGrid" data-testid="shift-ops-gate-shell">
      <ShiftOpsReadyStatePage />
    </div>
  );
}
