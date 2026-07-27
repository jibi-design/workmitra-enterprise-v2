import type { AppLite } from "../../types/careerApplicationTypes";
import { CAREER_BLUE } from "./careerApplicationCard.constants";
import { getStepperLineWidth, isFailedApplicationStage } from "./careerApplicationStage.helpers";

const STEPS = ["Applied", "Shortlist", "Interview", "Decision"] as const;

export function CareerApplicationStepper({
  app,
  currentIndex,
}: {
  app: AppLite;
  currentIndex: number;
}) {
  const isFailed = isFailedApplicationStage(app.stage);
  const lineWidth = getStepperLineWidth(currentIndex);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 20,
        padding: "0 8px",
      }}
    >
      {/* Background connecting line */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 24,
          right: 24,
          height: 2,
          background: "#e2e8f0",
          zIndex: 0,
        }}
      />

      {/* Active progress line */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 24,
          width: lineWidth,
          height: 2,
          background: isFailed ? "#cbd5e1" : CAREER_BLUE,
          zIndex: 0,
          transition: "width 0.3s ease",
        }}
      />

      {STEPS.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isError = isFailed && isCurrent;
        const color = isError ? "#dc2626" : isActive ? CAREER_BLUE : "#94a3b8";
        const bgColor = isActive ? (isError ? "#fef2f2" : "#eff6ff") : "#ffffff";
        const borderColor = isError ? "#f87171" : isActive ? CAREER_BLUE : "#e2e8f0";

        return (
          <div
            key={step}
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: bgColor,
                border: `2px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isCurrent
                  ? `0 0 0 3px ${isError ? "rgba(220,38,38,0.1)" : "rgba(29,78,216,0.1)"}`
                  : "none",
                transition: "all 0.2s ease",
              }}
            >
              {isActive && !isError ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : isError ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#cbd5e1" }} />
              )}
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: isActive ? 800 : 600,
                color: isActive ? "#0f172a" : "#64748b",
              }}
            >
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
}
