// Job Mitra | PlannerEmployeeCommandGrid.tsx | Gig Projects domain actions only

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

type CommandItem = {
  label: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
};

export function PlannerEmployeeCommandGrid() {
  const nav = useNavigate();

  const commands: CommandItem[] = [
    {
      label: "Gig Home",
      description: "KPIs, preview, command center",
      onClick: () => nav(ROUTE_PATHS.employeePlannerHome),
      primary: true,
    },
    {
      label: "Browse Projects",
      description: "Mega cards — pick your days",
      onClick: () => nav(ROUTE_PATHS.employeePlannerBrowse),
    },
    {
      label: "My Applications",
      description: "Plan bundle rows + breakdown",
      onClick: () => nav(ROUTE_PATHS.employeePlannerApplications),
    },
    {
      label: "Workspaces",
      description: "Confirmed plan days — crew chat",
      onClick: () => nav(ROUTE_PATHS.employeePlannerWorkspaces),
    },
    {
      label: "Earnings",
      description: "Project plan pay records",
      onClick: () => nav(ROUTE_PATHS.employeePlannerEarnings),
    },
    {
      label: "Profile",
      description: "Required before applying",
      onClick: () => nav(ROUTE_PATHS.employeeProfile),
    },
  ];

  return (
    <div className="wm-planner-card">
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>Gig Projects Hub</div>
      <p
        style={{ fontSize: 11, color: "var(--wm-neutral-500)", marginBottom: 12, lineHeight: 1.45 }}
      >
        Teal Gig domain only — never mixed with green Shift Jobs.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
          gap: 8,
        }}
      >
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
            }}
            onClick={cmd.onClick}
          >
            <span style={{ fontSize: 12, fontWeight: 800 }}>{cmd.label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.85, lineHeight: 1.35 }}>
              {cmd.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
