/** Pulse LED edge light + button halo — GPU core + arrival/static modes. */

import type { CSSProperties } from "react";
import type { PulseChainSeverity } from "./pulseTypes";
import {
  ARRIVAL_SUCCESS_TONE,
  getLedModeClassName,
  type PulseEdgeTone,
  type PulseVisualMode,
} from "./pulseEdgeTones";

type PulseEdgeMode = "full" | "floating";

type PulseLedStyle = CSSProperties & {
  readonly "--wm-led-color-a"?: string;
  readonly "--wm-led-color-b"?: string;
};

function getEdgeLightStyleFromTone({
  tone,
  edgeMode,
}: {
  readonly tone: PulseEdgeTone;
  readonly edgeMode: PulseEdgeMode;
}): PulseLedStyle {
  void edgeMode;
  return {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%) translateZ(0)",
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: tone.background,
    boxShadow: tone.shadow,
    zIndex: 30,
    pointerEvents: "none",
    flexShrink: 0,
    willChange: "opacity, transform",
    "--wm-led-color-a": tone.ledColorA,
    "--wm-led-color-b": tone.ledColorB,
  };
}

export function PulseEdgeLight({
  tone,
  edgeMode,
  severity,
  mode = "breathe",
}: {
  readonly tone: PulseEdgeTone;
  readonly edgeMode: PulseEdgeMode;
  readonly severity: PulseChainSeverity;
  readonly mode?: PulseVisualMode;
}) {
  const visualTone = mode === "arrival" ? ARRIVAL_SUCCESS_TONE : tone;

  return (
    <span
      aria-hidden="true"
      className={getLedModeClassName(severity, mode)}
      data-pulse-edge-mode={edgeMode}
      data-pulse-visual-mode={mode}
      style={getEdgeLightStyleFromTone({ tone: visualTone, edgeMode })}
    >
      <span className="wm-led__core" />
    </span>
  );
}

export function PulseButtonHalo({
  tone,
  mode = "breathe",
}: {
  readonly tone: PulseEdgeTone;
  readonly mode?: PulseVisualMode;
}) {
  const visualTone = mode === "arrival" ? ARRIVAL_SUCCESS_TONE : tone;
  const haloClass =
    mode === "arrival"
      ? "wm-breathe-arrival"
      : mode === "static"
        ? "wm-breathe-static"
        : "wm-breathe";

  const haloStyle: PulseLedStyle = {
    position: "absolute",
    top: -3,
    right: -3,
    bottom: -3,
    left: -3,
    borderRadius: "inherit",
    border: `2.5px solid ${visualTone.solid}`,
    boxShadow: mode === "static" ? `0 0 0 1px ${visualTone.ledColorA}` : visualTone.shadow,
    pointerEvents: "none",
    zIndex: 30,
    willChange: "opacity, transform",
    transform: "translateZ(0)",
    "--wm-led-color-a": visualTone.ledColorA,
    "--wm-led-color-b": visualTone.ledColorB,
  };

  return <span aria-hidden="true" className={haloClass} style={haloStyle} />;
}
