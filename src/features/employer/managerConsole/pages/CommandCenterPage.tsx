// src/features/employer/managerConsole/pages/CommandCenterPage.tsx
//
// Command Center — full page, 3 sections.
// Section 1: Today's Overview (attendance summary)
// Section 2: Needs Your Attention (actionable alerts)
// Section 3: Today's Assignments (roster by site)
// Color: Ocean Blue #0369a1 (--wm-er-accent-console)
// Style: Inner/working page — clean header, focused content.

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { Activity } from "lucide-react";
import { CommandCenterCard } from "../../hrManagement/components/CommandCenterCard";
import { hrManagementStorage } from "../../hrManagement/storage/hrManagement.storage";
import { attendanceLogStorage } from "../../hrManagement/storage/attendanceLog.storage";
import { leaveManagementStorage } from "../../hrManagement/storage/leaveManagement.storage";
import { taskAssignmentStorage } from "../../hrManagement/storage/taskAssignment.storage";
import { rosterPlannerStorage } from "../../hrManagement/storage/rosterPlanner.storage";
import { incidentReportStorage } from "../../hrManagement/storage/incidentReport.storage";
import type { CSSProperties } from "react";

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const ICON_BOX: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "var(--wm-er-accent-console-light)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--wm-er-accent-console)",
  flexShrink: 0,
};

const SECTION_CARD: CSSProperties = {
  padding: 16,
  background: "#fff",
  borderRadius: 12,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
};

const SECTION_TITLE: CSSProperties = {
  fontWeight: 900,
  fontSize: 14,
  color: "var(--wm-er-text)",
  marginBottom: 12,
};

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
type AlertItem = {
  id: string;
  label: string;
  count: number;
  color: string;
  bg: string;
  route: string;
};

type SiteGroup = {
  site: string;
  staff: { name: string; shift: string }[];
};

