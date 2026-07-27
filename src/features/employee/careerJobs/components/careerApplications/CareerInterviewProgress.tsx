// Split from CareerApplicationCardParts — CareerInterviewProgress.

import type { AppLite } from "../../types/careerApplicationTypes";
import { CAREER_BLUE } from "./careerApplicationCard.constants";

export function CareerInterviewProgress({
  app,
  totalRounds,
}: {
  app: AppLite;
  totalRounds: number;
}) {
  if (app.stage !== "interview" || totalRounds <= 0) return null;

  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px",
        borderRadius: "var(--wm-radius-button)",
        background: "rgba(29,78,216,0.04)",
        border: "1px solid rgba(29,78,216,0.1)",
      }}
    >
      <div style={{ fontSize: "13px", fontWeight: 800, color: CAREER_BLUE }}>
        Interview progress: {app.totalPassed}/{totalRounds} passed
        {app.totalScheduled > 0 ? ` • ${app.totalScheduled} scheduled` : ""}
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {Array.from({ length: totalRounds }, (_, index) => {
          let background = "#e2e8f0";

          if (index < app.totalPassed) {
            background = "var(--wm-career-success, #16a34a)"; // Passed
          } else if (index === app.totalPassed && app.totalScheduled > 0) {
            background = "#f59e0b"; // Scheduled (Orange/Amber)
          }

          return (
            <div
              key={index}
              style={{ flex: 1, height: 6, borderRadius: "var(--wm-radius-pill)", background }}
            />
          );
        })}
      </div>
    </div>
  );
}

// PREMIUM UPGRADE: Visual Progress Stepper replacing the old plain banner
