// src/features/employer/careerJobs/components/EmployerMyEmployeesCard.tsx
// Session 17: "My employees" card — always visible on Career Jobs home page.

import { useState, useSyncExternalStore } from "react";
import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import type { EmploymentRecord } from "../../../../shared/employment/employmentTypes";
import {
  getStatusLabel,
  getStatusBadge,
  formatDate,
  getNoticeCountdownText,
  getEmployerActions,
} from "../../../../shared/employment/employmentDisplayHelpers";

/* ── Snapshot ── */
let cached: EmploymentRecord[] = [];
function getSnapshot(): EmploymentRecord[] {
  const fresh = employmentStorage.getAll();
  if (JSON.stringify(fresh) !== JSON.stringify(cached)) cached = fresh;
  return cached;
}

/* ── Props ── */
type Props = {
  onOpenPost: (careerPostId: string) => void;
};

/* ── Component ── */
export function EmployerMyEmployeesCard({ onOpenPost }: Props) {
  const records = useSyncExternalStore(employmentStorage.subscribe, getSnapshot, getSnapshot);

/* Show all non-completed records + recently completed (last 30 days) */
  const [thirtyDaysAgo] = useState(() => Date.now() - 30 * 86_400_000);
  const relevant = records.filter(
    (r) => r.status !== "completed" || (r.completedAt && r.completedAt > thirtyDaysAgo),
  );

   const activeCount = records.filter(
    (r) => r.status === "working" || r.status === "notice" || r.status === "resigned",
  ).length;

  return (
    <div className="wm-er-card" style={{ marginTop: 14 }}>
       {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>My employees</div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>Track your hired team</div>
        </div>
        {activeCount > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            color: "#16a34a", background: "rgba(22,163,74,0.08)",
          }}>
            {activeCount} active
          </span>
        )}
      </div>

      {/* Empty state */}
      {relevant.length === 0 && (
        <div style={{
          padding: "16px",
          borderRadius: "var(--wm-radius-14, 14px)",
          border: "1.5px dashed var(--wm-er-border)",
          background: "var(--wm-er-bg)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-muted)" }}>
            No employees yet
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, lineHeight: 1.5, opacity: 0.7 }}>
            When you hire someone through a career post, they will appear here with their employment status.
          </div>
        </div>
      )}

      {/* Employee list */}
      {relevant.length > 0 && (
      <div style={{ display: "grid", gap: 8 }}>
        {relevant.map((rec) => {
          const badge = getStatusBadge(rec);
          const actions = getEmployerActions(rec);
          const noticeText = getNoticeCountdownText(rec);
          const needsAction = actions.canMarkJoined || actions.canConfirmResign || actions.isNoticeExpired;

          return (
            <button
              key={rec.id}
              type="button"
              onClick={() => onOpenPost(rec.careerPostId)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--wm-radius-14, 14px)",
                border: needsAction
                  ? "1.5px solid rgba(180,83,9,0.3)"
                  : "1px solid var(--wm-er-border)",
                background: needsAction ? "rgba(180,83,9,0.03)" : "var(--wm-er-bg)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {/* Name + badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                  {rec.employeeName}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                  color: badge.color, background: badge.bgColor, whiteSpace: "nowrap",
                }}>
                  {getStatusLabel(rec)}
                </span>
              </div>

              {/* Role + company */}
              <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)" }}>
                {rec.jobTitle}{rec.department ? ` — ${rec.department}` : ""}
              </div>

              {/* Joined date */}
              {rec.joinedAt && (
                <div style={{ marginTop: 2, fontSize: 11, color: "var(--wm-er-muted)" }}>
                  Joined: {formatDate(rec.joinedAt)}
                </div>
              )}

              {/* Notice countdown */}
              {noticeText && (
                <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: "#b45309" }}>
                  {noticeText}
                </div>
              )}

              {/* Action hint */}
              {needsAction && (
                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: "#b45309" }}>
                  Action needed →
                </div>
              )}
              {!needsAction && rec.status !== "completed" && (
                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: "var(--wm-er-accent-career)" }}>
                  Tap to manage →
                </div>
              )}
            </button>
          );
        })}
     </div>
      )}
    </div>
  );
}