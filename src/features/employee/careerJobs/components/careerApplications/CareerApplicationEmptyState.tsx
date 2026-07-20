// App name: Job Mitra
// File name: CareerApplicationEmptyState.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\careerApplications\CareerApplicationEmptyState.tsx

import { CAREER_BLUE } from "./CareerApplicationCardParts";

export function EmptyState({ onFind }: { onFind: () => void }) {
  return (
    <section
      style={{
        padding: "28px 22px",
        borderRadius: 24,
        border: "1px solid rgba(203,213,225,0.95)",
        background:
          "radial-gradient(circle at 50% 0%, rgba(29,78,216,0.1), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98) 58%, rgba(239,246,255,0.76))",
        boxShadow: "0 16px 34px rgba(15,23,42,0.07)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          margin: "0 auto",
          borderRadius: 18,
          background: "rgba(29,78,216,0.09)",
          border: "1px solid rgba(29,78,216,0.13)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: CAREER_BLUE,
        }}
      >
        <svg width={23} height={23} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-.8 2.4L17.6 8h-4.4V4.4ZM6 20V4h5v6h7v10H6Zm2-7h8v2H8v-2Zm0 4h6v2H8v-2Z"
          />
        </svg>
      </div>

      <div
        style={{
          marginTop: 13,
          fontSize: 15,
          fontWeight: 950,
          color: "var(--wm-er-text, #1e293b)",
        }}
      >
        No applications in this view
      </div>

      <div
        style={{
          marginTop: 7,
          fontSize: 13,
          color: "var(--wm-er-muted, #64748b)",
          lineHeight: 1.58,
        }}
      >
        Apply to active Career Jobs to start tracking your progress here.
      </div>

      <button
        type="button"
        onClick={onFind}
        style={{
          marginTop: 15,
          background: CAREER_BLUE,
          color: "#fff",
          border: "none",
          padding: "9px 18px",
          borderRadius: 999,
          fontSize: 12.5,
          fontWeight: 950,
          cursor: "pointer",
          boxShadow: "0 12px 24px rgba(29,78,216,0.18)",
        }}
      >
        Find Career Jobs
      </button>
    </section>
  );
}
