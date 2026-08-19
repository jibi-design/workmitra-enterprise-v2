/** Sprint 3 — honor Super Admin maintenance / lockdown / kill switches. */

import { useEffect, type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { JobMitraBrandName } from "../components/brand/BrandName";
import { startRuntimeOpsFlagsPoll } from "./runtimeOpsFlags";
import { useRuntimeOpsFlags } from "./useRuntimeOpsFlags";

/** Call once near app root. */
export function RuntimeOpsBootstrap(): null {
  useEffect(() => {
    startRuntimeOpsFlagsPoll();
  }, []);
  return null;
}

/**
 * Full-screen calm gate when maintenance or lockdown is ON.
 * Lockdown also blocks (same UX — apps must not operate).
 * Break-glass: in-app /admin Super-Admin plane stays reachable.
 */
export function RuntimeOpsMaintenanceGate({ children }: { children: ReactNode }): ReactNode {
  const flags = useRuntimeOpsFlags();
  const path =
    typeof window !== "undefined" ? window.location.pathname || "" : "";
  const adminBreakGlass = path === "/admin" || path.startsWith("/admin/");

  if (adminBreakGlass) return children;
  if (!flags.maintenanceMode && !flags.lockdown) return children;

  const title = flags.lockdown ? "Platform temporarily locked" : "Maintenance in progress";
  const body = flags.lockdown ? (
    <>
      <JobMitraBrandName size="sm" /> is in lockdown for safety. Please try again later.
    </>
  ) : (
    <>
      <JobMitraBrandName size="sm" /> is under planned maintenance. Please try again shortly.
    </>
  );

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background:
          "radial-gradient(1200px 600px at 50% -10%, #1e3a5f 0%, #0b1220 55%, #070b14 100%)",
        color: "#e8eef7",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
        "--wm-brand-mitra-current": "var(--wm-brand-mitra-on-dark, #ffffff)",
      } as React.CSSProperties}
    >
      <div style={{ maxWidth: 420 }}>
        <p style={{ letterSpacing: "0.04em", fontSize: 14, marginBottom: 8 }}>
          <JobMitraBrandName size="md" />
        </p>
        <h1 style={{ fontSize: "1.6rem", margin: "0.75rem 0" }}>{title}</h1>
        <p style={{ opacity: 0.85, lineHeight: 1.5 }}>{body}</p>
      </div>
    </div>
  );
}

type KillKey = "shift" | "career" | "planner";

export function RuntimeKillBoundary({
  kill,
  buildEnabled,
  fallback,
}: {
  kill: KillKey;
  buildEnabled: boolean;
  fallback: string;
}): ReactNode {
  const flags = useRuntimeOpsFlags();
  const killed =
    kill === "shift" ? flags.killShift : kill === "career" ? flags.killCareer : flags.killPlanner;
  const enabled = buildEnabled && !killed;
  return enabled ? <Outlet /> : <Navigate to={fallback} replace />;
}
