/** Job Mitra | PulseTargetIndicator.tsx | src/features/pulse/PulseTargetIndicator.tsx */

import type { CSSProperties } from "react";

import { PULSE_REGISTRY, type NotificationId, type PulseSectionId } from "./pulseRegistry";
import { usePulseStore } from "./pulseStore";

type PulseTargetSeverity = "info" | "success" | "warning" | "urgent";

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
  if (requestedValue === undefined) {
    return true;
  }

  return requestedValue === trailValue;
};

function getPulseTargetEdgeLightStyle(
  severity: PulseTargetSeverity,
  style?: CSSProperties,
): CSSProperties {
  const isWarningTone = severity === "urgent" || severity === "warning";

  return {
    position: "absolute",
    insetBlock: 0,
    left: 0,
    width: 8,
    borderTopLeftRadius: "inherit",
    borderBottomLeftRadius: "inherit",
    background: isWarningTone ? "#f59e0b" : "#10b981",
    boxShadow: isWarningTone ? "0 0 18px rgba(245,158,11,0.9)" : "0 0 18px rgba(16,185,129,0.9)",
    zIndex: 9999,
    pointerEvents: "none",
    ...style,
  };
}

/**
 * Shows a target-specific Pulse Navigation edge light.
 *
 * Use this when the pulse must appear only for one post, application,
 * section, or card. It never renders LED balls or full-card blinking.
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

  const isTargetActive = usePulseStore((state) => {
    return Object.values(state.activeTrails).some((trail) => {
      if (trail.status !== "TRAIL_STARTED") {
        return false;
      }

      if (trail.eventId !== notificationId) {
        return false;
      }

      return (
        doesRequestedTargetMatch(postId, trail.targetParams?.postId) &&
        doesRequestedTargetMatch(appId, trail.targetParams?.appId) &&
        doesRequestedTargetMatch(sectionId, trail.targetParams?.sectionId)
      );
    });
  });

  if (!config || !isTargetActive) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="motion-safe:animate-pulse motion-reduce:animate-none"
      style={getPulseTargetEdgeLightStyle(severity, style)}
    />
  );
}
