/** Job Mitra | PulseTargetIndicator.tsx | Destination LED (single 10px dot — never strip) */

import type { CSSProperties } from "react";
import { useShallow } from "zustand/react/shallow";

import { PULSE_REGISTRY, type NotificationId, type PulseSectionId } from "./pulseRegistry";
import { usePulseStore } from "./pulseStore";
import { ARRIVAL_SUCCESS_TONE, getEdgeTone, getLedModeClassName } from "./pulseEdgeTones";
import type { PulseChainSeverity } from "./pulseTypes";

type PulseTargetSeverity = PulseChainSeverity;

interface PulseTargetIndicatorProps {
  readonly notificationId: NotificationId;
  readonly postId?: string;
  readonly appId?: string;
  readonly sectionId?: PulseSectionId;
  readonly severity?: PulseTargetSeverity;
  readonly style?: CSSProperties;
}

const doesRequestedTargetMatch = (
  requestedValue: string | undefined,
  trailValue: string | undefined,
): boolean => {
  if (requestedValue === undefined) return true;
  return requestedValue === trailValue;
};

/**
 * Target-specific left-edge pulse LED (single circular light).
 * Never full-card blink. Never full-height strip (board LED rule).
 */
export function PulseTargetIndicator({
  notificationId,
  postId,
  appId,
  sectionId,
  severity = "info",
  style,
}: PulseTargetIndicatorProps) {
  const config = PULSE_REGISTRY[notificationId];

  // useShallow: selector must not return a fresh object each call (infinite re-render).
  const trailState = usePulseStore(
    useShallow((state) => {
      for (const trail of Object.values(state.activeTrails)) {
        if (trail.eventId !== notificationId) continue;
        const matches =
          doesRequestedTargetMatch(postId, trail.targetParams?.postId) &&
          doesRequestedTargetMatch(appId, trail.targetParams?.appId) &&
          doesRequestedTargetMatch(sectionId, trail.targetParams?.sectionId);
        if (!matches) continue;
        return { status: trail.status, severity: trail.severity };
      }
      return null;
    }),
  );

  if (!config || !trailState) return null;

  const mode =
    trailState.status === "RESOLVING"
      ? "arrival"
      : trailState.status === "TRAIL_STARTED"
        ? "breathe"
        : "static";

  const toneSeverity = mode === "arrival" ? "success" : (severity ?? trailState.severity);
  const tone =
    mode === "arrival" ? ARRIVAL_SUCCESS_TONE : getEdgeTone(String(notificationId), toneSeverity);

  return (
    <span
      aria-hidden="true"
      className={getLedModeClassName(toneSeverity, mode)}
      data-pulse-visual-mode={mode}
      data-testid="pulse-target-led"
      style={{
        position: "absolute",
        left: 12,
        top: "50%",
        transform: "translateY(-50%) translateZ(0)",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: tone.background ?? tone.solid,
        boxShadow: tone.shadow,
        zIndex: 9999,
        pointerEvents: "none",
        willChange: "opacity, transform",
        flexShrink: 0,
        ...style,
      }}
    >
      <span className="wm-led__core" style={{ background: tone.solid, boxShadow: tone.shadow }} />
    </span>
  );
}
