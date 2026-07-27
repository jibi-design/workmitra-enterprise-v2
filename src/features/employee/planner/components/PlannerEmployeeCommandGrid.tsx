// Job Mitra | PlannerEmployeeCommandGrid.tsx | Gig hub commands (striking enterprise tiles)
// Domain: Planner only — no Shift/Career imports, no plannerLegacyShiftBridge.

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
    <section
      className="wm-planner-card wm-planner-commandPanel"
      data-testid="planner-employee-command-grid"
      aria-label="Gig Projects command center"
    >
      <div className="wm-planner-sectionLabel">Command center</div>
      <div className="wm-planner-sectionTitle">Gig Projects Hub</div>
      <p className="wm-planner-commandGridIntro">
        Teal Gig domain only — never mixed with green Shift Jobs.
      </p>
      <div className="wm-planner-commandGrid" data-testid="planner-command-grid">
        {commands.map((cmd) => (
          <button
            key={cmd.label}
            type="button"
            className={`wm-planner-commandTile${cmd.primary ? " wm-planner-commandTile--primary" : ""}`}
            onClick={cmd.onClick}
            aria-label={`${cmd.label}. ${cmd.description}`}
          >
            <div className="wm-planner-commandTile__body">
              <div className="wm-planner-commandTile__label">{cmd.label}</div>
              <div className="wm-planner-commandTile__sep" aria-hidden="true">
                {" · "}
              </div>
              <div className="wm-planner-commandTile__desc">{cmd.description}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
