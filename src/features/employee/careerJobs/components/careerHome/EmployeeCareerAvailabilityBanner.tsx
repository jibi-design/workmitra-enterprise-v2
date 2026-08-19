// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerAvailabilityBanner.tsx

type Props = {
  activeJobCount: number;
  activeApplicationCount: number;
  activeWorkspaceCount: number;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_MUTED = "var(--wm-er-muted, #475569)";

export function EmployeeCareerAvailabilityBanner({
  activeJobCount,
  activeApplicationCount,
  activeWorkspaceCount,
}: Props) {
  if (activeWorkspaceCount > 0) return null;

  const hasActivity = activeJobCount > 0 || activeApplicationCount > 0;

  return (
    <section
      className="wm-ee-card"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div style={{ display: "flex", gap: "var(--wm-stack-gap)", alignItems: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--wm-radius-chip)",
            flexShrink: 0,
            background: hasActivity
              ? "linear-gradient(135deg, #eff6ff, #dbeafe)"
              : "rgba(241, 245, 249, 0.8)",
            color: hasActivity ? CAREER_BLUE : CAREER_MUTED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--wm-type-card-title-size)",
            fontWeight: 800,
            border: hasActivity
              ? "1px solid rgba(255, 255, 255, 0.8)"
              : "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: hasActivity ? "0 4px 12px rgba(37,99,235,0.08)" : "none",
          }}
        >
          {activeJobCount}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="wm-typeCardTitle"
            style={{ color: hasActivity ? undefined : CAREER_MUTED }}
          >
            {activeJobCount > 0
              ? `${activeJobCount} active career ${activeJobCount === 1 ? "role" : "roles"}`
              : "Career discovery is ready"}
          </div>

          <div className="wm-typeHelperMd" style={{ marginTop: 4 }}>
            {activeJobCount > 0
              ? "Review each role before applying. Long-term jobs need a clear decision."
              : "New active roles will appear here when employers publish them."}
          </div>
        </div>
      </div>
    </section>
  );
}
