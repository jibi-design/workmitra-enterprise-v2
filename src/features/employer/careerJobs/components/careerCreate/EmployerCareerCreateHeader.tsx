// App name: Job Mitra
// File name: EmployerCareerCreateHeader.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\careerCreate\EmployerCareerCreateHeader.tsx

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e40af";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #475569)";

export function EmployerCareerCreateHeader() {
  return (
    <section
      style={{
        marginTop: 2,
        padding: "20px 18px",
        borderRadius: 24,
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
        boxShadow: "0 16px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
        backdropFilter: "blur(24px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Premium Glow Effect inside Header */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            flexShrink: 0,
            background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
            border: "1px solid rgba(255, 255, 255, 0.9)",
            color: CAREER_BLUE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 16px rgba(37,99,235,0.12), inset 0 2px 4px rgba(255,255,255,0.9)",
          }}
        >
          {/* Unique Premium Icon for Create Post */}
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 12,
              background: "rgba(37, 99, 235, 0.08)",
              border: "1px solid rgba(37, 99, 235, 0.12)",
              color: CAREER_BLUE_DEEP,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Employer Career
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 18,
              fontWeight: 800,
              color: CAREER_TEXT,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            Create a long-term career post
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12.5,
              color: CAREER_MUTED,
              lineHeight: 1.45,
              fontWeight: 500,
            }}
          >
            Add role details, requirements, interview steps, and final review for a stable Career
            Job.
          </div>
        </div>
      </div>
    </section>
  );
}
