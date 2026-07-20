// App name: Job Mitra
// File name: CareerCandidateInterviewProgress.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCandidateInterviewProgress.tsx

import type { CareerApplication } from "../types/careerTypes";

type CareerCandidateInterviewProgressProps = {
  app: CareerApplication;
  totalRounds: number;
};

const EMPLOYER_STEPPER_STYLE = `
  .wm-employer-stepper {
    transition: all var(--wm-motion-base) var(--wm-motion-spring);
  }
  .wm-employer-stepper:hover {
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  }
  @keyframes adminPulse {
    0% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0.3); }
    70% { box-shadow: 0 0 0 8px rgba(15, 23, 42, 0); }
    100% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0); }
  }
  @keyframes adminPulseWarning {
    0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
    70% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
    100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
  }
  .wm-admin-step-active {
    animation: adminPulse 2s infinite;
    border-color: #0f172a !important;
  }
  .wm-admin-step-interview {
    animation: adminPulseWarning 2s infinite;
    border-color: #f59e0b !important;
  }
`;

export function CareerCandidateInterviewProgress({
  app,
  totalRounds,
}: CareerCandidateInterviewProgressProps) {
  const STEPS = ["Applied", "Shortlisted", "Interview", "Decision"];

  let currentIndex = 0;
  switch (app.stage) {
    case "applied":
      currentIndex = 0;
      break;
    case "shortlisted":
      currentIndex = 1;
      break;
    case "interview":
      currentIndex = 2;
      break;
    case "offered":
    case "offer_accepted":
    case "hired":
    case "rejected":
    case "withdrawn":
      currentIndex = 3;
      break;
  }

  const isFailed = ["rejected", "withdrawn"].includes(app.stage as string);

  const passedCount = app.roundResults?.filter((item) => item.status === "passed").length || 0;

  return (
    <div
      className="wm-employer-stepper"
      style={{
        marginTop: 20,
        padding: "24px 20px",
        borderRadius: 20,
        background: "linear-gradient(135deg, #f8fafc, #ffffff)",
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.8)",
      }}
    >
      <style>{EMPLOYER_STEPPER_STYLE}</style>

      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        Candidate Pipeline Status
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          padding: "0 10px",
        }}
      >
        {/* Background Track */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 32,
            right: 32,
            height: 3,
            background: "#e2e8f0",
            zIndex: 0,
            borderRadius: 2,
          }}
        />

        {/* Progress Track */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 32,
            width: `calc(${(currentIndex / 3) * 100}% - 64px)`,
            height: 3,
            background: isFailed ? "#cbd5e1" : "#0f172a",
            zIndex: 0,
            transition: "width 0.4s var(--wm-motion-spring)",
            borderRadius: 2,
          }}
        />

        {STEPS.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isError = isFailed && isCurrent;
          const isInterviewActive = isCurrent && step === "Interview";

          // Employer Admin specific node design (Squares instead of circles)
          let nodeBg = "#ffffff";
          let nodeBorder = "2px solid #cbd5e1";
          let nodeColor = "#94a3b8";
          let ringClass = "";

          if (isActive && !isCurrent) {
            nodeBg = "linear-gradient(135deg, #1e293b, #0f172a)";
            nodeBorder = "2px solid #0f172a";
            nodeColor = "#ffffff";
          } else if (isCurrent) {
            if (isError) {
              nodeBg = "#fef2f2";
              nodeBorder = "2px solid #dc2626";
              nodeColor = "#dc2626";
            } else if (isInterviewActive) {
              nodeBg = "linear-gradient(135deg, #fffbeb, #fef3c7)";
              nodeBorder = "2px solid #f59e0b";
              nodeColor = "#d97706";
              ringClass = "wm-admin-step-interview";
            } else {
              nodeBg = "linear-gradient(135deg, #f8fafc, #ffffff)";
              nodeBorder = "2px solid #0f172a";
              nodeColor = "#0f172a";
              ringClass = "wm-admin-step-active";
            }
          }

          return (
            <div
              key={step}
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                className={ringClass}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: nodeBg,
                  border: nodeBorder,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all var(--wm-motion-base) var(--wm-motion-spring)",
                  transform: isCurrent ? "scale(1.1)" : "scale(1)",
                  boxShadow: isActive && !isCurrent ? "0 4px 10px rgba(15,23,42,0.2)" : "none",
                }}
              >
                {isActive && !isCurrent ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isError ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : isInterviewActive ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: 3, background: nodeColor }} />
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: isCurrent ? 900 : 700,
                    color: isCurrent ? (isError ? "#dc2626" : "#0f172a") : "#64748b",
                  }}
                >
                  {step}
                </div>

                {/* Embedded Interview Progress specifically for Employer */}
                {step === "Interview" &&
                  (isInterviewActive || (index < currentIndex && totalRounds > 0)) && (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: isInterviewActive ? "#b45309" : "#64748b",
                        marginTop: 6,
                        background: isInterviewActive ? "#fde68a" : "#e2e8f0",
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      {passedCount}/{totalRounds} Rnds
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
