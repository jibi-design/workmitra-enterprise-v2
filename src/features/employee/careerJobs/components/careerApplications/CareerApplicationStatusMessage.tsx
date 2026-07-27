import type { AppLite } from "../../types/careerApplicationTypes";
import { CAREER_BLUE, CAREER_MUTED, getEmployerFeedback } from "./careerApplicationCard.constants";

export function CareerApplicationStatusMessage({
  app,
  title,
  body,
  currentIndex,
  isFailed,
}: {
  app: AppLite;
  title: string;
  body: string;
  currentIndex: number;
  isFailed: boolean;
}) {
  const employerFeedback = getEmployerFeedback(app);

  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: "var(--wm-radius-button)",
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
          borderRadius: "var(--wm-radius-8)",
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
        <div style={{ fontSize: "14px", fontWeight: 800, color: isFailed ? "#991b1b" : "#0f172a" }}>
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
              borderRadius: "var(--wm-radius-button)",
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
                color: isFailed ? "var(--wm-error, #dc2626)" : "var(--wm-career-success, #16a34a)",
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
  );
}
