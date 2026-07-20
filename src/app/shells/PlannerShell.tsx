/** Job Mitra | PlannerShell.tsx — Gig Projects (Agency Mode) content chrome */

import type { ReactNode } from "react";

type PlannerShellProps = {
  readonly children: ReactNode;
  readonly audience?: "employer" | "employee";
};

/**
 * Scoped layout wrapper for Gig Projects surfaces.
 * Employer routes use EmployerShell topbar chrome; this wraps page content only.
 */
export function PlannerShell({ children, audience = "employer" }: PlannerShellProps) {
  const variantClass = audience === "employer" ? "wm-er-vPlanner" : "wm-ee-vPlanner";

  return (
    <div
      className={`${variantClass} wm-planner-page wm-stackGrid`}
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      {children}
    </div>
  );
}
