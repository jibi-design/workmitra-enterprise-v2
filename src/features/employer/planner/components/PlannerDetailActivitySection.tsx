/**
 * Job Mitra | PlannerDetailActivitySection.tsx
 * Hybrid A2 Phase-2 P2.1 — plan-scoped audit Activity panel + CSV export.
 */

import { useEffect, useMemo, useState } from "react";
import {
  getPlannerAuditLogForPlan,
  subscribePlannerAuditLog,
  type PlannerAuditEntry,
} from "../storage/plannerAuditLog.storage";
import { downloadPlannerAuditCsv } from "../helpers/plannerAuditCsv.helpers";

function formatWhen(at: number): string {
  try {
    return new Date(at).toLocaleString();
  } catch {
    return String(at);
  }
}

function actionLabel(action: PlannerAuditEntry["action"]): string {
  return action.replace(/_/g, " ");
}

export function PlannerDetailActivitySection({ planId }: { planId: string }) {
  const [open, setOpen] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    return subscribePlannerAuditLog(() => {
      setRevision((n) => n + 1);
    });
  }, []);

  const entries = useMemo(() => {
    void revision;
    return getPlannerAuditLogForPlan(planId);
  }, [planId, revision]);

  const preview = useMemo(() => entries.slice(0, 12), [entries]);

  return (
    <div className="wm-planner-card" data-testid="planner-detail-activity">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          marginBottom: open ? 10 : 0,
        }}
      >
        <button
          type="button"
          className="wm-planner-btnGhost"
          data-testid="planner-detail-activity-toggle"
          onClick={() => setOpen((v) => !v)}
          style={{ fontWeight: 800, fontSize: 13 }}
        >
          Activity {open ? "▾" : "▸"} ({entries.length})
        </button>
        <button
          type="button"
          className="wm-planner-btnGhost"
          data-testid="planner-detail-activity-export"
          disabled={entries.length === 0}
          onClick={() => downloadPlannerAuditCsv(planId, entries)}
        >
          Export CSV
        </button>
      </div>

      {open ? (
        entries.length === 0 ? (
          <p
            data-testid="planner-detail-activity-empty"
            style={{ margin: 0, fontSize: 12, color: "var(--wm-neutral-500)" }}
          >
            No activity yet. Publish your plan to start tracking.
          </p>
        ) : (
          <ul
            data-testid="planner-detail-activity-list"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {preview.map((entry) => (
              <li
                key={entry.id}
                data-testid="planner-detail-activity-row"
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid var(--wm-neutral-100)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: "#0e7490" }}>
                  {actionLabel(entry.action)} · {entry.actor}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{entry.summary}</div>
                <div style={{ fontSize: 11, color: "var(--wm-neutral-500)" }}>
                  {formatWhen(entry.at)}
                </div>
              </li>
            ))}
            {entries.length > preview.length ? (
              <li style={{ paddingTop: 8, fontSize: 11, color: "var(--wm-neutral-500)" }}>
                Showing latest {preview.length} of {entries.length}. Export CSV for full trail.
              </li>
            ) : null}
          </ul>
        )
      ) : null}
    </div>
  );
}
