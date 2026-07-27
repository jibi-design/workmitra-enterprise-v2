// Job Mitra | EmployerDemandPlannerFillStatus.tsx | Post-publish fill summary (teal Planner)

import {
  FILL_STATUS_CONFIG,
  formatDemandPlannerDate,
} from "../../helpers/employerDemandPlanner.helpers";
import type { SlotResult } from "../../types/employerDemandPlanner.types";

type EmployerDemandPlannerFillStatusProps = {
  planName: string;
  results: SlotResult[];
  onContinue: () => void;
};

export function EmployerDemandPlannerFillStatus({
  planName,
  results,
  onContinue,
}: EmployerDemandPlannerFillStatusProps) {
  const filledCount = results.filter((result) => result.status === "filled").length;
  const total = results.length;

  return (
    <div>
      <div
        style={{
          padding: "14px 16px",
          borderRadius: 14,
          background: "var(--wm-planner-soft)",
          border: "1px solid var(--wm-planner-border)",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--wm-planner-accent-strong)",
            marginBottom: 4,
          }}
        >
          Plan published successfully
        </div>

        <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
          {total} plan day{total !== 1 ? "s" : ""} live for <strong>{planName}</strong>. Workers see
          one Mega Project Card and can apply by day.
        </div>

        <div
          style={{
            marginTop: 10,
            height: 6,
            borderRadius: 999,
            background: "var(--wm-er-divider, #e5e7eb)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              width: `${total > 0 ? (filledCount / total) * 100 : 0}%`,
              background: "var(--wm-planner-accent)",
              transition: "width var(--wm-motion-base) var(--wm-motion-spring)",
            }}
          />
        </div>

        <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
          {filledCount}/{total} days filled
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {results.map((result) => {
          const config = FILL_STATUS_CONFIG[result.status];

          return (
            <div
              key={result.postId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 10,
                background: config.bg,
                border: `1px solid ${config.color}22`,
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: config.color,
                    flexShrink: 0,
                  }}
                />

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                    {formatDemandPlannerDate(result.date)}
                  </div>

                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>
                    {result.confirmed}/{result.workers} confirmed
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: `${config.color}18`,
                  color: config.color,
                  border: `1px solid ${config.color}30`,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={onContinue}
          className="wm-planner-btnPrimary"
          style={{ width: "100%", padding: "12px 0" }}
        >
          Open Applications
        </button>
      </div>
    </div>
  );
}
