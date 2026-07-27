/** Job Mitra | PulseIndicator.tsx | src/features/pulse/PulseIndicator.tsx */

import type { CSSProperties } from "react";

import { getEdgeTone, getLedModeClassName } from "./pulseEdgeTones";
import { PULSE_REGISTRY, type NotificationId } from "./pulseRegistry";
import type { PulseChainSeverity } from "./pulseTypes";
import { usePulseStore } from "./pulseStore";

type PulseIndicatorSeverity = PulseChainSeverity;

type PulseLedStyle = CSSProperties & {
  readonly "--wm-led-color-a"?: string;
  readonly "--wm-led-color-b"?: string;
};

interface PulseIndicatorProps {
  readonly notificationId: NotificationId;
  readonly active?: boolean;
  readonly severity?: PulseIndicatorSeverity;
  readonly style?: CSSProperties;
}

/**
 * Shows the global Pulse Navigation LED for notification-level cards.
 *
 * Renders only a 10px glass LED dot (left-edge chrome).
 * Does not dim siblings or blink the full card.
 */
export function PulseIndicator({
  notificationId,
  active,
  severity = "info",
  style,
}: PulseIndicatorProps) {
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
  const tone = getEdgeTone(String(notificationId), toneSeverity);

  const ledStyle: PulseLedStyle = {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%) translateZ(0)",
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: tone.background,
    boxShadow: tone.shadow,
    zIndex: 9999,
    pointerEvents: "none",
    willChange: "opacity, transform",
    "--wm-led-color-a": tone.ledColorA,
    "--wm-led-color-b": tone.ledColorB,
    ...style,
  };

  return (
    <span
      aria-hidden="true"
      className={getLedModeClassName(toneSeverity, mode)}
      data-pulse-visual-mode={mode}
      style={ledStyle}
    >
      <span className="wm-led__core" />
    </span>
  );
}
