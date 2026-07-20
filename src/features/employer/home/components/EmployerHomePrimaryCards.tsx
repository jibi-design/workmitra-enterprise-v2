/** Job Mitra | EmployerHomePrimaryCards.tsx | src/features/employer/home/components/EmployerHomePrimaryCards.tsx */

import { useCallback, type KeyboardEvent } from "react";
import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { DashboardData } from "../helpers/employerHomeDashboard";
import { IconCareer, IconPlanner, IconPlus, IconShift } from "./employerHomeIcons";
import { DESIGN_TOKENS } from "../../../../app/theme/designTokens";
import { PulseNode } from "../../../pulse/PulseNode";
import { demandPlannerStorage } from "../../planner/storage/demandPlannerStorage";

const ACTION_BTN: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "#FFFFFF",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  color: "#0F172A",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  cursor: "pointer",
  flexShrink: 0,
};

const CARD_STYLE_BASE: CSSProperties = {
  cursor: "pointer",
  position: "relative",
  width: "100%",
  boxSizing: "border-box",
  overflow: "hidden",
  padding: "var(--wm-card-padding)",
  borderRadius: "var(--wm-radius-employer-card)",
  background: "var(--wm-er-glass-bg-strong)",
  border: "1px solid var(--wm-glass-border)",
  boxShadow: DESIGN_TOKENS.shadows.cardEmployer,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const ICON_WRAP_BASE: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: "var(--wm-radius-chip)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

function runOnEnterOrSpace(event: KeyboardEvent<HTMLElement>, action: () => void): void {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  action();
}

export function CareerJobsCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();
  const handleOpen = useCallback(() => nav(ROUTE_PATHS.employerCareerHome), [nav]);
  const handleCreate = useCallback(() => nav(ROUTE_PATHS.employerCareerCreate), [nav]);

  return (
    <PulseNode
      id="home-career-card"
      className="w-full"
      style={{
        "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCardEmployer,
        width: "100%",
      }}
    >
      <section
        role="button"
        className="wm-press-card"
        aria-label={`Open Career Jobs. ${data.careerApplications} career applications and ${data.careerInterviews} interviews need review.`}
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(event) => runOnEnterOrSpace(event, handleOpen)}
        style={{
          ...CARD_STYLE_BASE,
          border: "1px solid rgba(79, 70, 229, 0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              ...ICON_WRAP_BASE,
              background: "rgba(79, 70, 229, 0.06)",
              color: "#4F46E5",
            }}
          >
            <IconCareer />
          </div>

          <div>
            <h3 className="wm-typeCardTitle">Career Jobs</h3>
            <p className="wm-typeHelperMd" style={{ marginTop: 2 }}>
              Manage hiring pipeline
            </p>
          </div>
        </div>

        <button
          type="button"
          className="wm-press-btn"
          aria-label="Create Career Job"
          onClick={(event) => {
            event.stopPropagation();
            handleCreate();
          }}
          style={ACTION_BTN}
        >
          <IconPlus />
        </button>
      </section>
    </PulseNode>
  );
}

export function ShiftJobsCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();

  const handleOpen = useCallback(() => nav(ROUTE_PATHS.employerShiftHome), [nav]);
  const handleCreate = useCallback(() => nav(ROUTE_PATHS.employerShiftCreate), [nav]);

  return (
    <PulseNode
      id="home-shift-card"
      className="w-full"
      style={{
        "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCardEmployer,
        width: "100%",
      }}
    >
      <section
        role="button"
        className="wm-press-card"
        aria-label={`Open Shift Jobs. ${data.shiftApplications} shift applications need review.`}
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(event) => runOnEnterOrSpace(event, handleOpen)}
        style={{
          ...CARD_STYLE_BASE,
          border: "1px solid rgba(39, 174, 96, 0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              ...ICON_WRAP_BASE,
              background: "rgba(39, 174, 96, 0.06)",
              color: "#27AE60",
            }}
          >
            <IconShift />
          </div>

          <div>
            <h3 className="wm-typeCardTitle">Shift Jobs</h3>
            <p className="wm-typeHelperMd" style={{ marginTop: 2 }}>
              Daily/weekly quick hiring
            </p>
          </div>
        </div>

        <button
          type="button"
          className="wm-press-btn"
          aria-label="Create Shift"
          onClick={(event) => {
            event.stopPropagation();
            handleCreate();
          }}
          style={ACTION_BTN}
        >
          <IconPlus />
        </button>
      </section>
    </PulseNode>
  );
}

export function DemandPlannerCard() {
  const nav = useNavigate();

  const activePlanCount = useSyncExternalStore(
    demandPlannerStorage.subscribe,
    () => demandPlannerStorage.getAll().filter((p) => p.status === "active").length,
    () => demandPlannerStorage.getAll().filter((p) => p.status === "active").length,
  );

  const handleOpen = useCallback(() => nav(ROUTE_PATHS.employerPlannerHome), [nav]);
  const handleCreate = useCallback(() => nav(ROUTE_PATHS.employerPlannerNew), [nav]);

  const meta =
    activePlanCount > 0
      ? `${activePlanCount} active project${activePlanCount !== 1 ? "s" : ""}`
      : "Multi-day agency hiring";

  return (
    <PulseNode
      id="home-planner-card"
      className="w-full"
      style={{
        "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCardEmployer,
        width: "100%",
      }}
    >
      <section
        role="button"
        className="wm-press-card"
        aria-label={`Open Gig Projects. ${meta}.`}
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(event) => runOnEnterOrSpace(event, handleOpen)}
        style={{
          ...CARD_STYLE_BASE,
          border: "1px solid rgba(8, 145, 178, 0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              ...ICON_WRAP_BASE,
              background: "rgba(8, 145, 178, 0.08)",
              color: "#0891B2",
            }}
          >
            <IconPlanner />
          </div>

          <div>
            <h3 className="wm-typeCardTitle">Gig Projects</h3>
            <p className="wm-typeHelperMd" style={{ marginTop: 2 }}>
              {meta}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="wm-press-btn"
          aria-label="Create new demand plan"
          onClick={(event) => {
            event.stopPropagation();
            handleCreate();
          }}
          style={ACTION_BTN}
        >
          <IconPlus />
        </button>
      </section>
    </PulseNode>
  );
}
