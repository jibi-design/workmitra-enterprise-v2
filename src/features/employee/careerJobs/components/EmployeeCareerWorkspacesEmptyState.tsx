// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerWorkspacesEmptyState.tsx

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export function EmployeeCareerWorkspacesEmptyState() {
  return (
    <div
      style={{
        padding: "28px 22px",
        borderRadius: "var(--wm-radius-employer-card)",
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
          borderRadius: "var(--wm-radius-chip)",
          background: "rgba(29,78,216,0.09)",
          border: "1px solid rgba(29,78,216,0.13)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: CAREER_BLUE,
        }}
      >
        <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3Zm2 0h4V4h-4v2Zm9 6h-5v2h-4v-2H5v7h14v-7Z"
          />
        </svg>
      </div>

      <div style={{ marginTop: 13, fontSize: 15, fontWeight: 950, color: CAREER_TEXT }}>
        No workspace yet
      </div>

      <div style={{ marginTop: 7, fontSize: 13, color: CAREER_MUTED, lineHeight: 1.58 }}>
        When an employer confirms you for a Career Job, your workspace will appear here.
      </div>

      <div
        style={{
          marginTop: 13,
          padding: "9px 11px",
          borderRadius: "var(--wm-radius-chip)",
          background: "rgba(29,78,216,0.055)",
          color: CAREER_BLUE_DEEP,
          fontSize: 11.5,
          fontWeight: 850,
          lineHeight: 1.45,
        }}
      >
        Career workspaces stay separate from Shift Jobs.
      </div>
    </div>
  );
}
