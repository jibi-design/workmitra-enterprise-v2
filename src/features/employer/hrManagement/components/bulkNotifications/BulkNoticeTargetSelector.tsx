// App: Job Mitra / WorkMitra_Enterprise_v2
// File: BulkNoticeTargetSelector.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\bulkNotifications\BulkNoticeTargetSelector.tsx

import {
  TARGET_OPTIONS,
  NOTIF_INPUT_STYLE,
  NOTIF_LABEL_STYLE,
} from "../../helpers/bulkNotificationsHelpers";
import type { ExtendedTarget } from "../../helpers/bulkNotificationsHelpers";

type Props = {
  target: ExtendedTarget;
  targetValue: string;
  departments: string[];
  locations: string[];
  onTargetChange: (value: ExtendedTarget) => void;
  onTargetValueChange: (value: string) => void;
};

export function BulkNoticeTargetSelector({
  target,
  targetValue,
  departments,
  locations,
  onTargetChange,
  onTargetValueChange,
}: Props) {
  return (
    <>
      <div style={{ marginTop: 14 }}>
        <label style={NOTIF_LABEL_STYLE}>Send To</label>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TARGET_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onTargetChange(option.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                textAlign: "left",
                width: "100%",
                border:
                  target === option.value
                    ? "2px solid var(--wm-er-accent-console, #0369a1)"
                    : "1px solid var(--wm-er-border, #e5e7eb)",
                borderRadius: 8,
                background: target === option.value ? "rgba(3, 105, 161,0.04)" : "#fff",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: `2px solid ${
                    target === option.value
                      ? "var(--wm-er-accent-console, #0369a1)"
                      : "var(--wm-er-border, #e5e7eb)"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {target === option.value && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--wm-er-accent-console, #0369a1)",
                    }}
                  />
                )}
              </span>

              <div>
                <div
                  style={{
                    fontWeight: target === option.value ? 800 : 600,
                    fontSize: 13,
                    color: "var(--wm-er-text)",
                  }}
                >
                  {option.label}
                </div>

                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {target === "department" && (
        <div style={{ marginTop: 12 }}>
          <label style={NOTIF_LABEL_STYLE}>Select Department *</label>

          {departments.length > 0 ? (
            <select
              value={targetValue}
              onChange={(event) => onTargetValueChange(event.target.value)}
              style={{ ...NOTIF_INPUT_STYLE, cursor: "pointer" }}
            >
              <option value="">Choose department...</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", padding: "8px 0" }}>
              No departments found. Assign departments to employees first.
            </div>
          )}
        </div>
      )}

      {target === "location" && (
        <div style={{ marginTop: 12 }}>
          <label style={NOTIF_LABEL_STYLE}>Select Location / Site *</label>

          {locations.length > 0 ? (
            <select
              value={targetValue}
              onChange={(event) => onTargetValueChange(event.target.value)}
              style={{ ...NOTIF_INPUT_STYLE, cursor: "pointer" }}
            >
              <option value="">Choose location...</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", padding: "8px 0" }}>
              No locations found. Assign locations to employees first.
            </div>
          )}
        </div>
      )}
    </>
  );
}
