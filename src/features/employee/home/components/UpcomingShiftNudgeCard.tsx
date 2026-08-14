/** Job Mitra | UpcomingShiftNudgeCard.tsx | Conditional upcoming-shift floating nudge */

import {
  useCallback,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  getUpcomingShiftNudgeSnapshot,
  nudgeAccentCssVar,
  setHomeNudgeDemoForce,
  subscribeUpcomingShiftNudge,
} from "../helpers/employeeHomeDynamicNudges.helpers";

const DISMISS_KEY = "wm_employee_upcoming_shift_nudge_dismissed_v1";

function readDismissedFingerprint(): string | null {
  try {
    return localStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
}

function writeDismissedFingerprint(fingerprint: string): void {
  try {
    localStorage.setItem(DISMISS_KEY, fingerprint);
  } catch {
    // Fail-silent
  }
}

export function UpcomingShiftNudgeCard() {
  const nav = useNavigate();
  const snap = useSyncExternalStore(
    subscribeUpcomingShiftNudge,
    getUpcomingShiftNudgeSnapshot,
    getUpcomingShiftNudgeSnapshot,
  );
  const [dismissedFp, setDismissedFp] = useState<string | null>(() => readDismissedFingerprint());

  const acknowledge = useCallback(() => {
    writeDismissedFingerprint(snap.fingerprint);
    setDismissedFp(snap.fingerprint);
    if (snap.isDemoForce) {
      setHomeNudgeDemoForce({ upcoming: false });
    }
  }, [snap.fingerprint, snap.isDemoForce]);

  const handleOpen = useCallback(() => {
    acknowledge();
    if (snap.isDemoForce) return;
    const nearest = snap.nearest;
    if (nearest?.workspaceId) {
      nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", nearest.workspaceId));
      return;
    }
    nav(ROUTE_PATHS.employeeShiftCenter);
  }, [acknowledge, nav, snap.isDemoForce, snap.nearest]);

  const handleDismiss = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      acknowledge();
    },
    [acknowledge],
  );

  if (snap.count <= 0) return null;
  if (dismissedFp === snap.fingerprint) return null;

  const detail = snap.nearest
    ? `${snap.nearest.jobName} · ${snap.nearest.companyName}`
    : snap.isDemoForce
      ? "Warehouse Helper · Demo Corp"
      : `${snap.count} shift${snap.count === 1 ? "" : "s"} this week`;

  const accent = nudgeAccentCssVar(snap.accentDomain);
  const style = {
    "--wm-nudge-accent": accent,
  } as CSSProperties;

  return (
    <div
      className="wm-homeDynamicNudge wm-homeDynamicNudge--shift"
      data-testid="upcoming-shift-nudge"
      data-nudge-domain={snap.accentDomain}
      style={style}
    >
      <span className="wm-homeDynamicNudge__pulse" aria-hidden="true" />
      <button
        type="button"
        className="wm-homeDynamicNudge__main"
        onClick={handleOpen}
        aria-label={`Upcoming shifts: ${detail}`}
      >
        <span className="wm-homeDynamicNudge__badge">Shift</span>
        <span className="wm-homeDynamicNudge__kicker">Upcoming shifts</span>
        <span className="wm-homeDynamicNudge__title">
          {snap.count} upcoming · {detail}
        </span>
      </button>
      <button
        type="button"
        className="wm-homeDynamicNudge__dismiss"
        aria-label="Dismiss upcoming shift reminder"
        onClick={handleDismiss}
      >
        ×
      </button>
    </div>
  );
}
