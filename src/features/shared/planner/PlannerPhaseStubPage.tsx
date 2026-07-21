/** Job Mitra | PlannerPhaseStubPage.tsx | Zero Dead-End stub for upcoming Hybrid A2 sections */

import { Link } from "react-router-dom";

type PlannerPhaseStubPageProps = {
  readonly title: string;
  readonly description: string;
  readonly phaseLabel: string;
  readonly backTo: string;
  readonly backLabel: string;
  readonly secondaryTo?: string;
  readonly secondaryLabel?: string;
  readonly testId: string;
};

export function PlannerPhaseStubPage({
  title,
  description,
  phaseLabel,
  backTo,
  backLabel,
  secondaryTo,
  secondaryLabel,
  testId,
}: PlannerPhaseStubPageProps) {
  return (
    <div className="wm-ee-vPlanner wm-planner-page" data-testid={testId}>
      <div
        style={{
          maxWidth: 560,
          margin: "24px auto",
          padding: 24,
          borderRadius: 16,
          border: "1px solid rgba(8, 145, 178, 0.25)",
          background: "rgba(236, 254, 255, 0.92)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#0e7490",
            marginBottom: 8,
          }}
        >
          {phaseLabel}
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: 22, color: "#0f172a" }}>{title}</h1>
        <p style={{ margin: "0 0 20px", color: "#475569", lineHeight: 1.5 }}>{description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link
            to={backTo}
            data-testid={`${testId}-back`}
            className="wm-outlineBtn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            {backLabel}
          </Link>
          {secondaryTo && secondaryLabel ? (
            <Link
              to={secondaryTo}
              data-testid={`${testId}-secondary`}
              className="wm-primarybtn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
