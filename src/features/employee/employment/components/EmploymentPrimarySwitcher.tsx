// App name: Job Mitra
// File name: EmploymentPrimarySwitcher.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\EmploymentPrimarySwitcher.tsx

import { useState } from "react";
import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import { CurrentEmploymentListCard } from "./CurrentEmploymentListCard";

type EmploymentPrimarySwitcherProps = {
  currentRecord: EmploymentRecord;
  activeEmployments: EmploymentRecord[];
  primaryId: string | null;
  onSetPrimary: (employmentId: string) => void;
};

const TEXT = "var(--wm-er-text, #1e293b)";
const MUTED = "var(--wm-er-muted, #64748b)";
const BLUE = "var(--wm-er-accent-console, #0369a1)";

export function EmploymentPrimarySwitcher({
  currentRecord,
  activeEmployments,
  primaryId,
  onSetPrimary,
}: EmploymentPrimarySwitcherProps) {
  const [expanded, setExpanded] = useState(false);
  const isPrimary = primaryId === currentRecord.id;
  const hasMultipleJobs = activeEmployments.length > 1;

  return (
    <section
      className="wm-ee-card"
      style={{
        padding: 0,
        overflow: "hidden",
        border: isPrimary ? "1px solid rgba(3,105,161,0.3)" : "1px solid rgba(3,105,161,0.14)",
        background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(240,249,255,0.86))",
      }}
    >
      <button
        type="button"
        onClick={() => hasMultipleJobs && setExpanded((value) => !value)}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: "13px 14px",
          textAlign: "left",
          cursor: hasMultipleJobs ? "pointer" : "default",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 950, color: TEXT }}>Home primary job</div>

            <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.45 }}>
              {isPrimary
                ? "This job is shown on your Home card."
                : "This job is not shown on Home."}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span
              style={{
                padding: "7px 10px",
                borderRadius: 999,
                background: isPrimary ? "rgba(3,105,161,0.1)" : "rgba(148,163,184,0.12)",
                color: isPrimary ? BLUE : MUTED,
                fontSize: 11,
                fontWeight: 950,
                whiteSpace: "nowrap",
              }}
            >
              {isPrimary ? "Primary" : "Not Primary"}
            </span>

            {hasMultipleJobs && (
              <span
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(3,105,161,0.08)",
                  color: BLUE,
                  fontSize: 15,
                  fontWeight: 950,
                }}
              >
                {expanded ? "⌃" : "⌄"}
              </span>
            )}
          </div>
        </div>

        {hasMultipleJobs && (
          <div
            style={{
              marginTop: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(3,105,161,0.08)",
              color: BLUE,
              fontSize: 11.5,
              fontWeight: 900,
            }}
          >
            {expanded ? "Hide current jobs" : "Change primary job"}
          </div>
        )}
      </button>

      {expanded && hasMultipleJobs && (
        <div
          style={{
            padding: "0 14px 14px",
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              padding: "9px 10px",
              borderRadius: 13,
              background: "rgba(3,105,161,0.06)",
              color: MUTED,
              fontSize: 12,
              lineHeight: 1.45,
            }}
          >
            Select the job to show on Home. Start Work stays linked to the job page you open.
          </div>

          {activeEmployments.map((record) => (
            <CurrentEmploymentListCard
              key={record.id}
              record={record}
              isPrimary={record.id === primaryId}
              onSetPrimary={onSetPrimary}
            />
          ))}

          <button
            type="button"
            onClick={() => setExpanded(false)}
            style={{
              minHeight: 36,
              borderRadius: 12,
              border: "1px solid rgba(3,105,161,0.18)",
              background: "rgba(3,105,161,0.07)",
              color: BLUE,
              fontSize: 12,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Close list
          </button>
        </div>
      )}
    </section>
  );
}
