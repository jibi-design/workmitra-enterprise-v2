/** Job Mitra | UnifiedBroadcastNudgeBanner.tsx | Conditional unified alert/broadcast stream */

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
  getUnifiedBroadcastNudgeSnapshot,
  nudgeAccentCssVar,
  nudgeDomainTitle,
  setHomeNudgeDemoForce,
  subscribeUnifiedBroadcastNudge,
} from "../helpers/employeeHomeDynamicNudges.helpers";

const DISMISS_KEY = "wm_employee_unified_broadcast_nudge_dismissed_v1";

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

export function UnifiedBroadcastNudgeBanner() {
  const nav = useNavigate();
  const snap = useSyncExternalStore(
    subscribeUnifiedBroadcastNudge,
    getUnifiedBroadcastNudgeSnapshot,
    getUnifiedBroadcastNudgeSnapshot,
  );
  const [dismissedFp, setDismissedFp] = useState<string | null>(() => readDismissedFingerprint());

  const acknowledge = useCallback(() => {
    writeDismissedFingerprint(snap.fingerprint);
    setDismissedFp(snap.fingerprint);
    if (snap.isDemoForce) {
      setHomeNudgeDemoForce({ broadcastDomain: null });
    }
  }, [snap.fingerprint, snap.isDemoForce]);

  const handleOpen = useCallback(() => {
    acknowledge();
    if (snap.isDemoForce) return;
    if (snap.latest?.route) {
      nav(snap.latest.route);
      return;
    }
    if (snap.workspaceUnread > 0 && snap.notificationUnread === 0) {
      nav(ROUTE_PATHS.employeeShiftWorkspaces);
      return;
    }
    nav(ROUTE_PATHS.employeeNotifications);
  }, [
    acknowledge,
    nav,
    snap.isDemoForce,
    snap.latest,
    snap.notificationUnread,
    snap.workspaceUnread,
  ]);

  const handleDismiss = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      acknowledge();
    },
    [acknowledge],
  );

  if (snap.totalUnread <= 0) return null;
  if (dismissedFp === snap.fingerprint) return null;

  const accent = nudgeAccentCssVar(snap.accentDomain);
  const style = {
    "--wm-nudge-accent": accent,
  } as CSSProperties;
  const domainLabel = nudgeDomainTitle(snap.accentDomain);

  return (
    <div
      className="wm-homeDynamicNudge wm-homeDynamicNudge--broadcast"
      data-testid="unified-broadcast-nudge"
      data-nudge-domain={snap.accentDomain}
      role="status"
      style={style}
    >
      <button
        type="button"
        className="wm-homeDynamicNudge__main"
        onClick={handleOpen}
        aria-label={`${domainLabel} alerts: ${snap.label}`}
      >
        <span className="wm-homeDynamicNudge__pulse" aria-hidden="true" />
        <span className="wm-homeDynamicNudge__badge">{domainLabel}</span>
        <span className="wm-homeDynamicNudge__kicker">Alerts · {snap.totalUnread} unread</span>
        <span className="wm-homeDynamicNudge__title">{snap.label}</span>
      </button>
      <button
        type="button"
        className="wm-homeDynamicNudge__dismiss"
        aria-label="Dismiss alert banner"
        onClick={handleDismiss}
      >
        ×
      </button>
    </div>
  );
}
