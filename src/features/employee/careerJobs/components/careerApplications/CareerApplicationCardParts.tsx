// App name: Job Mitra
// File name: CareerApplicationCardParts.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\careerApplications\CareerApplicationCardParts.tsx

import { DuplicateEmploymentWarning } from "../DuplicateEmploymentWarning";
import type { AppLite } from "../../types/careerApplicationTypes";

export const CAREER_BLUE = "#1d4ed8";
export const CAREER_MUTED = "#64748b";

type AppWithEmployerFeedback = AppLite & {
  feedback?: string;
};

function getEmployerFeedback(app: AppLite): string | null {
  const feedback = (app as AppWithEmployerFeedback).feedback;
  return typeof feedback === "string" && feedback.trim() ? feedback.trim() : null;
}

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
        borderRadius: "12px",
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
            background = "#16a34a"; // Passed (Green)
          } else if (index === app.totalPassed && app.totalScheduled > 0) {
            background = "#f59e0b"; // Scheduled (Orange/Amber)
          }

          return (
            <div key={index} style={{ flex: 1, height: 6, borderRadius: "999px", background }} />
          );
        })}
      </div>
    </div>
  );
}

// PREMIUM UPGRADE: Visual Progress Stepper replacing the old plain banner
export function CareerApplicationStatusTracker({
  app,
  title,
  body,
}: {
  app: AppLite;
  title: string;
  body: string;
}) {
  const STEPS = ["Applied", "Shortlist", "Interview", "Decision"];
  const employerFeedback = getEmployerFeedback(app);

  let currentIndex = 0;
  // Fixed TS Error: Removed 'closed' from cases
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

  // Fixed TS Error: Removed 'closed' from array
  const isFailed = ["rejected", "withdrawn"].includes(app.stage as string);

  // Dynamic line width logic
  const lineWidth =
    currentIndex === 0
      ? "0%"
      : currentIndex === 1
        ? "33%"
        : currentIndex === 2
          ? "66%"
          : "calc(100% - 48px)";

  return (
    <div
      style={{
        marginTop: 16,
        padding: "16px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #f8fafc, #ffffff)",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      {/* Visual Timeline Stepper */}
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
                  <div
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#cbd5e1" }}
                  />
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

      {/* Dynamic Status Box */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "12px",
          background: isFailed ? "#fef2f2" : "#eff6ff",
          border: `1px solid ${isFailed ? "rgba(220,38,38,0.2)" : "rgba(29,78,216,0.15)"}`,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            background: isFailed ? "rgba(220,38,38,0.1)" : "rgba(29,78,216,0.1)",
            color: isFailed ? "#dc2626" : CAREER_BLUE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isFailed ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : currentIndex === 0 ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          ) : currentIndex === 1 ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ) : currentIndex === 2 ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
        </div>
        <div style={{ width: "100%" }}>
          <div
            style={{ fontSize: "14px", fontWeight: 800, color: isFailed ? "#991b1b" : "#0f172a" }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: isFailed ? "#b91c1c" : CAREER_MUTED,
              marginTop: "4px",
              lineHeight: 1.45,
            }}
          >
            {body}
          </div>

          {/* Employer Feedback Panel (New Addition) */}
          {employerFeedback && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                background: isFailed ? "rgba(254,242,242,0.8)" : "rgba(240,253,244,0.8)",
                border: isFailed
                  ? "1px dashed rgba(220,38,38,0.4)"
                  : "1px dashed rgba(22,163,74,0.4)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: isFailed ? "#dc2626" : "#16a34a",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Feedback from Employer
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1e293b",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {employerFeedback}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CareerOfferDetails({
  app,
  onAcceptOffer,
  onDeclineOffer,
}: {
  app: AppLite;
  onAcceptOffer?: () => void;
  onDeclineOffer?: () => void;
}) {
  if (app.stage !== "offered" || !app.offerDetails) return null;

  return (
    <div
      style={{
        marginTop: 16,
        padding: "16px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #eff6ff, #ffffff)",
        border: "1px solid rgba(29,78,216,0.15)",
      }}
    >
      <DuplicateEmploymentWarning />

      <div style={{ fontSize: "14px", fontWeight: 800, color: CAREER_BLUE, marginBottom: "8px" }}>
        Offer details
      </div>

      <div style={{ fontSize: "13px", color: "#0f172a", lineHeight: 1.6, fontWeight: 700 }}>
        {app.offerDetails.jobTitle} • Salary: {app.offerDetails.salary.toLocaleString()} /{" "}
        {app.offerDetails.salaryPeriod}
        {app.offerDetails.startDate && (
          <span>
            {" "}
            • Start:{" "}
            {new Date(app.offerDetails.startDate).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {app.offerDetails.message && (
        <div
          style={{
            fontSize: "12px",
            color: CAREER_MUTED,
            marginTop: "8px",
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          &ldquo;{app.offerDetails.message}&rdquo;
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAcceptOffer?.();
          }}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: "8px",
            border: "none",
            background: "#16a34a",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Accept Offer
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDeclineOffer?.();
          }}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: CAREER_MUTED,
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}

export function CareerApplicationFooter({
  appliedAt,
  canWithdraw,
  onWithdraw,
  formatDateTime,
}: {
  appliedAt: number;
  canWithdraw: boolean;
  onWithdraw: () => void;
  formatDateTime: (timestamp: number) => string;
}) {
  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ fontSize: "12px", color: CAREER_MUTED, fontWeight: 600 }}>
        Applied {formatDateTime(appliedAt)}
      </div>

      {canWithdraw && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onWithdraw();
          }}
          style={{
            fontSize: "12px",
            fontWeight: 800,
            color: "#dc2626",
            background: "#fef2f2",
            border: "1px solid rgba(220,38,38,0.2)",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Withdraw
        </button>
      )}
    </div>
  );
}
