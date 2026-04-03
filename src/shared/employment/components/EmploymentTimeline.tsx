// src/shared/employment/components/EmploymentTimeline.tsx
// Session 17: Vertical audit trail timeline for employment lifecycle.

import type { EmploymentRecord } from "../employmentTypes";
import { formatTimelineEntry } from "../employmentDisplayHelpers";

/* ── Status → dot color mapping ── */
const DOT_COLORS: Record<string, string> = {
  selected: "#1d4ed8",
  working: "#16a34a",
  notice: "#b45309",
  resigned: "#b45309",
  completed: "#1d4ed8",
  withdrawn: "#64748b",
};

/* ── Component ── */
export function EmploymentTimeline({ record }: { record: EmploymentRecord }) {
  const entries = [...record.timeline].reverse(); // newest first

  if (entries.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--wm-text-primary, #1e293b)",
          marginBottom: 12,
        }}
      >
        Employment timeline
      </div>

      <div style={{ position: "relative", paddingLeft: 20 }}>
        {/* Vertical line */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 5,
            top: 4,
            bottom: 4,
            width: 2,
            background: "var(--wm-border, #e2e8f0)",
            borderRadius: 1,
          }}
        />

        {entries.map((entry, i) => {
          const formatted = formatTimelineEntry(entry);
          const dotColor = DOT_COLORS[formatted.statusKey] ?? "#64748b";
          const isLatest = i === 0;

          return (
            <div
              key={`${formatted.statusKey}-${entry.timestamp}`}
              style={{
                position: "relative",
                paddingBottom: i < entries.length - 1 ? 16 : 0,
              }}
            >
              {/* Dot */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: -16,
                  top: 3,
                  width: isLatest ? 12 : 10,
                  height: isLatest ? 12 : 10,
                  borderRadius: "50%",
                  background: dotColor,
                  border: isLatest ? `2px solid ${dotColor}33` : "none",
                }}
              />

              {/* Content */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isLatest ? 700 : 600,
                      color: dotColor,
                    }}
                  >
                    {formatted.label}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--wm-text-muted, #64748b)" }}>
                    {formatted.actor}
                  </span>
                </div>
                {formatted.note && (
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 12,
                      color: "var(--wm-text-muted, #64748b)",
                      lineHeight: 1.4,
                    }}
                  >
                    {formatted.note}
                  </div>
                )}
                <div style={{ marginTop: 2, fontSize: 11, color: "#94a3b8" }}>
                  {formatted.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}