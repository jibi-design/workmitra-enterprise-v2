/** Job Mitra | EmployeeJobCards.tsx | src/features/employee/home/components/EmployeeJobCards.tsx */

import { useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { IconCalendar, IconBriefcase } from "./employeeHomeIcons";
import { DESIGN_TOKENS } from "../../../../app/theme/designTokens";
import { plannerPublicIndex } from "../../../employer/planner/storage/plannerPublicIndex.storage";
// AUDIT: Corrected path to go up 3 levels to reach src/features/pulse
import { PulseNode } from "../../../pulse/PulseNode";

/**
/* Shift Jobs Card                                  */
/* ------------------------------------------------ */

export function ShiftJobsCard() {
  const nav = useNavigate();

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftCenter);
  }, [nav]);

  return (
    <PulseNode
      id="employee-home-shift-card"
      style={{ "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCard, width: "100%" }}
    >
      <section
        role="button"
        className="wm-press-card"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleOpen();
        }}
        style={{
          cursor: "pointer",
          position: "relative",
          padding: "var(--wm-card-padding)",
          borderRadius: "var(--wm-radius-employee-card)",
          background: "var(--wm-emp-glass-bg-strong)",
          border: "1px solid var(--wm-glass-border)",
          boxShadow: DESIGN_TOKENS.shadows.card,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(39, 174, 96, 0.08)",
              color: "#27AE60",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconCalendar />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h3 className="wm-typeCardTitle" style={{ letterSpacing: "-0.01em" }}>
              Shift Jobs
            </h3>
            <p className="wm-typeHelper">Browse & apply for shifts</p>
          </div>
        </div>
        <div style={{ color: "#CBD5E1", fontSize: 20 }}>→</div>
      </section>
    </PulseNode>
  );
}

function IconGigProjects() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 16H5V8h14v11ZM7 10h5v5H7z"
      />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Gig Projects (Demand Planner — employee)         */
/* ------------------------------------------------ */

export function GigProjectsCard() {
  const nav = useNavigate();

  const openProjectCount = useSyncExternalStore(
    plannerPublicIndex.subscribe,
    () => plannerPublicIndex.getActiveEntries().length,
    () => plannerPublicIndex.getActiveEntries().length,
  );

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeePlannerHome);
  }, [nav]);

  const subtitle =
    openProjectCount > 0
      ? `${openProjectCount} multi-day project${openProjectCount !== 1 ? "s" : ""} open`
      : "Browse agency project plans";

  return (
    <PulseNode
      id="employee-home-gig-projects-card"
      style={{ "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCard, width: "100%" }}
    >
      <section
        role="button"
        className="wm-press-card"
        tabIndex={0}
        aria-label={`Open Gig Projects. ${subtitle}.`}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleOpen();
        }}
        style={{
          cursor: "pointer",
          position: "relative",
          padding: "var(--wm-card-padding)",
          borderRadius: "var(--wm-radius-employee-card)",
          background: "var(--wm-emp-glass-bg-strong)",
          border: "1px solid var(--wm-glass-border)",
          boxShadow: DESIGN_TOKENS.shadows.card,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(8, 145, 178, 0.08)",
              color: "#0891B2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconGigProjects />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h3 className="wm-typeCardTitle" style={{ letterSpacing: "-0.01em" }}>
              Gig Projects
            </h3>
            <p className="wm-typeHelper">{subtitle}</p>
          </div>
        </div>
        <div style={{ color: "#CBD5E1", fontSize: 20 }}>→</div>
      </section>
    </PulseNode>
  );
}

/* ------------------------------------------------ */
/* Career Jobs Card                                 */
/* ------------------------------------------------ */

export function CareerJobsCard() {
  const nav = useNavigate();

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeCareerHome);
  }, [nav]);

  return (
    <PulseNode
      id="employee-home-career-card"
      style={{ "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCard, width: "100%" }}
    >
      <section
        role="button"
        className="wm-press-card"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleOpen();
        }}
        style={{
          cursor: "pointer",
          position: "relative",
          padding: "var(--wm-card-padding)",
          borderRadius: "var(--wm-radius-employee-card)",
          background: "var(--wm-emp-glass-bg-strong)",
          border: "1px solid var(--wm-glass-border)",
          boxShadow: DESIGN_TOKENS.shadows.card,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(79, 70, 229, 0.08)",
              color: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconBriefcase />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h3 className="wm-typeCardTitle" style={{ letterSpacing: "-0.01em" }}>
              Career Jobs
            </h3>
            <p className="wm-typeHelper">Find permanent roles</p>
          </div>
        </div>
        <div style={{ color: "#CBD5E1", fontSize: 20 }}>→</div>
      </section>
    </PulseNode>
  );
}
