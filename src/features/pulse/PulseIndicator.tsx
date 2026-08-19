/** Job Mitra | PulseIndicator.tsx | Surface inset rail for notification cards */

import type { CSSProperties } from "react";

import { PulseEdgeLight } from "./pulseEdgeVisuals";
import { getEdgeTone } from "./pulseEdgeTones";
import { PULSE_REGISTRY, type NotificationId } from "./pulseRegistry";
import type { PulseChainSeverity } from "./pulseTypes";
import { usePulseStore } from "./pulseStore";

type PulseIndicatorSeverity = PulseChainSeverity;

interface PulseIndicatorProps {
  readonly notificationId: NotificationId;
  readonly active?: boolean;
  readonly severity?: PulseIndicatorSeverity;
  readonly style?: CSSProperties;
}

/**
 * Surface-host rail on notification-level cards.
 * Does not dim siblings or blink the card.
 */
export function PulseIndicator({
  notificationId,
  active,
  severity = "info",
  style,
}: PulseIndicatorProps) {
  void style;
  const isPulseActiveInStore = usePulseStore((state) => {
    return state.isPulseActive(notificationId);
  });
  const isResolving = usePulseStore((state) => state.resolvingNodeId === notificationId);
  const hasViewportBreathingPulse = usePulseStore((state) => state.chain.length > 0);

  const config = PULSE_REGISTRY[notificationId];

  if (!config) {
    if (import.meta.env.DEV) {
      console.warn(
        `[Pulse System]: Missing registry config for notificationId "${String(notificationId)}".`,
      );
    }

    return null;
  }

  const isCurrentlyLit = active === true || isPulseActiveInStore || isResolving;

  if (!isCurrentlyLit) {
    return null;
  }

  const mode = isResolving
    ? "arrival"
    : isPulseActiveInStore || (active === true && !hasViewportBreathingPulse)
      ? "breathe"
      : active === true && hasViewportBreathingPulse
        ? "static"
        : "breathe";

  const toneSeverity: PulseChainSeverity = isResolving ? "success" : severity;
  const tone = getEdgeTone({
    eventId: notificationId,
    severity: toneSeverity,
  });

  return (
    <PulseEdgeLight
      tone={tone}
      edgeMode="full"
      severity={toneSeverity}
      mode={mode}
      paintHost="surface"
    />
  );
}
