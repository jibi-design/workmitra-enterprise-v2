// Job Mitra | PlannerEmployerCommandGrid.tsx | Planner-native actions only (P-SEP-2)
// Uses shared commandTile chrome — employer panel is one step ahead of employee hub.

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

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
      label: "Applications",
      description: "Plan bundle applicants — teal domain",
      onClick: () => nav(ROUTE_PATHS.employerPlannerApplications),
    },
    {
      label: "Roster",
      description: "Confirmed crew by plan day",
      onClick: () => nav(ROUTE_PATHS.employerPlannerRoster),
    },
  ];

  return (
    <section
      className="wm-planner-card wm-planner-commandPanel wm-planner-commandPanel--employer"
      data-testid="planner-employer-command-grid"
      aria-label="Planner command center"
    >
      <div className="wm-planner-sectionLabel">Agency command</div>
      <div className="wm-planner-sectionTitle">Demand Planner Hub</div>
      <p className="wm-planner-commandGridIntro">
        Gig Projects tools only — Shift Jobs hiring stays in the green Shift domain.
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
