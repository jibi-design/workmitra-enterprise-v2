// App name: Job Mitra
// File name: CareerPostDetailHero.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\CareerPostDetailHero.tsx

type CareerPostDetailHeroProps = {
  jobTitle: string;
  companyName: string;
  department?: string;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "#0f172a";
const CAREER_MUTED = "#64748b";

export function CareerPostDetailHero({
  jobTitle,
  companyName,
  department,
}: CareerPostDetailHeroProps) {
  return (
    <section
      style={{
        margin: "2px 4px 0 4px",
        padding: "16px",
        borderRadius: "20px",
        border: "1px solid rgba(29,78,216,0.12)",
        background: "linear-gradient(135deg, #ffffff, #eff6ff)",
        boxShadow: "0 4px 14px rgba(29,78,216,0.03)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "rgba(29,78,216,0.08)",
            border: "1px solid rgba(29,78,216,0.12)",
            color: CAREER_BLUE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "inline-block",
              padding: "3px 8px",
              borderRadius: "999px",
              background: "rgba(29,78,216,0.1)",
              color: CAREER_BLUE,
              fontSize: "9px",
              fontWeight: 900,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Career role
          </div>

          <div
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 900,
              color: CAREER_TEXT,
              lineHeight: 1.2,
            }}
          >
            {formatDisplayTitle(jobTitle)}
          </div>

          <div
            style={{ margin: "4px 0 0 0", fontSize: "13px", color: CAREER_MUTED, fontWeight: 600 }}
          >
            {companyName}
            {department ? ` • ${department}` : ""}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatDisplayTitle(value: string): string {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
