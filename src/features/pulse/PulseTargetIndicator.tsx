/** Job Mitra | PulseTargetIndicator.tsx | Row-host 6px bead in the leading column */

import type { CSSProperties } from "react";
import { useShallow } from "zustand/react/shallow";

import { PULSE_REGISTRY, type NotificationId, type PulseSectionId } from "./pulseRegistry";
import { usePulseStore } from "./pulseStore";
import { ARRIVAL_SUCCESS_TONE, getEdgeTone } from "./pulseEdgeTones";
import { PulseEdgeLight } from "./pulseEdgeVisuals";
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
 * Row-host bead in the first metadata column — never a gutter LED or strip.
 */
export function PulseTargetIndicator({
  notificationId,
  postId,
  appId,
  sectionId,
  severity,
  style,
}: PulseTargetIndicatorProps) {
  void style;
  const config = PULSE_REGISTRY[notificationId];

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
    mode === "arrival"
      ? ARRIVAL_SUCCESS_TONE
      : getEdgeTone({ eventId: notificationId, severity: toneSeverity });

  return (
    <PulseEdgeLight
      tone={tone}
      edgeMode="full"
      severity={toneSeverity}
      mode={mode}
      paintHost="row"
    />
  );
}
