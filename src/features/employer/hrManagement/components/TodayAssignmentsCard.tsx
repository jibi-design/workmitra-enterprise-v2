// src/features/employer/hrManagement/components/TodayAssignmentsCard.tsx
//
// Today's Assignments — which staff at which site/location (Root Map 5.3.1).
// Quick view: Site A: 3 staff, Site B: 2 staff, Office: 13.

import { useState, useEffect } from "react";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";

type SiteGroup = {
  location: string;
  count: number;
  names: string[];
};

function buildSiteGroups(): SiteGroup[] {
  const todayKey = attendanceLogStorage.toDateKey(new Date());
  const active = hrManagementStorage.getAll().filter((r) => r.status === "active");

  const map = new Map<string, string[]>();

  for (const record of active) {
    const entry = attendanceLogStorage.getDayEntry(record.id, todayKey);
    if (!entry || entry.status !== "present") continue;

    const loc = entry.location?.trim() || record.location?.trim() || "Unassigned";
    if (!map.has(loc)) map.set(loc, []);
    map.get(loc)!.push(record.employeeName);
  }

  const groups: SiteGroup[] = [];
  const unassigned = map.get("Unassigned");
  map.delete("Unassigned");

  const sorted = [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [location, names] of sorted) {
    groups.push({ location, count: names.length, names });
  }

  if (unassigned && unassigned.length > 0) {
    groups.push({ location: "Unassigned", count: unassigned.length, names: unassigned });
  }

  return groups;
}

export function TodayAssignmentsCard() {
  const [groups, setGroups] = useState<SiteGroup[]>(buildSiteGroups);

  useEffect(() => {
    const refresh = () => setGroups(buildSiteGroups());
    refresh();
    const u1 = attendanceLogStorage.subscribe(refresh);
    const u2 = hrManagementStorage.subscribe(refresh);
    return () => { u1(); u2(); };
  }, []);

  if (groups.length === 0) return null;

  const totalPresent = groups.reduce((sum, g) => sum + g.count, 0);

  return (
    <div style={{
      padding: 14, background: "#fff", borderRadius: 12,
      border: "1px solid var(--wm-er-border, #e5e7eb)",
    }}>
      <div style={{
        fontWeight: 900, fontSize: 13, color: "var(--wm-er-text)", marginBottom: 10,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ fontSize: 16 }}>📍</span>
        Today's Staff ({totalPresent} present)
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {groups.map((g) => (
          <div key={g.location} style={{
            padding: "8px 12px", borderRadius: 8,
            background: "#f0f9ff", border: "1px solid #bae6fd",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: "#0369a1" }}>{g.count}</span>
            <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>{g.location}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
