// App name: Job Mitra
// File name: EmployeeEmployerFeedbackExpiredCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\feedback\EmployeeEmployerFeedbackExpiredCard.tsx

export function EmployeeEmployerFeedbackExpiredCard() {
  return (
    <div className="wm-ee-card" style={{ borderLeft: "4px solid rgba(148,163,184,0.45)" }}>
      <div style={{ fontWeight: 850, fontSize: 14, color: "var(--wm-er-text, #1e293b)" }}>
        Employer Feedback Window Closed
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          color: "var(--wm-er-muted, #64748b)",
          lineHeight: 1.5,
        }}
      >
        Feedback for this completed employment record was available for 7 days after closure.
      </div>
    </div>
  );
}
