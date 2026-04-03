// src/features/employer/hrManagement/components/CommandCenterCard.tsx
//
// Today's Command Center — Workforce Summary (Root Map 5.3.1 + C1).
// Shows: Total Staff, Present, Absent, On Leave, Not Marked Yet.
// Uses today's attendance data from attendanceLogStorage.

import { useState, useEffect } from "react";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";

type TodaySummary = {
  total: number;
  present: number;
  absent: number;
  leave: number;
  off: number;
  notMarked: number;
};

function buildTodaySummary(): TodaySummary {
  const todayKey = attendanceLogStorage.toDateKey(new Date());
  const active = hrManagementStorage.getAll().filter((r) => r.status === "active");

  let present = 0;
  let absent = 0;
  let leave = 0;
  let off = 0;
  let notMarked = 0;

  for (const record of active) {
    const entry = attendanceLogStorage.getDayEntry(record.id, todayKey);
    if (!entry) { notMarked++; continue; }
    switch (entry.status) {
      case "present": present++; break;
      case "absent": absent++; break;
      case "leave": leave++; break;
      case "off": off++; break;
    }
  }

  return { total: active.length, present, absent, leave, off, notMarked };
}

const METRICS: { key: keyof TodaySummary; label: string; color: string; bg: string }[] = [
  { key: "total",     label: "Total Staff",  color: "#0369a1", bg: "rgba(3, 105, 161,0.06)" },
  { key: "present",   label: "Present",      color: "#15803d", bg: "rgba(22,163,74,0.06)" },
  { key: "absent",    label: "Absent",       color: "#dc2626", bg: "rgba(220,38,38,0.06)" },
  { key: "leave",     label: "On Leave",     color: "#d97706", bg: "rgba(245,158,11,0.06)" },
  { key: "notMarked", label: "Not Marked",   color: "#6b7280", bg: "rgba(107,114,128,0.06)" },
];

export function CommandCenterCard() {
  const [summary, setSummary] = useState<TodaySummary>(buildTodaySummary);

  useEffect(() => {
    const refresh = () => setSummary(buildTodaySummary());
    refresh();
    const u1 = attendanceLogStorage.subscribe(refresh);
    const u2 = hrManagementStorage.subscribe(refresh);
    return () => { u1(); u2(); };
  }, []);

  if (summary.total === 0) return null;

  const todayStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div style={{
      padding: 16, background: "#fff", borderRadius: 12,
      border: "1px solid var(--wm-er-border, #e5e7eb)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: "rgba(3, 105, 161,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#0369a1" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>Today's Overview</div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>{todayStr}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
        {METRICS.map((m) => {
          const val = summary[m.key];
          return (
            <div key={m.key} style={{
              padding: "10px 4px", borderRadius: 10, background: m.bg,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: val > 0 ? m.color : "#d1d5db", lineHeight: 1 }}>
                {val}
              </div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "var(--wm-er-muted)", marginTop: 4, letterSpacing: 0.2 }}>
                {m.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
