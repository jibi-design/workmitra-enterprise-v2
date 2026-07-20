// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffAvailabilityModeToggle.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\staffAvailability\StaffAvailabilityModeToggle.tsx

import type { CSSProperties } from "react";
import { MODE_CONFIG } from "../../helpers/staffAvailabilityConstants";
import type { AvailabilityMode } from "../../types/staffAvailability.types";

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};

type Props = {
  mode: AvailabilityMode;
  onModeChange: (mode: AvailabilityMode) => void;
};

export function StaffAvailabilityModeToggle({ mode, onModeChange }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>Request Type</label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {(Object.keys(MODE_CONFIG) as AvailabilityMode[]).map((key) => {
          const config = MODE_CONFIG[key];
          const isActive = mode === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onModeChange(key)}
              style={{
                padding: "10px 12px",
                textAlign: "left",
                border: isActive
                  ? "2px solid var(--wm-er-accent-console, #0369a1)"
                  : "1px solid var(--wm-er-border, #e5e7eb)",
                borderRadius: 10,
                background: isActive ? "rgba(3, 105, 161, 0.04)" : "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 4 }}>{config.icon}</div>

              <div style={{ fontWeight: 800, fontSize: 13, color: "var(--wm-er-text)" }}>
                {config.label}
              </div>

              <div
                style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2, lineHeight: 1.4 }}
              >
                {config.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
