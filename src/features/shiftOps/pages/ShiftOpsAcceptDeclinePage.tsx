/** Job Mitra | ShiftOpsAcceptDeclinePage.tsx | Phase 1 — pending shift handshake */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { fetchPendingAssignment, respondPendingAssignment } from "../services/readyState.service";
import type { PendingShiftAssignmentRow } from "../types";

type Props = {
  /** When embedded (post-approval gate). Route mode uses ?assignmentId= */
  assignmentId?: string;
  onDone?: () => void;
};

export function ShiftOpsAcceptDeclinePage({ assignmentId: assignmentIdProp, onDone }: Props) {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const assignmentId = (assignmentIdProp ?? params.get("assignmentId") ?? "").trim();

  const [row, setRow] = useState<PendingShiftAssignmentRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!assignmentId) {
      queueMicrotask(() => setError("Missing assignmentId"));
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchPendingAssignment(assignmentId);
        if (!cancelled) setRow(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : "Failed to load assignment",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assignmentId]);

  async function respond(accept: boolean) {
    if (!assignmentId) return;
    setBusy(true);
    setError(null);
    try {
      await respondPendingAssignment(assignmentId, accept);
      setBusy(false);
      if (onDone) onDone();
      else nav(ROUTE_PATHS.employeeShiftOpsReady);
    } catch (err) {
      setBusy(false);
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Action failed",
      );
    }
  }

  return (
    <section
      className="wm-ee-card wm-ee-vShift"
      data-testid="shift-ops-accept-decline"
      style={{ maxWidth: 480 }}
    >
      <div className="wm-pageSub">Pending shift</div>
      <h1 className="wm-ee-cardTitle" style={{ fontSize: 18, marginTop: 4 }}>
        {row?.title ?? "Shift assignment"}
      </h1>
      {row ? (
        <p style={{ fontSize: 13, color: "var(--wm-neutral-500)" }}>
          {new Date(row.starts_at).toLocaleString()} → {new Date(row.ends_at).toLocaleString()}
        </p>
      ) : (
        <p style={{ fontSize: 13 }}>{error ? "—" : "Loading…"}</p>
      )}
      {error ? (
        <div
          role="alert"
          style={{
            marginTop: 8,
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
      ) : null}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          type="button"
          className="wm-primarybtn"
          disabled={busy || !row}
          onClick={() => void respond(true)}
        >
          Accept
        </button>
        <button
          type="button"
          className="wm-outlineBtn"
          disabled={busy || !row}
          onClick={() => void respond(false)}
        >
          Decline
        </button>
      </div>
    </section>
  );
}
