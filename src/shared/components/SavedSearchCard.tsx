// App name: Job Mitra
// File name: SavedSearchCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\components\SavedSearchCard.tsx

import { useState } from "react";
import { jobAlertStorage } from "../utils/jobAlertStorage";
import type { JobAlert } from "../utils/jobAlertTypes";
import { MAX_ALERTS } from "../utils/jobAlertTypes";

export function SavedSearchCard() {
  const [alerts, setAlerts] = useState<JobAlert[]>(() => jobAlertStorage.getAll());

  function handleDelete(id: string) {
    jobAlertStorage.delete(id);
    setAlerts(jobAlertStorage.getAll());
  }

  if (alerts.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 12,
        padding: "14px 16px",
        borderRadius: 14,
        border: "1px solid var(--wm-er-border)",
        background: "var(--wm-er-card, #fff)",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>
          My job alerts
        </div>

        <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
          {alerts.length}/{MAX_ALERTS}
        </span>
      </div>

      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
        {alerts.map((alert) => {
          const label = formatAlertLabel(alert.label);

          return (
            <div
              key={alert.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 10,
                background: "var(--wm-er-bg, #f8fafc)",
                border: "1px solid var(--wm-er-border)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 750,
                    color: "var(--wm-er-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </div>

                <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  Created{" "}
                  {new Date(alert.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(alert.id)}
                aria-label={`Delete alert: ${label}`}
                style={{
                  fontSize: 11,
                  fontWeight: 650,
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(220,38,38,0.2)",
                  background: "rgba(220,38,38,0.06)",
                  color: "var(--wm-error, #dc2626)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatAlertLabel(label: string): string {
  const cleaned = label.trim();

  if (!cleaned) return "Saved shift alert";

  return cleaned
    .replace(/\bfresher_ok\b/gi, "No experience needed")
    .replace(/\bexperienced\b/gi, "Experienced")
    .replace(/\bhelper\b/gi, "Helper work")
    .replace(/\bany\b/gi, "Any level")
    .replace(/\bshift\s*·\s*other\b/gi, "Other shift")
    .replace(/\s*·\s*/g, " · ");
}
