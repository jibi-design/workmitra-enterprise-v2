// src/features/employee/careerJobs/components/EmployeeMyCurrentJobCard.tsx
// Session 17: "My current job" card — always visible on Career Applications page.

import { useSyncExternalStore } from "react";
import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import type { EmploymentRecord } from "../../../../shared/employment/employmentTypes";
import {
  getStatusLabel,
  getStatusBadge,
  formatDate,
  getNoticeCountdownText,
} from "../../../../shared/employment/employmentDisplayHelpers";

/* ── Snapshot ── */
let cached: EmploymentRecord[] = [];
function getSnapshot(): EmploymentRecord[] {
  const fresh = employmentStorage.getAll();
  if (JSON.stringify(fresh) !== JSON.stringify(cached)) cached = fresh;
  return cached;
}

/* ── Component ── */
export function EmployeeMyCurrentJobCard({ onOpen }: { onOpen: (careerPostId: string) => void }) {
  const records = useSyncExternalStore(employmentStorage.subscribe, getSnapshot, getSnapshot);
  const activeRecords = records.filter(
    (r) => r.status === "selected" || r.status === "working" || r.status === "notice" || r.status === "resigned",
  );

 return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text, #1e293b)", marginBottom: 8 }}>
        My current job
      </div>

      {activeRecords.length === 0 ? (
        <div style={{
          padding: "16px",
          borderRadius: "var(--wm-radius-14, 14px)",
          border: "1.5px dashed var(--wm-border, #e2e8f0)",
          background: "var(--wm-bg-card, #fff)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-text-muted, #64748b)" }}>
            No active employment
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, lineHeight: 1.5 }}>
            When you get hired through a career job, your employment status will appear here.
          </div>
        </div>
      ) : (
      <div style={{ display: "grid", gap: 8 }}>
        {activeRecords.map((rec) => {
          const badge = getStatusBadge(rec);
          const noticeText = getNoticeCountdownText(rec);

          return (
            <button
              key={rec.id}
              type="button"
              onClick={() => onOpen(rec.careerPostId)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "var(--wm-radius-14, 14px)",
                border: `1.5px solid ${badge.color}22`,
                background: "var(--wm-bg-card, #fff)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {/* Top row: title + badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-accent-career, #1d4ed8)" }}>
                  {rec.jobTitle}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  color: badge.color, background: badge.bgColor, whiteSpace: "nowrap",
                }}>
                  {getStatusLabel(rec)}
                </span>
              </div>

              {/* Company + dates */}
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-text-muted, #64748b)" }}>
                {rec.companyName}{rec.department ? ` — ${rec.department}` : ""}
              </div>
              {rec.joinedAt && (
                <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-text-muted, #64748b)" }}>
                  Joined: {formatDate(rec.joinedAt)}
                </div>
              )}

              {/* Notice countdown */}
              {noticeText && (
                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: "#b45309" }}>
                  {noticeText}
                </div>
              )}

              {/* Tap hint */}
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: "var(--wm-er-accent-career, #1d4ed8)" }}>
                Tap to manage →
              </div>
            </button>
          );
        })}
     </div>
      )}
    </div>
  );
}