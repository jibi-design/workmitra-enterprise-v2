// App name: Job Mitra
// File name: EmployerShiftWorkspacesInfoCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftWorkspacesInfoCard.tsx

import type { EmployerWorkspaceMode } from "../types/employerShiftWorkspaces.types";

type EmployerShiftWorkspacesInfoCardProps = {
  mode: EmployerWorkspaceMode;
};

export function EmployerShiftWorkspacesInfoCard({ mode }: EmployerShiftWorkspacesInfoCardProps) {
  const isGroups = mode === "groups";

  return (
    <section
      style={{
        marginTop: 12,
        padding: "12px 14px",
        borderRadius: 18,
        border: "1px solid rgba(22,163,74,0.14)",
        background: "linear-gradient(180deg, rgba(240,253,244,0.72), rgba(255,255,255,0.96))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.035)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 950, color: "var(--wm-er-text)" }}>
        {isGroups ? "What are Work Groups?" : "What are Broadcasts?"}
      </div>

      <div style={{ marginTop: 5, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        {isGroups
          ? "When you confirm workers for a shift, a work group is created. Use it to track status, open the post, and manage worker updates."
          : "Broadcasts are group announcements for confirmed shift workers. Open an active group to send schedule updates or important notices."}
      </div>
    </section>
  );
}
