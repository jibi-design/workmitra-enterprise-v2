/** Job Mitra | StateOverlay.tsx | src/shared/components/layout/StateOverlay.tsx */

import type { ReactNode } from "react";

interface StateOverlayProps {
  type: "loading" | "empty" | "error";
  title?: string;
  message?: string;
  action?: ReactNode;
}

export function StateOverlay({ type, title, message, action }: StateOverlayProps) {
  const isLoader = type === "loading";

  return (
    <div className={`wm-stateOverlay wm-stateOverlay-${type}`}>
      {isLoader ? (
        <div className="wm-stateOverlaySpinner" aria-label="Loading" />
      ) : (
        <div className="wm-stateOverlayIcon" aria-hidden="true">
          <StateIcon />
        </div>
      )}

      <h3 className="wm-stateOverlayTitle">
        {title || (isLoader ? "Loading data..." : "No results found")}
      </h3>

      {message && <p className="wm-stateOverlayMessage">{message}</p>}

      {action && <div className="wm-stateOverlayAction">{action}</div>}
    </div>
  );
}

function StateIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
