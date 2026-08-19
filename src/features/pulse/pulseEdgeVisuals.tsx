/** Solid high-intensity hardware bead — top-right inner, no ring graphic. */

import type { CSSProperties } from "react";
import type { PulseChainSeverity } from "./pulseTypes";
import { getBreathCssVars } from "./pulseBreathTokens";
import {
  ARRIVAL_SUCCESS_TONE,
  PULSE_LED_CORNER_INSET_PX,
  getLedModeClassName,
  type PulseEdgeTone,
  type PulseVisualMode,
} from "./pulseEdgeTones";

export type PulsePaintHost = "surface" | "row";
type PulseEdgeMode = "full" | "floating";

type PulseLedStyle = CSSProperties & {
  readonly "--wm-led-color-a"?: string;
  readonly "--wm-led-color-b"?: string;
  readonly "--wm-led-solid"?: string;
  readonly "--wm-pulse-period"?: string;
  readonly "--wm-pulse-hue"?: string;
  readonly "--wm-pulse-amp"?: string;
  readonly "--wm-pulse-amp-min"?: string;
  readonly "--wm-pulse-amp-max"?: string;
  readonly "--wm-pulse-scale-min"?: string;
  readonly "--wm-pulse-scale-max"?: string;
  readonly "--wm-pulse-gamma-inv"?: string;
  readonly "--wm-pulse-w125"?: string;
  readonly "--wm-pulse-w25"?: string;
  readonly "--wm-pulse-w375"?: string;
};

function getBeadHostStyle(breath: PulseLedStyle): PulseLedStyle {
  return {
    position: "absolute",
    top: PULSE_LED_CORNER_INSET_PX,
    right: PULSE_LED_CORNER_INSET_PX,
    left: "auto",
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "transparent",
    zIndex: 42,
    pointerEvents: "none",
    flexShrink: 0,
    ...breath,
  };
}

export function PulseEdgeLight({
  tone,
  edgeMode,
  severity,
  mode = "breathe",
  paintHost = "surface",
}: {
  readonly tone: PulseEdgeTone;
  readonly edgeMode: PulseEdgeMode;
  readonly severity: PulseChainSeverity;
  readonly mode?: PulseVisualMode;
  readonly paintHost?: PulsePaintHost;
}) {
  void edgeMode;
  const visualTone = mode === "arrival" ? ARRIVAL_SUCCESS_TONE : tone;
  const breath = getBreathCssVars(
    mode === "arrival" ? "success" : severity,
    mode,
    visualTone.solid,
  );

  return (
    <span
      aria-hidden="true"
      className={getLedModeClassName(severity, mode)}
      data-pulse-edge-mode={edgeMode}
      data-pulse-visual-mode={mode}
      data-pulse-breath="pro-v1"
      data-pulse-paint={paintHost}
      data-pulse-arrival={mode === "arrival" ? "pro-v3" : undefined}
      data-pulse-edge-anchor="top-right"
      data-pulse-final={mode === "destination" ? "true" : undefined}
      style={getBeadHostStyle({
        "--wm-led-color-a": visualTone.ledColorA,
        "--wm-led-color-b": visualTone.ledColorB,
        "--wm-led-solid": visualTone.solid,
        ...breath,
      })}
    >
      <span className="wm-led__core" />
    </span>
  );
}

export function PulseButtonHalo({
  tone,
  severity = "info",
  mode = "breathe",
}: {
  readonly tone: PulseEdgeTone;
  readonly severity?: PulseChainSeverity;
  readonly mode?: PulseVisualMode;
}) {
  const visualTone = mode === "arrival" ? ARRIVAL_SUCCESS_TONE : tone;
  const haloClass =
    mode === "arrival"
      ? "wm-breathe-arrival"
      : mode === "destination"
        ? "wm-breathe-destination"
        : mode === "static"
          ? "wm-breathe-static"
          : "wm-breathe";

  const breath = getBreathCssVars(
    mode === "arrival" ? "success" : severity,
    mode,
    visualTone.solid,
  );

  const haloStyle: PulseLedStyle = {
    position: "absolute",
    top: -2,
    right: -2,
    bottom: -2,
    left: -2,
    borderRadius: "inherit",
    border: `1.5px solid ${visualTone.solid}`,
    boxShadow: `0 0 6px 0 ${visualTone.ledColorB}`,
    pointerEvents: "none",
    zIndex: 30,
    willChange: "opacity, transform",
    transform: "translateZ(0)",
    "--wm-led-color-a": visualTone.ledColorA,
    "--wm-led-color-b": visualTone.ledColorB,
    ...breath,
  };

  return (
    <span
      aria-hidden="true"
      className={haloClass}
      data-pulse-breath="pro-v1"
      data-pulse-paint="control"
      data-pulse-arrival={mode === "arrival" ? "pro-v3" : undefined}
      style={haloStyle}
    />
  );
}
