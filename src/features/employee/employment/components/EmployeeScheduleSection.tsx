// src/features/employee/employment/components/EmployeeScheduleSection.tsx
//
// Employee side — upcoming schedule list (Root Map 7.4.15).
// Shows upcoming roster assignments as a clean list.
// Employee can view but not edit assignments.

import { useEmployeeSchedule } from "../../../employer/hrManagement/helpers/rosterPlannerHooks";
import { getSiteColor } from "../../../employer/hrManagement/helpers/rosterPlannerConstants";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function isToday(dateKey: string): boolean {
  const now = new Date();
  const today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  return dateKey === today;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  hrCandidateId: string;
};

export function EmployeeScheduleSection({ hrCandidateId }: Props) {
  const schedule = useEmployeeSchedule(hrCandidateId);

  // Don't render if no upcoming schedule
  if (schedule.length === 0) return null;

  return (
    <div className="wm-ee-card">
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
          My Schedule
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>
          Your upcoming work schedule
        </div>
      </div>

      {/* Schedule List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {schedule.slice(0, 10).map((a) => {
          const sc = getSiteColor(a.site);
          const today = isToday(a.date);

          return (
            <div
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                border: today
                  ? "2px solid #2563eb"
                  : "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
                background: today ? "#eff6ff" : "#fff",
              }}
            >
              {/* Date Column */}
              <div style={{
                minWidth: 54,
                textAlign: "center",
                padding: "4px 0",
              }}>
                {today && (
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", marginBottom: 1 }}>
                    Today
                  </div>
                )}
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: today ? "#2563eb" : "var(--wm-emp-text, var(--wm-er-text))",
                }}>
                  {formatDate(a.date)}
                </div>
              </div>

              {/* Divider */}
              <div style={{
                width: 3,
                height: 28,
                borderRadius: 2,
                background: sc.color,
                flexShrink: 0,
              }} />

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--wm-emp-text, var(--wm-er-text))",
                }}>
                  {a.site}
                </div>
                <div style={{
                  fontSize: 11,
                  color: "var(--wm-emp-muted, var(--wm-er-muted))",
                  marginTop: 2,
                }}>
                  🕐 {a.shiftStart} – {a.shiftEnd}
                  {a.note && ` · ${a.note}`}
                </div>
              </div>
            </div>
          );
        })}

        {schedule.length > 10 && (
          <div style={{
            textAlign: "center",
            padding: "6px 0",
            fontSize: 11,
            color: "var(--wm-emp-muted, var(--wm-er-muted))",
          }}>
            +{schedule.length - 10} more scheduled
          </div>
        )}
      </div>
    </div>
  );
}