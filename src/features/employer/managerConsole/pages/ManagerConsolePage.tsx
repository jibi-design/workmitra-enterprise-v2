// src/features/employer/managerConsole/pages/ManagerConsolePage.tsx
//
// Manager Console — daily operations hub.
// Domain: Ocean Blue #0369a1 (--wm-er-accent-console)
// Style: Dashboard/menu page — attractive, alive, tappable cards.

import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  LayoutDashboard,
  Activity,
  CalendarCheck,
  ClipboardList,
  Calendar,
  UserCheck,
  Bell,
  AlertTriangle,
  Users,
} from "lucide-react";
import { getConsoleStats } from "../helpers/managerConsoleData";

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const ICON_BOX: CSSProperties = {
  width: 42, height: 42, borderRadius: 12,
  background: "var(--wm-er-accent-console-light)",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "var(--wm-er-accent-console)", flexShrink: 0,
};

const ACTION_BTN: CSSProperties = {
  padding: "7px 14px", borderRadius: 8, border: "none",
  background: "var(--wm-er-accent-console)", color: "#fff",
  fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
};

/* ------------------------------------------------ */
/* Data Pill                                        */
/* ------------------------------------------------ */
function DataPill({ value, label, warn }: { value: number; label: string; warn?: boolean }) {
  const isZero = value === 0;
  const bg    = isZero ? "#f3f4f6" : warn ? "rgba(220,38,38,0.08)" : "rgba(3,105,161,0.08)";
  const color = isZero ? "#9ca3af" : warn ? "#dc2626" : "#0369a1";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 6,
      fontSize: 11, fontWeight: 600,
      background: bg, color,
    }}>
      {value} {label}
    </span>
  );
}

/* ------------------------------------------------ */
/* Console Card                                     */
/* ------------------------------------------------ */
type CardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  dataLine: React.ReactNode;
  onTap: () => void;
};

function ConsoleCard({ icon, title, subtitle, actionLabel, dataLine, onTap }: CardProps) {
  return (
    <section
      role="button" tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => { if (e.key === "Enter") onTap(); }}
      style={{
        width: "100%", padding: "14px 16px", borderRadius: 14,
        border: "1px solid var(--wm-er-border, #e6e9ef)",
        borderLeft: "4px solid var(--wm-er-accent-console)",
        background: "var(--wm-er-card, #fff)",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
      }}
    >
      <div style={ICON_BOX}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-er-text)" }}>{title}</div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onTap(); }} style={ACTION_BTN}>
            {actionLabel}
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>{subtitle}</div>
        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
          {dataLine}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ManagerConsolePage() {
  const nav = useNavigate();
  const s   = useMemo(() => getConsoleStats(), []);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={ICON_BOX}><LayoutDashboard size={22} /></div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "var(--wm-er-text)" }}>Manager Console</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
            Daily operations &mdash; attendance, tasks, and roster
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14, marginTop: 10 }}>
        <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--wm-er-accent-console-light)", color: "var(--wm-er-accent-console)", border: "1px solid var(--wm-er-accent-console-border)" }}>
          {s.totalActive} staff
        </span>
        <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: s.presentToday > 0 ? "rgba(22,163,74,0.08)" : "#f3f4f6", color: s.presentToday > 0 ? "#16a34a" : "#9ca3af" }}>
          {s.presentToday} present
        </span>
        <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: s.alertCount > 0 ? "rgba(220,38,38,0.08)" : "#f3f4f6", color: s.alertCount > 0 ? "#dc2626" : "#9ca3af" }}>
          {s.alertCount} alert{s.alertCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Empty staff banner — separate compact card ── */}
      {s.totalStaff === 0 && (
        <div style={{
          marginBottom: 16, padding: "12px 16px", borderRadius: 12,
          background: "rgba(3,105,161,0.04)", border: "1px solid rgba(3,105,161,0.18)",
          textAlign: "center",
        }}>
          <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}>
            <Users size={24} color="var(--wm-er-accent-console, #0369a1)" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-accent-console, #0369a1)", marginBottom: 2 }}>
            No staff yet
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 10 }}>
            Add your team to get started
          </div>
          <button type="button" onClick={() => nav(ROUTE_PATHS.employerMyStaff)}
            style={{ ...ACTION_BTN, fontSize: 12, padding: "6px 18px" }}>
            + Add Staff
          </button>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ConsoleCard
          icon={<Activity size={20} />}
          title="Command Center"
          subtitle="Today's summary, alerts, and site assignments"
          actionLabel="Open"
          dataLine={
            <>
              <DataPill value={s.presentToday} label="Present" />
              <DataPill value={s.absentToday} label="Absent" warn={s.absentToday > 0} />
              <DataPill value={s.alertCount} label="Alerts" warn={s.alertCount > 0} />
            </>
          }
          onTap={() => nav(ROUTE_PATHS.employerConsole + "/command-center")}
        />
        <ConsoleCard
          icon={<CalendarCheck size={20} />}
          title="Daily Attendance"
          subtitle="Bulk one-tap marking with department grouping"
          actionLabel="Mark"
          dataLine={<DataPill value={s.markedToday} label={`/${s.totalStaff} marked`} />}
          onTap={() => nav(ROUTE_PATHS.employerConsoleAttendance)}
        />
        <ConsoleCard
          icon={<ClipboardList size={20} />}
          title="Task Assignment"
          subtitle="Assign tasks to individuals or bulk assign to teams"
          actionLabel="Assign"
          dataLine={
            <>
              <DataPill value={s.activeTasks} label="active" />
              <DataPill value={s.overdueTasks} label="overdue" warn={s.overdueTasks > 0} />
            </>
          }
          onTap={() => nav(ROUTE_PATHS.employerConsoleTaskAssign)}
        />
        <ConsoleCard
          icon={<Calendar size={20} />}
          title="Team Calendar"
          subtitle="Weekly and monthly roster with site-first assignment"
          actionLabel="Plan"
          dataLine={<DataPill value={s.tomorrowAssignments} label="tomorrow" />}
          onTap={() => nav(ROUTE_PATHS.employerConsoleRoster)}
        />
        <ConsoleCard
          icon={<UserCheck size={20} />}
          title="Staff Availability"
          subtitle="Request availability — simple or batch mode"
          actionLabel="Request"
          dataLine={<DataPill value={s.pendingRequests} label="pending" warn={s.pendingRequests > 0} />}
          onTap={() => nav(ROUTE_PATHS.employerConsoleAvailability)}
        />
        <ConsoleCard
          icon={<Bell size={20} />}
          title="Company Notices"
          subtitle="Send notices to all, departments, or specific staff"
          actionLabel="Send"
          dataLine={<DataPill value={s.sentThisWeek} label="this week" />}
          onTap={() => nav(ROUTE_PATHS.employerConsoleNotices)}
        />
        <ConsoleCard
          icon={<AlertTriangle size={20} />}
          title="Incident Reports"
          subtitle="Employee submitted issues and status tracking"
          actionLabel="View"
          dataLine={<DataPill value={s.openIncidents} label="open" warn={s.openIncidents > 0} />}
          onTap={() => nav(ROUTE_PATHS.employerConsole + "/incidents")}
        />
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}