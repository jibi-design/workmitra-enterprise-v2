// src/features/employer/hrManagement/components/NeedsAttentionCard.tsx
//
// "Needs Your Attention" — Smart Alerts (Root Map 5.3.1 + C3).
// Auto-collected: unmarked attendance, pending leave, overdue tasks, expiring contracts.

import { useState, useEffect } from "react";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";
import { taskAssignmentStorage } from "../storage/taskAssignment.storage";
import { leaveManagementStorage } from "../storage/leaveManagement.storage";

type AlertItem = {
  id: string;
  type: "unmarked" | "leave" | "task" | "contract" | "probation";
  label: string;
  count: number;
  color: string;
  icon: string;
};

function buildAlerts(): AlertItem[] {
  const alerts: AlertItem[] = [];
  const todayKey = attendanceLogStorage.toDateKey(new Date());
  const active = hrManagementStorage.getAll().filter((r) => r.status === "active");

  // 1. Unmarked attendance today
  const unmarked = active.filter((r) => !attendanceLogStorage.getDayEntry(r.id, todayKey)).length;
  if (unmarked > 0) {
    alerts.push({
      id: "unmarked",
      type: "unmarked",
      label: `${unmarked} employee${unmarked > 1 ? "s" : ""} not marked today`,
      count: unmarked,
      color: "#dc2626",
      icon: "📋",
    });
  }

  // 2. Pending leave requests
  const allLeaves = leaveManagementStorage.getAllRequests();
  const pendingLeaves = allLeaves.filter((l) => l.status === "pending").length;
  if (pendingLeaves > 0) {
    alerts.push({
      id: "leave",
      type: "leave",
      label: `${pendingLeaves} leave request${pendingLeaves > 1 ? "s" : ""} pending approval`,
      count: pendingLeaves,
      color: "#d97706",
      icon: "📅",
    });
  }

  // 3. Overdue tasks
  const now = Date.now();
  let overdueCount = 0;
  for (const record of active) {
    const tasks = taskAssignmentStorage.getActiveTasks(record.id);
    overdueCount += tasks.filter((t) => t.dueDate < now).length;
  }
  if (overdueCount > 0) {
    alerts.push({
      id: "task",
      type: "task",
      label: `${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}`,
      count: overdueCount,
      color: "#dc2626",
      icon: "⚠️",
    });
  }

  // 4. Expiring contracts (within 30 days)
  const contractReminders = hrManagementStorage.getContractReminders(30);
  if (contractReminders.length > 0) {
    alerts.push({
      id: "contract",
      type: "contract",
      label: `${contractReminders.length} contract${contractReminders.length > 1 ? "s" : ""} expiring within 30 days`,
      count: contractReminders.length,
      color: "#b45309",
      icon: "📄",
    });
  }

  // 5. Probation reminders (within 14 days)
  const probReminders = hrManagementStorage.getProbationReminders(14);
  if (probReminders.length > 0) {
    alerts.push({
      id: "probation",
      type: "probation",
      label: `${probReminders.length} probation${probReminders.length > 1 ? "s" : ""} ending within 14 days`,
      count: probReminders.length,
      color: "#7c3aed",
      icon: "⏰",
    });
  }

  return alerts;
}

export function NeedsAttentionCard() {
  const [alerts, setAlerts] = useState<AlertItem[]>(buildAlerts);

  useEffect(() => {
    const refresh = () => setAlerts(buildAlerts());
    refresh();
    const u1 = attendanceLogStorage.subscribe(refresh);
    const u2 = hrManagementStorage.subscribe(refresh);
    const u3 = taskAssignmentStorage.subscribe(refresh);
    const u4 = leaveManagementStorage.subscribe(refresh);
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div style={{
      padding: 14, background: "#fff", borderRadius: 12,
      border: "1px solid #fca5a5",
    }}>
      <div style={{
        fontWeight: 900, fontSize: 13, color: "#dc2626", marginBottom: 10,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ fontSize: 16 }}>🔔</span>
        Needs Your Attention ({alerts.length})
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {alerts.map((alert) => (
          <div key={alert.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", borderRadius: 8,
            background: "rgba(220,38,38,0.03)",
            border: "1px solid rgba(220,38,38,0.08)",
          }}>
            <span style={{ fontSize: 16 }}>{alert.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)", flex: 1 }}>
              {alert.label}
            </span>
            <span style={{
              padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 800,
              background: `${alert.color}15`, color: alert.color,
            }}>
              {alert.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
