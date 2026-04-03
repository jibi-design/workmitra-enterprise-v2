// src/features/employee/profile/components/CurrentlyEmployedBadge.tsx
//
// Session 17: Green badge shown on employee profile when
// they have an active employment (working or notice status).
// Returns null when not employed — zero visual footprint.

import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import { employeeProfileStorage } from "../storage/employeeProfile.storage";

const GREEN = "#16a34a";

export function CurrentlyEmployedBadge() {
  const employeeId = employeeProfileStorage.get().uniqueId ?? "";
  if (!employeeId) return null;

  const active = employmentStorage.getActiveByEmployee(employeeId)
    .find((r) => r.status === "working" || r.status === "notice");
  if (!active) return null;

  const company = active.companyName || "a company";

  return (
    <div style={{
      marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 20,
      background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.20)",
    }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: GREEN }}>
        Currently working at {company}
      </span>
    </div>
  );
}