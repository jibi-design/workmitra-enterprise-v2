// App name: Job Mitra | EmployerShiftWorkspacesInfoCard.tsx — surface-glass (Step 3)

import type { EmployerWorkspaceMode } from "../types/employerShiftWorkspaces.types";

type EmployerShiftWorkspacesInfoCardProps = {
  mode: EmployerWorkspaceMode;
};

export function EmployerShiftWorkspacesInfoCard({ mode }: EmployerShiftWorkspacesInfoCardProps) {
  const isGroups = mode === "groups";

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift"
      style={{ padding: "12px 14px" }}
      data-testid="employer-shift-workspaces-info"
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