/* ------------------------------------------------ */
/* Section 2: Needs Your Attention                  */
/* ------------------------------------------------ */
function NeedsAttentionSection({
  alerts,
  onNavigate,
}: {
  alerts: AlertItem[];
  onNavigate: (route: string) => void;
}) {
  const activeAlerts = alerts.filter((a) => a.count > 0);

  return (
    <div style={SECTION_CARD}>
      <div style={SECTION_TITLE}>Needs Your Attention</div>
      {activeAlerts.length === 0 ? (
        <div
          style={{
            padding: "14px 0",
            textAlign: "center",
            fontSize: 13,
            color: "#15803d",
            fontWeight: 700,
          }}
        >
          ✓ All clear — nothing needs your attention
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeAlerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => onNavigate(alert.route)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${alert.bg}`,
                background: alert.bg,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                {alert.label}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 900,
                    background: alert.color,
                    color: "#fff",
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {alert.count}
                </span>
                <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>→</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Section 3: Today's Assignments                   */
/* ------------------------------------------------ */
function TodayAssignmentsSection({ groups }: { groups: SiteGroup[] }) {
  return (
    <div style={SECTION_CARD}>
      <div style={SECTION_TITLE}>Today's Site Assignments</div>
      {groups.length === 0 ? (
        <div
          style={{
            padding: "14px 0",
            textAlign: "center",
            fontSize: 13,
            color: "var(--wm-er-muted)",
          }}
        >
          No site assignments for today
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {groups.map((g) => (
            <div
              key={g.site}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--wm-er-accent-console-border)",
                background: "var(--wm-er-accent-console-light)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13, color: "var(--wm-er-accent-console)" }}>
                  📍 {g.site}
                </div>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    background: "var(--wm-er-accent-console)",
                    color: "#fff",
                  }}
                >
                  {g.staff.length} staff
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {g.staff.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      borderTop: i > 0 ? "1px solid rgba(3,105,161,0.1)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)" }}>
                      {s.name}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{s.shift}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Main Component                                   */
/* ------------------------------------------------ */
export function CommandCenterPage() {
  const nav = useNavigate();
  const [, setTick] = useState(0);

  // Capture impure Date values once at mount — React Compiler safe
  const [snapshot] = useState(() => {
    const d = new Date();
    return {
      now: d.getTime(),
      todayKey: attendanceLogStorage.toDateKey(d),
      todayIso:
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0"),
    };
  });

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const u1 = hrManagementStorage.subscribe(refresh);
    const u2 = attendanceLogStorage.subscribe(refresh);
    const u3 = leaveManagementStorage.subscribe(refresh);
    const u4 = taskAssignmentStorage.subscribe(refresh);
    const u5 = rosterPlannerStorage.subscribe(refresh);
    const u6 = incidentReportStorage.subscribe(refresh);
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
    };
  }, [refresh]);

  /* --- Section 2: Attention alerts --- */
  const alerts = useMemo<AlertItem[]>(() => {
    const active = hrManagementStorage.getAll().filter((r) => r.status === "active");

    // 1. Pending leave requests
    const pendingLeave = leaveManagementStorage
      .getAllRequests()
      .filter((r) => r.status === "pending").length;

    // 2. Overdue tasks (due date passed, not completed)
    let overdueTasks = 0;
    for (const emp of active) {
      const tasks = taskAssignmentStorage.getActiveTasks(emp.id);
      for (const t of tasks) {
        if (t.dueDate < snapshot.now && t.status !== "completed") {
          overdueTasks++;
        }
      }
    }

    // 3. Unmarked attendance today
    let unmarked = 0;
    for (const emp of active) {
      const entry = attendanceLogStorage.getDayEntry(emp.id, snapshot.todayKey);
      if (!entry) unmarked++;
    }

    // 4. Open incidents
    const openIncidents = incidentReportStorage.getPendingCount();

    return [
      {
        id: "leave",
        label: "Pending leave requests",
        count: pendingLeave,
        color: "#d97706",
        bg: "rgba(245,158,11,0.06)",
        route: ROUTE_PATHS.employerHRManagement,
      },
      {
        id: "overdue",
        label: "Overdue tasks",
        count: overdueTasks,
        color: "#dc2626",
        bg: "rgba(220,38,38,0.06)",
        route: ROUTE_PATHS.employerConsoleTaskAssign,
      },
      {
        id: "unmarked",
        label: "Attendance not marked",
        count: unmarked,
        color: "#6b7280",
        bg: "rgba(107,114,128,0.06)",
        route: ROUTE_PATHS.employerConsoleAttendance,
      },
      {
        id: "incidents",
        label: "Open incident reports",
        count: openIncidents,
        color: "#dc2626",
        bg: "rgba(220,38,38,0.06)",
        route: ROUTE_PATHS.employerConsoleIncidents,
      },
    ];
  }, [snapshot]);

  /* --- Section 3: Today's assignments grouped by site --- */
  const siteGroups = useMemo<SiteGroup[]>(() => {
    const assignments = rosterPlannerStorage.getForDate(snapshot.todayIso);
    if (assignments.length === 0) return [];

    const map = new Map<string, { name: string; shift: string }[]>();
    for (const a of assignments) {
      const site = a.site || "Unassigned";
      if (!map.has(site)) map.set(site, []);
      map.get(site)!.push({
        name: a.employeeName,
        shift: a.shiftStart && a.shiftEnd ? `${a.shiftStart} – ${a.shiftEnd}` : "Full day",
      });
    }

    return [...map.entries()]
      .map(([site, staff]) => ({ site, staff }))
      .sort((a, b) => b.staff.length - a.staff.length);
  }, [snapshot]);

  return (
    <div>
      

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={ICON_BOX}>
          <Activity size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 17, color: "var(--wm-er-text)" }}>
            Command Center
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
            Today's summary, alerts, and site assignments
          </div>
        </div>
      </div>

      {/* Section 1: Today's Overview */}
      <CommandCenterCard />

      {/* Section 2: Needs Your Attention */}
      <div style={{ marginTop: 14 }}>
        <NeedsAttentionSection alerts={alerts} onNavigate={(r) => nav(r)} />
      </div>

      {/* Section 3: Today's Assignments */}
      <div style={{ marginTop: 14 }}>
        <TodayAssignmentsSection groups={siteGroups} />
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}