// src/features/employer/hrManagement/components/AvailabilityResponseRow.tsx

import type { AvailabilityEmployeeResponse } from "../types/staffAvailability.types";
import { RESPONSE_STATUS_CONFIG } from "../helpers/staffAvailabilityConstants";
import { formatAvailDateTime } from "../helpers/availabilityDateHelpers";

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ResponseRow({ emp }: { emp: AvailabilityEmployeeResponse }) {
  const rCfg = RESPONSE_STATUS_CONFIG[emp.status];
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 10px", borderRadius: 6,
        background: "#fff", border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)" }}>
          {emp.employeeName}
        </div>
        {emp.note && (
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2, fontStyle: "italic" }}>
            &quot;{emp.note}&quot;
          </div>
        )}
        {emp.respondedAt && (
          <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
            {formatAvailDateTime(emp.respondedAt)}
          </div>
        )}
      </div>
      <span
        style={{
          padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800,
          background: rCfg.bg, color: rCfg.color,
          textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0,
        }}
      >
        {rCfg.label}
      </span>
    </div>
  );
}
