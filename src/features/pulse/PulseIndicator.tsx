/** Job Mitra | PulseIndicator.tsx | src/features/pulse/PulseIndicator.tsx */

import type { CSSProperties } from "react";

import { PULSE_REGISTRY, type NotificationId } from "./pulseRegistry";
import { usePulseStore } from "./pulseStore";

type PulseIndicatorSeverity = "info" | "success" | "warning" | "urgent";

interface PulseIndicatorProps {
  readonly notificationId: NotificationId;
  readonly active?: boolean;
  readonly severity?: PulseIndicatorSeverity;
  readonly style?: CSSProperties;
}

function getPulseEdgeLightStyle(
  severity: PulseIndicatorSeverity,
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
 * Shows the global Pulse Navigation edge light for notification-level cards.
 *
 * This component intentionally renders only a full-height left edge light.
 * It does not render LED balls, dim siblings, or blink the full card.
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

  const config = PULSE_REGISTRY[notificationId];

  if (!config) {
    if (import.meta.env.DEV) {
      console.warn(
        `[Pulse System]: Missing registry config for notificationId "${String(notificationId)}".`,
      );
    }

    return null;
  }

  const isCurrentlyLit = active === true || isPulseActiveInStore;

  if (!isCurrentlyLit) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="motion-safe:animate-pulse motion-reduce:animate-none"
      style={getPulseEdgeLightStyle(severity, style)}
    />
  );
}
