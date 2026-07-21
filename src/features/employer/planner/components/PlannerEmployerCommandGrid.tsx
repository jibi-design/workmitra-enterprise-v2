// Job Mitra | PlannerEmployerCommandGrid.tsx | All planner actions — always visible

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EnterpriseResponsiveGrid } from "../../../../shared/components/enterprise";

type CommandItem = {
  label: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
};

export function PlannerEmployerCommandGrid() {
  const nav = useNavigate();

  const commands: CommandItem[] = [
    {
      label: "New Plan",
      description: "3-step wizard — role, schedule & pay, publish",
      onClick: () => nav(ROUTE_PATHS.employerPlannerNew),
      primary: true,
    },
    {
      label: "All Plans",
      description: "Drafts, active, completed, cancelled",
      onClick: () => nav(ROUTE_PATHS.employerPlannerPlans),
    },
    {
      label: "My Posts",
      description: "Project plans grouped — not 30 separate cards",
      onClick: () => nav(ROUTE_PATHS.employerShiftPosts),
    },
    {
      label: "Favorite Workers",
      description: "Direct invite to plan days (hidden posts)",
      onClick: () => nav(ROUTE_PATHS.employerShiftFavorites),
    },
    {
      label: "Workspaces",
      description: "Confirmed crew per-day chat",
      onClick: () => nav(ROUTE_PATHS.employerShiftWorkspaces),
    },
    {
      label: "Shift Home",
      description: "Single-day shift hiring (green domain)",
      onClick: () => nav(ROUTE_PATHS.employerShiftHome),
    },
  ];

  return (
    <div className="wm-planner-card">
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>Planner Command Center</div>
      <p
        style={{ fontSize: 11, color: "var(--wm-neutral-500)", marginBottom: 12, lineHeight: 1.45 }}
      >
        Every Gig Projects tool is listed here — nothing is hidden. P2/P3 items show honest status
        on open.
      </p>
      <EnterpriseResponsiveGrid minItemWidth={148} gap={8} testId="planner-command-grid">
        {commands.map((cmd) => (
          <button
            key={cmd.label}
            type="button"
            className={cmd.primary ? "wm-planner-btnPrimary" : "wm-planner-btnGhost"}
            style={{
              minHeight: 72,
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              padding: "10px 12px",
              textAlign: "left",
              gap: 4,
              width: "100%",
            }}
            onClick={cmd.onClick}
          >
            <span style={{ fontSize: 12, fontWeight: 800 }}>{cmd.label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.85, lineHeight: 1.35 }}>
              {cmd.description}
            </span>
          </button>
        ))}
      </EnterpriseResponsiveGrid>
    </div>
  );
}
